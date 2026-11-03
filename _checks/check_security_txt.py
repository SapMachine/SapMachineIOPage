#!/usr/bin/env python3
# Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.

"""Fetch and validate /.well-known/security.txt for the site under test.

Single source of truth for the security.txt check — used by both the live-site
workflow (site-checks.yml) and the PR preview workflow (preview-and-test-pr.yml).

Environment:
  SITE_URL  (required) base URL, with or without a trailing slash.
  GH_TOKEN  (optional) if set, sent as `Authorization: token <token>`. Needed for
            the auth-gated live host; omit it when checking a local build.
"""
import sys
import re
import subprocess
import os
from datetime import datetime, timezone

base = os.environ["SITE_URL"].rstrip("/")
URL = base + "/.well-known/security.txt"
TOKEN = os.environ.get("GH_TOKEN", "")

cmd = ["curl", "-sfL", "--max-time", "30"]
if TOKEN:
    cmd += ["-H", f"Authorization: token {TOKEN}"]
cmd.append(URL)

result = subprocess.run(cmd, capture_output=True, text=True)
if result.returncode != 0:
    print(f"::error::Failed to fetch {URL} (curl exit code {result.returncode})")
    print(result.stderr)
    sys.exit(1)

content = result.stdout
print(f"Fetched {URL} — {len(content)} bytes")

# Guard: if the response looks like HTML it's a redirect/404/login page, not security.txt
if content.lstrip().startswith("<"):
    print(f"::error::Response from {URL} appears to be HTML, not a security.txt file.")
    print(f"::error::First 200 chars: {content[:200].strip()!r}")
    sys.exit(1)

errors = []

if "Contact:" not in content:
    errors.append('Missing required "Contact:" field in security.txt')

expires_match = re.search(r"^Expires:\s*(.+)$", content, re.MULTILINE)
if not expires_match:
    errors.append('Missing required "Expires:" field in security.txt')
else:
    expires_str = expires_match.group(1).strip()
    try:
        expires = datetime.fromisoformat(expires_str.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        days = (expires - now).days
        if days < 0:
            errors.append(
                f"security.txt expired {abs(days)} day(s) ago on {expires_str}. "
                "Please update the Expires field."
            )
        elif days <= 60:
            print(
                f"::warning::security.txt expires in {days} day(s) ({expires_str}). "
                "Consider renewing it soon."
            )
        else:
            print(f"security.txt expires in {days} days ({expires_str}) — OK")
    except ValueError as exc:
        errors.append(f'Cannot parse Expires field "{expires_str}": {exc}')

for msg in errors:
    print(f"::error::{msg}")
if errors:
    sys.exit(1)
