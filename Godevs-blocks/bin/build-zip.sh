#!/usr/bin/env bash
# Build a production-ready plugin ZIP for WordPress.org distribution.
#
# Usage:
#   bash bin/build-zip.sh              # output: goblocks.zip
#   bash bin/build-zip.sh 1.2.3        # output: goblocks-1.2.3.zip
#
# Requires: zip, composer, node/npm (build/ must exist or be built first).
#
# Run from the plugin root directory.

set -euo pipefail

PLUGIN_SLUG="goblocks"
OUTPUT_NAME="${1:-${PLUGIN_SLUG}}"
ZIP_FILE="${OUTPUT_NAME}.zip"
PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "${PLUGIN_DIR}"

echo "→ Building GoBlocks distribution ZIP: ${ZIP_FILE}"

# ── 1. Ensure build/ is up to date ─────────────────────────────────────────
if [ ! -d "build" ] || [ -z "$(ls -A build 2>/dev/null)" ]; then
    echo "→ build/ is empty — running npm run build..."
    npm run build
fi

# ── 2. (No production Composer dependencies — uses built-in PSR-4 fallback.) ─

# ── 3. Assemble a clean staging directory ───────────────────────────────────
STAGING_DIR="$(mktemp -d)"
STAGING_PLUGIN="${STAGING_DIR}/${PLUGIN_SLUG}"
mkdir -p "${STAGING_PLUGIN}"

echo "→ Copying files to staging area..."

# Copy files respecting .distignore
rsync -a \
    --exclude-from=".distignore" \
    --exclude=".distignore" \
    --filter="dir-merge,- .gitignore" \
    . \
    "${STAGING_PLUGIN}/"

# ── 4. Verify required files are present ────────────────────────────────────
for required in \
    "${STAGING_PLUGIN}/goblocks.php" \
    "${STAGING_PLUGIN}/readme.txt" \
    "${STAGING_PLUGIN}/build" \
    "${STAGING_PLUGIN}/includes" \
    "${STAGING_PLUGIN}/languages"
do
    if [ ! -e "${required}" ]; then
        echo "✗ Missing required file/dir: ${required}"
        rm -rf "${STAGING_DIR}"
        exit 1
    fi
done

# ── 5. Create the ZIP ────────────────────────────────────────────────────────
echo "→ Creating ${ZIP_FILE}..."
rm -f "${ZIP_FILE}"
(cd "${STAGING_DIR}" && zip -r --quiet "${PLUGIN_DIR}/${ZIP_FILE}" "${PLUGIN_SLUG}/")

# ── 6. Clean up staging area ────────────────────────────────────────────────
rm -rf "${STAGING_DIR}"

# ── 7. Report ────────────────────────────────────────────────────────────────
ZIP_SIZE=$(du -sh "${ZIP_FILE}" | cut -f1)
echo ""
echo "✓ Built: ${ZIP_FILE} (${ZIP_SIZE})"
echo ""
echo "  Pre-submission checklist:"
echo "  [ ] composer run phpcs      — zero WPCS violations"
echo "  [ ] composer run phpstan    — zero PHPStan level 6 errors"
echo "  [ ] composer run phpunit    — all tests pass"
echo "  [ ] npm run test:e2e        — all Playwright tests pass"
echo "  [ ] npx wp-env run cli wp plugin check goblocks"
echo "  [ ] Tested on WP 6.5, 6.6, 6.7, 6.8"
echo "  [ ] Tested on PHP 8.0, 8.1, 8.2, 8.3"
echo "  [ ] readme.txt has no TODO placeholders"
echo "  [ ] Stable tag in readme.txt matches goblocks.php Version header"
echo ""
