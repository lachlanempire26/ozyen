#!/bin/bash
# Builds fixture + real sites, serves them, runs Playwright checks. Usage: bash tests/run-e2e.sh
set -e; cd "$(dirname "$0")/.."
cp public/providers.json /tmp/prov.real
trap 'cp /tmp/prov.real public/providers.json; kill $(jobs -p) 2>/dev/null' EXIT
b(){ cp "$1" public/providers.json; env $2 npx vite build --outDir "$3" >/dev/null 2>&1; }
node scripts/gen-pages.mjs >/dev/null
b tests/fixtures/unverified.json OZ_X=1 dist-t0
b tests/fixtures/unverified.json OZ_LIVE=1 dist-t1
b tests/fixtures/wise-verified.json OZ_LIVE=1 dist-t2
b /tmp/prov.real OZ_LIVE=1 dist
for x in "8765 dist-t0" "8766 dist-t1" "8767 dist-t2" "8768 dist"; do set -- $x; python3 -m http.server $1 -d $2 >/dev/null 2>&1 & done
sleep 1.5; python3 tests/e2e.py
