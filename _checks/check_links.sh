#!/usr/bin/env bash
# Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.

# Dead-link crawl with muffet.
#
# Single source of truth for the link check (including the --exclude list) —
# used by both the live-site workflow (site-checks.yml) and the PR preview
# workflow (preview-and-test-pr.yml). Edit the exclude list here once.
#
# Environment:
#   SITE_URL    (required) base URL, with or without a trailing slash.
#   GH_TOKEN    (optional) if set, sent as `Authorization: token`. Needed for the
#               auth-gated live host; omit it when checking a local build.
#   CRAWL_LOCAL (optional) set to "1" when crawling a locally-served build. Keeps
#               the localhost/127.0.0.1 links (the site itself lives there); for a
#               remote site those are excluded as dev-only content links.
set -eo pipefail

MUFFET_VERSION="v2.11.5"
MUFFET_SHA256="64d4db266f308ea7136fe8060a5061bc8a4eea3be5e36350f94a4fcea45309d2"

curl -sL "https://github.com/raviqqe/muffet/releases/download/${MUFFET_VERSION}/muffet_linux_amd64.tar.gz" \
  -o muffet.tar.gz
echo "${MUFFET_SHA256}  muffet.tar.gz" | sha256sum --check --strict
tar xzf muffet.tar.gz muffet
chmod +x muffet
./muffet --version

SITE_URL="${SITE_URL%/}"

EXCLUDES=(
  --exclude='https://github\.com/SAP/SapMachine/releases/download/'
  --exclude='https://github\.com/SAP/SapMachine/assets/'
  # SapMachine's "latest" download redirector: every URL 302s to a
  # multi-hundred-MB JDK/JRE archive on release-assets.githubusercontent.com.
  # muffet has to download the whole body to check it and trips its size limit,
  # so — like the release/asset links above — these can't be link-checked here.
  # Two host schemes coexist: the new latest.sapmachine.io/<ver>/... (this site
  # after migration) and the old sapmachine.io/latest/<ver>/... (still served by
  # the live site until the migration deploys). Exclude both.
  --exclude='^https://latest\.sapmachine\.io/'
  --exclude='^https://sapmachine\.io/latest/'
  --exclude='https://github\.com/.*#L\d+'
  --exclude='https://github\.com/.*/blob/.*#'
  --exclude='https://plugins\.jetbrains\.com'
  # www.sap.com and help.sap.com sit behind Akamai bot protection that returns
  # 403 to datacenter/CI crawlers while the pages are live in a browser.
  --exclude='https://((www|help)\.sap\.com|blogs\.oracle\.com)'
  --exclude='https://(bugs|wiki)\.openjdk\.org'
  --exclude='https://twitter\.com'
  --exclude='https://x\.com'
  --exclude='https://www\.instagram\.com'
  --exclude='https://www\.linkedin\.com'
  --exclude='^mailto:'
)
# On a remote site these skip dev-only links that may appear in content. When
# crawling the local build the site itself is served on localhost, so keep them.
if [ "${CRAWL_LOCAL:-}" != "1" ]; then
  EXCLUDES+=(
    --exclude='^http://localhost'
    --exclude='^http://127\.0\.0\.1'
  )
fi

HEADERS=(--header='User-Agent: muffet/sapmachine-io-ci')
if [ -n "${GH_TOKEN:-}" ]; then
  HEADERS+=(--header="Authorization: token ${GH_TOKEN}")
fi

MUFFET_OUT=$(mktemp)
set +e
# --verbose streams every checked link to the log and is captured in MUFFET_OUT
# for the summary counts below.
# --max-connections-per-host caps concurrent requests to any single host so we
# don't trip github.com's anti-abuse throttling (which returns transient 503s on
# otherwise-live pages when the crawler hits it too hard).
./muffet \
  --verbose \
  --timeout=30 \
  --max-connections=6 \
  --max-connections-per-host=2 \
  --max-redirections=10 \
  --rate-limit=10 \
  --buffer-size=16384 \
  "${HEADERS[@]}" \
  "${EXCLUDES[@]}" \
  "${SITE_URL}/" 2>&1 | tee "${MUFFET_OUT}"
EXIT_CODE=${PIPESTATUS[0]}
set -e

# muffet --verbose prints one line per checked link as "\t<status>\t<url>"
# (tab-separated). Successful links carry a 2xx/3xx status code; failures carry
# a 4xx/5xx code or an error message instead.
TOTAL_LINKS=$(grep -c $'^\t' "${MUFFET_OUT}" || true)
OK_LINKS=$(grep -cE $'^\t[23][0-9][0-9]([^0-9]|$)' "${MUFFET_OUT}" || true)
DEAD_LINKS=$((TOTAL_LINKS - OK_LINKS))

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  LINK CHECK SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Total checked : ${TOTAL_LINKS}"
echo "  Successful    : ${OK_LINKS}"
echo "  Failed        : ${DEAD_LINKS}"
if [ "${DEAD_LINKS}" -ne 0 ]; then
  echo ""
  echo "  Dead links:"
  grep $'^\t' "${MUFFET_OUT}" | grep -vE $'^\t[23][0-9][0-9]([^0-9]|$)' | sed 's/^\t/    /' | sort -u
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ "${EXIT_CODE}" -eq 0 ] || exit 1
