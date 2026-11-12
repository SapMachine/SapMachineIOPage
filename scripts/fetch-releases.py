#!/usr/bin/env python3
"""
Syncs tool YAML files and release versions for diagnostic tools.

1. Reads data/diagnostic-tools/tool-registry.yaml — the list of upstream tool repos
   and their groups.
   Only entries with a 'repo' field are fetched; 'name'-only entries are locally defined.
2. For each repo, fetches .tool.yaml from GitHub and writes/updates
   data/diagnostic-tools/tools/<id>.yaml — ONLY for tools listed in tool-registry.yaml.
   SAP-specific tool files not in tool-registry.yaml are never touched.
3. Removes data/diagnostic-tools/tools/<id>.yaml for tools that were previously
   fetched but are no longer in tool-registry.yaml (i.e. removed from the registry).
4. Updates data/diagnostic-tools/releases.json with latest versions from
   GitHub releases, crates.io, or Maven Central.

Exit codes:
  0 — success (even if nothing changed)
  1 — one or more entries failed to resolve AND had no prior cached version
"""

import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

import requests
import yaml

ROOT      = Path(__file__).resolve().parent.parent
DATA_DIR  = ROOT / "data" / "diagnostic-tools"
TOOLS_DIR = DATA_DIR / "tools"
REPOS_YAML    = DATA_DIR / "tool-registry.yaml"
RELEASES_JSON = DATA_DIR / "releases.json"
NAMES_YAML    = DATA_DIR / "tool-names.yaml"

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")

ROLLING_TAGS = re.compile(r"^(snapshot|nightly|latest|rc[\d.-]|alpha[\d.-]|beta[\d.-])", re.IGNORECASE)
CHANGELOG_MAX_LINES = 8
REQUIRED_FIELDS = {"tag", "tagline", "tagline_short"}


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

def _get(url: str, headers: dict | None = None, timeout: int = 10, retries: int = 3) -> requests.Response:
    headers = headers or {}
    delay = 2.0
    for attempt in range(retries):
        try:
            resp = requests.get(url, headers=headers, timeout=timeout)
            if resp.status_code in (429, 500, 502, 503, 504) and attempt < retries - 1:
                retry_after = float(resp.headers.get("Retry-After", delay))
                time.sleep(min(retry_after, 60))
                delay *= 2
                continue
            return resp
        except requests.exceptions.Timeout:
            if attempt < retries - 1:
                time.sleep(delay)
                delay *= 2
                continue
            raise
    raise RuntimeError(f"GET {url} failed after {retries} attempts")


def _run(cmd: list[str], timeout: int = 30) -> str | None:
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return result.stdout if result.returncode == 0 else None
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return None


# ---------------------------------------------------------------------------
# Tool YAML fetching
# ---------------------------------------------------------------------------

def _repo_id(repo_url: str) -> str:
    return repo_url.rstrip("/").split("/")[-1]


def _raw_url(repo_url: str, filename: str) -> str:
    parts = repo_url.rstrip("/").replace("https://github.com/", "")
    return f"https://raw.githubusercontent.com/{parts}/HEAD/{filename}"


def fetch_readme_h1(repo_url: str) -> str | None:
    """Return the first H1 text from a repo's README that looks like a project name, or None."""
    headers = {}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"
    for filename in ("README.md", "readme.md", "Readme.md"):
        url = _raw_url(repo_url, filename)
        try:
            resp = _get(url, headers=headers, timeout=10)
            if resp.status_code == 404:
                continue
            resp.raise_for_status()
            in_fence = False
            prev = ""
            for line in resp.text.splitlines():
                if line.startswith("```"):
                    in_fence = not in_fence
                    prev = ""
                    continue
                if in_fence:
                    continue
                # Setext-style H1: previous line is the title, this line is ===...
                if re.match(r"^=+\s*$", line) and prev.strip():
                    return prev.strip()
                m = re.match(r"^#\s+(.+)", line)
                if m:
                    h1 = m.group(1).strip()
                    if len(h1) > 60 or re.search(r"\d{3,}", h1) or h1.endswith((".", "!", "?")):
                        return None
                    return h1
                prev = line
        except requests.RequestException:
            continue
    return None


def fetch_tool_yaml(repo_url: str) -> dict | None:
    url = _raw_url(repo_url, ".tool.yaml")
    headers = {}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"
    try:
        resp = _get(url, headers=headers, timeout=15)
        if resp.status_code == 404:
            print(f"  WARNING: .tool.yaml not found in {repo_url}", file=sys.stderr)
            return None
        resp.raise_for_status()
    except requests.RequestException as exc:
        print(f"  WARNING: network error fetching {repo_url}: {exc}", file=sys.stderr)
        return None

    try:
        data = yaml.safe_load(resp.text)
    except yaml.YAMLError as exc:
        print(f"  WARNING: YAML parse error in {repo_url}/.tool.yaml: {exc}", file=sys.stderr)
        return None

    if not isinstance(data, dict):
        print(f"  WARNING: .tool.yaml in {repo_url} is not a mapping", file=sys.stderr)
        return None

    missing = REQUIRED_FIELDS - data.keys()
    if missing:
        print(f"  WARNING: .tool.yaml in {repo_url} missing required fields: {', '.join(sorted(missing))}", file=sys.stderr)
        return None

    return data


# ---------------------------------------------------------------------------
# Release version fetching
# ---------------------------------------------------------------------------

def process_changelog(body: str) -> str:
    if not body:
        return ""
    lines = []
    for line in body.splitlines():
        stripped = line.strip()
        if stripped.startswith("#"):
            continue
        if stripped.startswith(("- ", "* ")):
            lines.append(stripped[2:].strip())
            if len(lines) >= CHANGELOG_MAX_LINES:
                break
    result = " · ".join(lines)
    return result[:597] + "…" if len(result) > 600 else result


def fetch_from_crates_io(crate_name: str) -> dict | None:
    url = f"https://crates.io/api/v1/crates/{crate_name}"
    headers = {"User-Agent": "sapmachine-site-builder/1.0 (https://sapmachine.io)"}
    try:
        resp = _get(url, headers=headers)
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        data = resp.json()
        version = data.get("crate", {}).get("newest_version", "")
        if not version:
            return None
        date = ""
        for v in data.get("versions", []):
            if v.get("num") == version:
                date = (v.get("created_at") or "")[:10]
                break
        return {"version": version, "date": date, "changelog": ""}
    except Exception as exc:
        print(f"  crates.io lookup failed for {crate_name}: {exc}", file=sys.stderr)
        return None


def fetch_cargo(crate_name: str) -> dict | None:
    out = _run(["cargo", "search", "--limit", "1", crate_name])
    if out:
        m = re.match(rf'^{re.escape(crate_name)}\s*=\s*"([^"]+)"', out.strip())
        if m:
            return {"version": m.group(1), "date": "", "changelog": ""}
    return fetch_from_crates_io(crate_name)


def fetch_from_maven_central(coordinates: str) -> dict | None:
    parts = coordinates.split(":", 1)
    if len(parts) != 2:
        print(f"  WARNING: malformed maven_coordinates '{coordinates}' (expected 'group:artifact')", file=sys.stderr)
        return None
    group_id, artifact_id = parts
    group_path = group_id.replace(".", "/")
    url = f"https://repo1.maven.org/maven2/{group_path}/{artifact_id}/maven-metadata.xml"
    try:
        resp = _get(url)
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        m = re.search(r"<release>([^<]+)</release>", resp.text) or re.search(r"<latest>([^<]+)</latest>", resp.text)
        if not m:
            return None
        version = m.group(1).strip()
        pom_url = f"https://repo1.maven.org/maven2/{group_path}/{artifact_id}/{version}/{artifact_id}-{version}.pom"
        date = ""
        try:
            lm = requests.head(pom_url, timeout=10).headers.get("last-modified", "")
            if lm:
                from email.utils import parsedate_to_datetime
                date = parsedate_to_datetime(lm).strftime("%Y-%m-%d")
        except Exception:
            pass
        return {"version": version, "date": date, "changelog": ""}
    except Exception as exc:
        print(f"  Maven Central lookup failed for {coordinates}: {exc}", file=sys.stderr)
        return None


def fetch_from_github(tool_id: str, github_url: str = "") -> dict | None:
    if github_url:
        parts = github_url.rstrip("/").split("/")
        repo_path = f"{parts[3]}/{parts[4]}"
    else:
        print(f"  WARNING: no github_url for {tool_id}, skipping GitHub release fetch", file=sys.stderr)
        return None

    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    try:
        resp = _get(f"https://api.github.com/repos/{repo_path}/releases/latest", headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            tag = data.get("tag_name", "")
            if not ROLLING_TAGS.match(tag) and not data.get("prerelease") and not data.get("draft"):
                return {
                    "version": tag,
                    "date": (data.get("published_at") or "")[:10],
                    "changelog": process_changelog(data.get("body", "")),
                }
    except Exception as exc:
        print(f"  GitHub /releases/latest failed for {repo_path}: {exc}", file=sys.stderr)
        return None

    try:
        resp2 = _get(f"https://api.github.com/repos/{repo_path}/releases?per_page=20", headers=headers)
        if resp2.status_code == 200:
            for rel in resp2.json():
                if rel.get("prerelease") or rel.get("draft"):
                    continue
                tag = rel.get("tag_name", "")
                if ROLLING_TAGS.match(tag):
                    continue
                return {
                    "version": tag,
                    "date": (rel.get("published_at") or "")[:10],
                    "changelog": process_changelog(rel.get("body", "")),
                }
    except Exception as exc:
        print(f"  GitHub releases list failed for {repo_path}: {exc}", file=sys.stderr)

    return None


def fetch_latest_release(entry: dict) -> dict | None:
    tool_id = entry["id"]
    if cargo := entry.get("cargo_crate"):
        result = fetch_cargo(cargo)
        if result:
            return result
        print(f"  {tool_id}: cargo/crates.io miss, falling back to GitHub", file=sys.stderr)
    if maven := entry.get("maven_coordinates"):
        result = fetch_from_maven_central(maven)
        if result:
            return result
        print(f"  {tool_id}: Maven Central miss, falling back to GitHub", file=sys.stderr)
    return fetch_from_github(tool_id, entry.get("github_url", ""))


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def load_repos() -> list[dict]:
    """Load tool-registry.yaml — return only entries that have a 'repo' field (upstream tools)."""
    if not REPOS_YAML.exists():
        print(f"ERROR: {REPOS_YAML} not found", file=sys.stderr)
        sys.exit(1)
    data = yaml.safe_load(REPOS_YAML.read_text()) or []
    return [entry for entry in data if entry.get("repo")]


def main():
    repos = load_repos()
    repo_ids = {_repo_id(entry["repo"]) for entry in repos}

    # Identify which tool files were previously fetched (not SAP-specific).
    # A file is "fetched" if its id matches a repo name from any known upstream.
    # We track this via a sidecar set written alongside tool-repos.yaml.
    fetched_ids_path = DATA_DIR / ".fetched-ids"
    previously_fetched = set(fetched_ids_path.read_text().splitlines()) if fetched_ids_path.exists() else set()

    TOOLS_DIR.mkdir(parents=True, exist_ok=True)

    # Step 1: fetch and write/update tool YAML files
    print("\n[sync tool YAMLs]")
    successfully_fetched = set()
    all_tools = []

    for entry in repos:
        repo_url = entry["repo"]
        group = entry["group"]
        tool_id = _repo_id(repo_url)

        data = fetch_tool_yaml(repo_url)
        if data is None:
            # Keep existing file if present
            existing = TOOLS_DIR / f"{tool_id}.yaml"
            if existing.exists():
                print(f"  {tool_id}: fetch failed — keeping existing file")
                all_tools.append(yaml.safe_load(existing.read_text()))
                successfully_fetched.add(tool_id)
            else:
                print(f"  {tool_id}: fetch failed — no existing file", file=sys.stderr)
            continue

        merged = {"id": tool_id, "group": group, **data}
        dest = TOOLS_DIR / f"{tool_id}.yaml"
        new_content = yaml.dump(merged, allow_unicode=True, default_flow_style=False, sort_keys=False, width=120)

        if dest.exists() and dest.read_text() == new_content:
            print(f"  {tool_id}: unchanged")
        else:
            dest.write_text(new_content)
            print(f"  {tool_id}: {'updated' if dest.exists() else 'added'}")

        all_tools.append(merged)
        successfully_fetched.add(tool_id)

    # Step 1b: fetch README h1 for each repo and update tool-names.yaml
    print("\n[fetch tool names from README h1]")
    existing_names: dict = {}
    if NAMES_YAML.exists():
        existing_names = yaml.safe_load(NAMES_YAML.read_text()) or {}
    updated_names = dict(existing_names)
    for entry in repos:
        repo_url = entry["repo"]
        tool_id = _repo_id(repo_url)
        h1 = fetch_readme_h1(repo_url)
        if h1:
            if updated_names.get(tool_id) != h1:
                print(f"  {tool_id}: {existing_names.get(tool_id)!r} → {h1!r}")
                updated_names[tool_id] = h1
            else:
                print(f"  {tool_id}: {h1!r} (unchanged)")
        else:
            print(f"  {tool_id}: README h1 not found — keeping existing name")
    if updated_names != existing_names:
        comment = (
            "# Maps tool id -> display name (the project's real name, usually the README h1).\n"
            "# Committed as a baseline; fetch-releases.py updates this automatically from each\n"
            "# repo's README when it runs.\n\n"
        )
        NAMES_YAML.write_text(comment + yaml.dump(updated_names, allow_unicode=True, default_flow_style=False, sort_keys=True))
        print(f"Updated {NAMES_YAML.relative_to(ROOT)}")

    # Step 2: remove tool files for repos no longer in tool-repos.yaml    print("\n[remove stale tool YAMLs]")
    removed = []
    for tool_file in sorted(TOOLS_DIR.glob("*.yaml")):
        fid = tool_file.stem
        if fid in repo_ids:
            continue  # still registered
        if fid not in previously_fetched:
            continue  # SAP-specific file — never touch it
        tool_file.unlink()
        print(f"  {fid}: removed (no longer in tool-repos.yaml)")
        removed.append(fid)

    # Update the fetched-ids sidecar
    fetched_ids_path.write_text("\n".join(sorted(successfully_fetched)))

    # Also load SAP-specific tools (not in repos list) for releases
    for tool_file in sorted(TOOLS_DIR.glob("*.yaml")):
        fid = tool_file.stem
        if fid not in repo_ids and fid not in {t["id"] for t in all_tools}:
            tool = yaml.safe_load(tool_file.read_text())
            if tool:
                all_tools.append(tool)

    # Step 3: update releases.json
    print("\n[fetch releases]")
    existing_releases: dict = {}
    if RELEASES_JSON.exists():
        existing_releases = json.loads(RELEASES_JSON.read_text()).get("entries", {})

    new_entries = dict(existing_releases)
    n_updated = n_unchanged = n_failed = 0

    for tool in all_tools:
        tool_id = tool["id"]
        if tool.get("no_release"):
            continue
        result = fetch_latest_release(tool)
        if result is None:
            prev = existing_releases.get(tool_id)
            if prev:
                print(f"  {tool_id}: fetch failed — keeping cached {prev['version']}")
                n_unchanged += 1
            else:
                print(f"  {tool_id}: fetch failed — no cached version", file=sys.stderr)
                n_failed += 1
                new_entries.setdefault(tool_id, {"version": "", "date": "", "changelog": ""})
            continue
        prev = existing_releases.get(tool_id, {})
        if result["version"] != prev.get("version"):
            print(f"  {tool_id}: {prev.get('version', 'none')} → {result['version']}")
            n_updated += 1
        else:
            print(f"  {tool_id}: {result['version']} (unchanged)")
            n_unchanged += 1
        new_entries[tool_id] = result

    # Remove releases for tools that were removed
    for fid in removed:
        new_entries.pop(fid, None)

    print(f"\nReleases: {n_updated} updated, {n_unchanged} unchanged, {n_failed} failed")

    if n_updated > 0:
        RELEASES_JSON.write_text(json.dumps({"entries": new_entries}, indent=2) + "\n")
        print(f"Written {RELEASES_JSON.relative_to(ROOT)}")
    else:
        print("No release versions changed — skipping write.")

    if n_failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
