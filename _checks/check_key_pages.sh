#!/usr/bin/env bash
# Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0.

# HTTP smoke-test: every key page listed in _checks/checks.json (.urls) must
# return a 2xx or 3xx status.
#
# Single source of truth for the key-pages check — used by both the live-site
# workflow (site-checks.yml) and the PR preview workflow (preview-and-test-pr.yml).
#
# Environment:
#   SITE_URL (required) base URL, with or without a trailing slash.
#   GH_TOKEN (optional) if set, sent as `Authorization: token`. Needed for the
#            auth-gated live host; omit it when checking a local build.
#
# Must be run from the repository root (reads _checks/checks.json).
set -eo pipefail

SITE_URL="${SITE_URL%/}"
FAILED=0

check_url() {
  local url="$1"
  local http_code
  if [ -n "${GH_TOKEN:-}" ]; then
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 \
      -H "Authorization: token ${GH_TOKEN}" "$url")
  else
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$url")
  fi
  if [[ "$http_code" =~ ^[23] ]]; then
    echo "  ✓ ${url} → ${http_code}"
  else
    echo "::error::${url} returned unexpected HTTP ${http_code}"
    FAILED=1
  fi
}

while IFS= read -r path; do
  check_url "${SITE_URL}${path}"
done < <(jq -r '.urls | [.[]] | flatten | .[]' _checks/checks.json)

if [ "$FAILED" -ne 0 ]; then
  echo ""
  echo "::error::One or more key pages returned an unexpected HTTP status."
  exit 1
fi
echo ""
echo "All key pages are responding correctly."
