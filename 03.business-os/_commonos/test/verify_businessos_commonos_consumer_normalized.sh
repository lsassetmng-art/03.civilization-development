#!/data/data/com.termux/files/usr/bin/bash
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
COMMONOS_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
BUSINESS_ROOT="$(CDPATH= cd -- "$COMMONOS_DIR/.." && pwd)"
MONOREPO_ROOT="$(CDPATH= cd -- "$BUSINESS_ROOT/.." && pwd)"

PROVIDER_ROOT="$MONOREPO_ROOT/12.common-os"
PUBLISHED="$COMMONOS_DIR/provider"

BRIDGE="$COMMONOS_DIR/bridge/businessos_commonos_provider_bridge.js"
PRESENTER_JS="$COMMONOS_DIR/presenter/businessos_commonos_shell.js"
PRESENTER_CSS="$COMMONOS_DIR/presenter/businessos_commonos_shell.css"
SYNC_REGISTRY="$COMMONOS_DIR/sync/businessos_commonos_sync_registry.js"

NAME_HTML="$BUSINESS_ROOT/NameCardManager/web/businessos-commonos-consumer/index.html"
POCKET_HTML="$BUSINESS_ROOT/PocketSecretary/web/businessos-commonos-consumer/index.html"

fail() {
  echo "VERIFY_FAIL:$1"
  exit 1
}

require_file() {
  [ -f "$1" ] || fail "missing file $1"
}

cmp_asset() {
  DIST="$1"
  NAME="$2"

  require_file "$DIST"
  require_file "$PUBLISHED/$NAME"

  cmp -s "$DIST" "$PUBLISHED/$NAME" ||
    fail "published provider mismatch $NAME"
}

cmp_asset \
  "$PROVIDER_ROOT/CommonTokenSet/dist/commonos.tokens.css" \
  "commonos.tokens.css"

cmp_asset \
  "$PROVIDER_ROOT/CommonTokenSet/dist/commonos.variants.css" \
  "commonos.variants.css"

cmp_asset \
  "$PROVIDER_ROOT/CommonUIRuntime/dist/commonos.components.css" \
  "commonos.components.css"

cmp_asset \
  "$PROVIDER_ROOT/CommonUIRuntime/dist/commonos.runtime.js" \
  "commonos.runtime.js"

cmp_asset \
  "$PROVIDER_ROOT/CommonShell/dist/commonos.shell.css" \
  "commonos.shell.css"

cmp_asset \
  "$PROVIDER_ROOT/CommonShell/dist/commonos.shell.js" \
  "commonos.shell.js"

cmp_asset \
  "$PROVIDER_ROOT/CommonSyncPresentation/dist/commonos.sync.css" \
  "commonos.sync.css"

cmp_asset \
  "$PROVIDER_ROOT/CommonSyncPresentation/dist/commonos.sync.js" \
  "commonos.sync.js"

grep -q 'global.CommonOSRuntime' \
  "$PUBLISHED/commonos.runtime.js" ||
  fail "CommonOSRuntime export missing"

grep -q 'global.CommonOSShell' \
  "$PUBLISHED/commonos.shell.js" ||
  fail "CommonOSShell export missing"

grep -q 'global.CommonOSSync' \
  "$PUBLISHED/commonos.sync.js" ||
  fail "CommonOSSync export missing"

grep -q 'cancelled' \
  "$PUBLISHED/commonos.sync.js" ||
  fail "cancelled provider state missing"

grep -q 'cancelled' \
  "$SYNC_REGISTRY" ||
  fail "cancelled BusinessOS registry state missing"

grep -q 'CommonOSRuntime' "$BRIDGE" ||
  fail "bridge does not require CommonOSRuntime"

grep -q 'CommonOSShell' "$BRIDGE" ||
  fail "bridge does not require CommonOSShell"

grep -q 'CommonOSSync' "$BRIDGE" ||
  fail "bridge does not require CommonOSSync"

grep -q 'provider\.shell\.createShell' \
  "$PRESENTER_JS" ||
  fail "presenter does not invoke CommonOSShell.createShell"

grep -q 'provider\.sync\.queueGrid' \
  "$PRESENTER_JS" ||
  fail "presenter does not invoke CommonOSSync.queueGrid"

grep -q 'provider\.runtime' \
  "$PRESENTER_JS" ||
  fail "presenter does not consume CommonOSRuntime"

if grep -q 'innerHTML' "$PRESENTER_JS"; then
  fail "parallel innerHTML presenter remains"
fi

if grep -Eq \
  '\.cos-(shell|card|sync|button|status|field|dialog|toast)' \
  "$PRESENTER_CSS"
then
  fail "consumer CSS recreates CommonOS core selectors"
fi

verify_html() {
  FILE="$1"
  PREV=0

  require_file "$FILE"

  if grep -q '12\.common-os' "$FILE"; then
    fail \
      "browser runtime references sibling provider repository in $FILE"
  fi

  for ASSET in \
    "../../../_commonos/provider/commonos.tokens.css" \
    "../../../_commonos/provider/commonos.variants.css" \
    "../../../_commonos/provider/commonos.components.css" \
    "../../../_commonos/provider/commonos.shell.css" \
    "../../../_commonos/provider/commonos.sync.css" \
    "../../../_commonos/presenter/businessos_commonos_shell.css" \
    "../../../_commonos/provider/commonos.runtime.js" \
    "../../../_commonos/provider/commonos.shell.js" \
    "../../../_commonos/provider/commonos.sync.js" \
    "../../../_commonos/theme/businessos_commonos_theme_tokens.js" \
    "../../../_commonos/bridge/businessos_commonos_provider_bridge.js" \
    "../../../_commonos/adapter/businessos_commonos_adapter_registry.js" \
    "../../../_commonos/mapper/businessos_commonos_view_mapper.js" \
    "../../../_commonos/sync/businessos_commonos_sync_registry.js" \
    "../../../_commonos/presenter/businessos_commonos_shell.js" \
    "./app-config.js" \
    "./consumer-entry.js"
  do
    COUNT="$(grep -F -c "$ASSET" "$FILE" || true)"

    [ "$COUNT" -eq 1 ] ||
      fail \
        "asset occurrence count $COUNT for $ASSET in $FILE"

    LINE="$(
      grep -nF "$ASSET" "$FILE" |
      head -n 1 |
      cut -d: -f1
    )"

    [ -n "$LINE" ] ||
      fail "asset line unavailable for $ASSET in $FILE"

    [ "$LINE" -gt "$PREV" ] ||
      fail \
        "asset load order violation at $ASSET in $FILE"

    PREV="$LINE"
  done
}

verify_html "$NAME_HTML"
verify_html "$POCKET_HTML"

if grep -RIE \
  'BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|PERSONA_DATABASE_URL|DATABASE_URL|service[_-]?role[_-]?key' \
  "$PUBLISHED" \
  >/dev/null 2>&1
then
  fail "privileged material detected in published provider package"
fi

# R17B_THEME_SEMANTIC_BRIDGE_VERIFY
R17B_VERIFY_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
R17B_BUS_ROOT="$(CDPATH= cd -- "$R17B_VERIFY_DIR/../.." && pwd)"
R17B_THEME_PRESENTER="$R17B_BUS_ROOT/_commonos/presenter/businessos_commonos_shell.js"

for R17B_THEME_EXPECT in \
  "colorBg: ['--businessos-bg', '--cos-color-bg']" \
  "colorSurface: ['--businessos-surface', '--cos-color-surface']" \
  "colorBorder: ['--businessos-border', '--cos-color-border']" \
  "colorMuted: ['--businessos-muted', '--cos-color-text-muted']" \
  "colorText: ['--businessos-text', '--cos-color-text']" \
  "radiusCard: ['--businessos-radius-card', '--cos-radius-md']" \
  "radiusPanel: ['--businessos-radius-panel', '--cos-radius-lg']" \
  "shadowCard: ['--businessos-shadow-card', '--cos-shadow-md']" \
  "spacingBase: ['--businessos-spacing-base', '--cos-space-4']" \
  "spacingLarge: ['--businessos-spacing-large', '--cos-space-6']" \
  "density: ['--businessos-density']"
do
  if ! grep -Fq -- "$R17B_THEME_EXPECT" "$R17B_THEME_PRESENTER"; then
    echo "VERIFY_FAIL:BUSINESSOS_COMMONOS_THEME_SEMANTIC_BRIDGE"
    exit 1
  fi
done

if grep -q 'function normalizeThemeKey' "$R17B_THEME_PRESENTER"; then
  echo "VERIFY_FAIL:BUSINESSOS_COMMONOS_GENERIC_THEME_NORMALIZER"
  exit 1
fi

echo "VERIFY_OK:BUSINESSOS_COMMONOS_PROVIDER_CONNECTED"
