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


# R18_APPMARKETPLACE_PROVIDER_ADOPTION_VERIFY
MARKETPLACE_HTML="$BUSINESS_ROOT/AppMarketplace/web/index.html"
MARKETPLACE_CONTROLLER="$BUSINESS_ROOT/AppMarketplace/web/app_marketplace_controller.mjs"
MARKETPLACE_CSS="$BUSINESS_ROOT/AppMarketplace/web/app_marketplace.css"

verify_marketplace_html() {
  FILE="$1"
  PREV=0

  require_file "$FILE"

  if grep -q '12\.common-os' "$FILE"; then
    fail \
      "AppMarketplace browser runtime references sibling provider repository"
  fi

  for ASSET in \
    "../../_commonos/provider/commonos.tokens.css" \
    "../../_commonos/provider/commonos.variants.css" \
    "../../_commonos/provider/commonos.components.css" \
    "../../_commonos/provider/commonos.shell.css" \
    "../../_commonos/provider/commonos.sync.css" \
    "../../_commonos/presenter/businessos_commonos_shell.css" \
    "./app_marketplace.css" \
    "../../_commonos/provider/commonos.runtime.js" \
    "../../_commonos/provider/commonos.shell.js" \
    "../../_commonos/provider/commonos.sync.js" \
    "../../_commonos/theme/businessos_commonos_theme_tokens.js" \
    "../../_commonos/bridge/businessos_commonos_provider_bridge.js" \
    "../../_commonos/adapter/businessos_commonos_adapter_registry.js" \
    "../../_commonos/mapper/businessos_commonos_view_mapper.js" \
    "../../_commonos/sync/businessos_commonos_sync_registry.js" \
    "../../_commonos/presenter/businessos_commonos_shell.js" \
    "./app_marketplace_controller.mjs"
  do
    COUNT="$(grep -F -c "$ASSET" "$FILE" || true)"

    [ "$COUNT" -eq 1 ] ||
      fail \
        "AppMarketplace asset occurrence count $COUNT for $ASSET"

    LINE="$(
      grep -nF "$ASSET" "$FILE" |
      head -n 1 |
      cut -d: -f1
    )"

    [ -n "$LINE" ] ||
      fail "AppMarketplace asset line unavailable for $ASSET"

    [ "$LINE" -gt "$PREV" ] ||
      fail "AppMarketplace asset load order violation at $ASSET"

    PREV="$LINE"
  done
}

verify_marketplace_html "$MARKETPLACE_HTML"

require_file "$MARKETPLACE_CONTROLLER"
require_file "$MARKETPLACE_CSS"

for EXPECT in \
  "BusinessOSCommonOSProviderBridge" \
  "bridge.requireProvider()" \
  "provider.shell.createShell" \
  "provider.runtime" \
  "rt.card(" \
  "rt.button(" \
  "rt.statusChip(" \
  "rt.panelNote(" \
  "data-commonos-provider-connected"
do
  grep -Fq "$EXPECT" "$MARKETPLACE_CONTROLLER" ||
    fail "AppMarketplace Provider usage missing: $EXPECT"
done

if grep -Eq \
  'document\.createElement|businessos-commonos-(shell|card|panel|list)|marketplace-button' \
  "$MARKETPLACE_CONTROLLER"
then
  fail "AppMarketplace legacy shared UI reconstruction remains"
fi

if grep -Eq \
  '\.cos-(shell|card|sync|button|status|field|dialog|toast)' \
  "$MARKETPLACE_CSS"
then
  fail "AppMarketplace CSS overrides CommonOS core selectors"
fi

if grep -Eq '\.marketplace-button' "$MARKETPLACE_CSS"; then
  fail "AppMarketplace legacy button implementation remains"
fi

if grep -RIE \
  'BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|PERSONA_DATABASE_URL|DATABASE_URL|service[_-]?role[_-]?key' \
  "$BUSINESS_ROOT/AppMarketplace" \
  >/dev/null 2>&1
then
  fail "privileged material detected in AppMarketplace client"
fi


# R19A_AIOPERATIONDESK_ENTRY_PROVIDER_VERIFY
AIOD_ENTRY_HTML="$BUSINESS_ROOT/AIOperationDesk/030.frontend/web/index.html"
AIOD_ENTRY_JS="$BUSINESS_ROOT/AIOperationDesk/030.frontend/web/assets/aiod_commonos_entry.js"
AIOD_ENTRY_CSS="$BUSINESS_ROOT/AIOperationDesk/030.frontend/web/assets/aiod_commonos_entry.css"

verify_aiod_entry_html() {
  FILE="$1"
  PREV=0

  require_file "$FILE"

  if grep -q '12\.common-os' "$FILE"; then
    fail \
      "AIOperationDesk browser runtime references sibling CommonOS repository"
  fi

  for ASSET in \
    "../../../_commonos/provider/commonos.tokens.css" \
    "../../../_commonos/provider/commonos.variants.css" \
    "../../../_commonos/provider/commonos.components.css" \
    "../../../_commonos/provider/commonos.shell.css" \
    "../../../_commonos/provider/commonos.sync.css" \
    "../../../_commonos/presenter/businessos_commonos_shell.css" \
    "./assets/aiod_commonos_entry.css" \
    "../../../_commonos/provider/commonos.runtime.js" \
    "../../../_commonos/provider/commonos.shell.js" \
    "../../../_commonos/provider/commonos.sync.js" \
    "../../../_commonos/theme/businessos_commonos_theme_tokens.js" \
    "../../../_commonos/bridge/businessos_commonos_provider_bridge.js" \
    "../../../_commonos/adapter/businessos_commonos_adapter_registry.js" \
    "../../../_commonos/mapper/businessos_commonos_view_mapper.js" \
    "../../../_commonos/sync/businessos_commonos_sync_registry.js" \
    "../../../_commonos/presenter/businessos_commonos_shell.js" \
    "../../../_commonos/bridge/businessos_commonos_pwa_bootstrap.js" \
    "./assets/aiod_commonos_entry.js"
  do
    COUNT="$(grep -F -c "$ASSET" "$FILE" || true)"

    [ "$COUNT" -eq 1 ] ||
      fail \
        "AIOperationDesk entry asset occurrence count $COUNT for $ASSET"

    LINE="$(
      grep -nF "$ASSET" "$FILE" |
      head -n 1 |
      cut -d: -f1
    )"

    [ -n "$LINE" ] ||
      fail "AIOperationDesk entry asset line unavailable for $ASSET"

    [ "$LINE" -gt "$PREV" ] ||
      fail "AIOperationDesk entry asset load order violation at $ASSET"

    PREV="$LINE"
  done
}

verify_aiod_entry_html "$AIOD_ENTRY_HTML"

require_file "$AIOD_ENTRY_JS"
require_file "$AIOD_ENTRY_CSS"

for EXPECT in \
  "BusinessOSCommonOSProviderBridge" \
  "bridge.requireProvider()" \
  "BusinessOSCommonOSShell" \
  "presenter.applyTheme" \
  "provider.runtime" \
  "provider.shell.createShell" \
  "rt.card(" \
  "data-commonos-provider-connected" \
  "./console/main_console.html" \
  "./resident/erp_resident.html" \
  "./resident/builder_resident.html"
do
  grep -Fq "$EXPECT" "$AIOD_ENTRY_JS" ||
    fail "AIOperationDesk entry Provider contract missing: $EXPECT"
done

PWA_COUNT="$(
  grep -F -c \
    "../../../_commonos/bridge/businessos_commonos_pwa_bootstrap.js" \
    "$AIOD_ENTRY_HTML" || true
)"

[ "$PWA_COUNT" -eq 1 ] ||
  fail "AIOperationDesk PWA bootstrap must occur exactly once"

if grep -Fq './assets/aiod.css' "$AIOD_ENTRY_HTML"; then
  fail "AIOperationDesk entry still depends on legacy shared aiod.css"
fi

if grep -Eq \
  'class="(page|header|toolbar|card|button|badge|list)([ "]|$)' \
  "$AIOD_ENTRY_HTML"
then
  fail "AIOperationDesk legacy entry shared UI classes remain"
fi

if grep -Eq \
  '\.cos-(shell|card|sync|button|status|field|dialog|toast)' \
  "$AIOD_ENTRY_CSS"
then
  fail "AIOperationDesk entry CSS overrides CommonOS core selectors"
fi

if grep -Eq \
  'document\.createElement|\.innerHTML[[:space:]]*=' \
  "$AIOD_ENTRY_JS"
then
  fail "AIOperationDesk entry recreates shared UI with direct DOM/innerHTML"
fi

if grep -RIE \
  'BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|PERSONA_DATABASE_URL|DATABASE_URL|service[_-]?role[_-]?key' \
  "$BUSINESS_ROOT/AIOperationDesk/030.frontend" \
  >/dev/null 2>&1
then
  fail "privileged material detected in AIOperationDesk frontend"
fi


# R19B_AIOPERATIONDESK_CONSOLE_PROVIDER_VERIFY
AIOD_CONSOLE_ROOT="$BUSINESS_ROOT/AIOperationDesk/030.frontend/web/console"
AIOD_CONSOLE_JS="$BUSINESS_ROOT/AIOperationDesk/030.frontend/web/assets/aiod_commonos_console.js"
AIOD_CONSOLE_CSS="$BUSINESS_ROOT/AIOperationDesk/030.frontend/web/assets/aiod_commonos_console.css"

verify_aiod_console_html() {
  FILE="$1"
  LIVE_SCRIPT="${2:-}"
  PREV=0

  require_file "$FILE"

  if grep -q '12\.common-os' "$FILE"; then
    fail "AIOperationDesk console references sibling CommonOS repository"
  fi

  for ASSET in \
    "../../../../_commonos/provider/commonos.tokens.css" \
    "../../../../_commonos/provider/commonos.variants.css" \
    "../../../../_commonos/provider/commonos.components.css" \
    "../../../../_commonos/provider/commonos.shell.css" \
    "../../../../_commonos/provider/commonos.sync.css" \
    "../../../../_commonos/presenter/businessos_commonos_shell.css" \
    "../assets/aiod_commonos_console.css" \
    "../../../../_commonos/provider/commonos.runtime.js" \
    "../../../../_commonos/provider/commonos.shell.js" \
    "../../../../_commonos/provider/commonos.sync.js" \
    "../../../../_commonos/theme/businessos_commonos_theme_tokens.js" \
    "../../../../_commonos/bridge/businessos_commonos_provider_bridge.js" \
    "../../../../_commonos/adapter/businessos_commonos_adapter_registry.js" \
    "../../../../_commonos/mapper/businessos_commonos_view_mapper.js" \
    "../../../../_commonos/sync/businessos_commonos_sync_registry.js" \
    "../../../../_commonos/presenter/businessos_commonos_shell.js" \
    "../assets/aiod_commonos_console.js"
  do
    COUNT="$(grep -F -c "$ASSET" "$FILE" || true)"

    [ "$COUNT" -eq 1 ] ||
      fail "AIOperationDesk asset count $COUNT for $ASSET"

    LINE="$(
      grep -nF "$ASSET" "$FILE" |
      head -n 1 |
      cut -d: -f1
    )"

    [ -n "$LINE" ] ||
      fail "AIOperationDesk asset line unavailable for $ASSET"

    [ "$LINE" -gt "$PREV" ] ||
      fail "AIOperationDesk asset load order violation at $ASSET"

    PREV="$LINE"
  done

  grep -Fq 'id="aiodCommonOsConsoleRoot"' "$FILE" ||
    fail "AIOperationDesk CommonOS root missing"

  grep -Fq 'data-aiod-console-surface=' "$FILE" ||
    fail "AIOperationDesk console surface marker missing"

  if grep -Fq '../assets/aiod.css' "$FILE"; then
    fail "AIOperationDesk console still references legacy aiod.css"
  fi

  if [ -n "$LIVE_SCRIPT" ]; then
    COUNT="$(grep -F -c "./$LIVE_SCRIPT" "$FILE" || true)"

    [ "$COUNT" -eq 1 ] ||
      fail "AIOperationDesk live script count $COUNT for $LIVE_SCRIPT"

    LIVE_LINE="$(
      grep -nF "./$LIVE_SCRIPT" "$FILE" |
      head -n 1 |
      cut -d: -f1
    )"

    [ "$LIVE_LINE" -gt "$PREV" ] ||
      fail "AIOperationDesk live script load order violation"
  fi
}

verify_aiod_console_html \
  "$AIOD_CONSOLE_ROOT/main_console.html" \
  "dashboard_live.js"

verify_aiod_console_html \
  "$AIOD_CONSOLE_ROOT/queue_board.html" \
  "queue_board_live.js"

verify_aiod_console_html \
  "$AIOD_CONSOLE_ROOT/review_inbox.html" \
  "review_inbox_live.js"

verify_aiod_console_html \
  "$AIOD_CONSOLE_ROOT/approval_inbox.html" \
  "approval_inbox_live.js"

verify_aiod_console_html \
  "$AIOD_CONSOLE_ROOT/failure_retry_center.html" \
  "failure_retry_center_live.js"

verify_aiod_console_html \
  "$AIOD_CONSOLE_ROOT/summary_center.html" \
  "summary_center_live.js"

verify_aiod_console_html \
  "$AIOD_CONSOLE_ROOT/registry_manager.html"

verify_aiod_console_html \
  "$AIOD_CONSOLE_ROOT/notification_settings.html"

verify_aiod_console_html \
  "$AIOD_CONSOLE_ROOT/resident_surface_monitor.html"

require_file "$AIOD_CONSOLE_JS"
require_file "$AIOD_CONSOLE_CSS"

for EXPECT in \
  "BusinessOSCommonOSProviderBridge" \
  "bridge.requireProvider()" \
  "BusinessOSCommonOSShell" \
  "presenter.applyTheme" \
  "provider.runtime" \
  "provider.shell.createShell" \
  "rt.card(" \
  "rt.statusChip(" \
  "rt.list(" \
  "data-commonos-provider-connected"
do
  grep -Fq "$EXPECT" "$AIOD_CONSOLE_JS" ||
    fail "AIOperationDesk Provider usage missing: $EXPECT"
done

if grep -Eq \
  'document\.createElement|\.innerHTML[[:space:]]*=' \
  "$AIOD_CONSOLE_JS"
then
  fail "AIOperationDesk direct shared DOM renderer remains"
fi

if grep -Eq \
  '\.cos-(shell|card|sync|button|status|field|dialog|toast|list)' \
  "$AIOD_CONSOLE_CSS"
then
  fail "AIOperationDesk CSS overrides CommonOS core selectors"
fi

for LIVE in \
  dashboard_live.js \
  queue_board_live.js \
  review_inbox_live.js \
  approval_inbox_live.js \
  failure_retry_center_live.js \
  summary_center_live.js
do
  FILE="$AIOD_CONSOLE_ROOT/$LIVE"

  require_file "$FILE"

  grep -Fq 'window.AIODCommonOSConsole' "$FILE" ||
    fail "AIOperationDesk CommonOS helper missing in $LIVE"

  if grep -Fq '../assets/aiod_render.js' "$FILE"; then
    fail "AIOperationDesk legacy renderer remains in $LIVE"
  fi

  if grep -Eq \
    'document\.createElement|\.innerHTML[[:space:]]*=' \
    "$FILE"
  then
    fail "AIOperationDesk direct renderer remains in $LIVE"
  fi
done

if grep -RIE \
  'BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|PERSONA_DATABASE_URL|DATABASE_URL|service[_-]?role[_-]?key' \
  "$BUSINESS_ROOT/AIOperationDesk/030.frontend" \
  >/dev/null 2>&1
then
  fail "privileged material detected in AIOperationDesk frontend"
fi


# R19C_AIOPERATIONDESK_RESIDENT_PROVIDER_VERIFY
AIOD_RESIDENT_ROOT="$BUSINESS_ROOT/AIOperationDesk/030.frontend/web/resident"
AIOD_RESIDENT_JS="$BUSINESS_ROOT/AIOperationDesk/030.frontend/web/assets/aiod_commonos_resident.js"
AIOD_RESIDENT_CSS="$BUSINESS_ROOT/AIOperationDesk/030.frontend/web/assets/aiod_commonos_resident.css"
AIOD_RESIDENT_QUICK_JS="$BUSINESS_ROOT/AIOperationDesk/030.frontend/web/assets/aiod_resident.js"

verify_aiod_resident_html() {
  FILE="$1"
  MODULE="$2"
  PREV=0

  require_file "$FILE"

  if grep -q '12\.common-os' "$FILE"; then
    fail "AIOperationDesk resident references sibling CommonOS repository"
  fi

  for ASSET in \
    "../../../../_commonos/provider/commonos.tokens.css" \
    "../../../../_commonos/provider/commonos.variants.css" \
    "../../../../_commonos/provider/commonos.components.css" \
    "../../../../_commonos/provider/commonos.shell.css" \
    "../../../../_commonos/provider/commonos.sync.css" \
    "../../../../_commonos/presenter/businessos_commonos_shell.css" \
    "../assets/aiod_commonos_resident.css" \
    "../../../../_commonos/provider/commonos.runtime.js" \
    "../../../../_commonos/provider/commonos.shell.js" \
    "../../../../_commonos/provider/commonos.sync.js" \
    "../../../../_commonos/theme/businessos_commonos_theme_tokens.js" \
    "../../../../_commonos/bridge/businessos_commonos_provider_bridge.js" \
    "../../../../_commonos/adapter/businessos_commonos_adapter_registry.js" \
    "../../../../_commonos/mapper/businessos_commonos_view_mapper.js" \
    "../../../../_commonos/sync/businessos_commonos_sync_registry.js" \
    "../../../../_commonos/presenter/businessos_commonos_shell.js" \
    "../assets/aiod_commonos_resident.js"
  do
    COUNT="$(grep -F -c "$ASSET" "$FILE" || true)"

    [ "$COUNT" -eq 1 ] ||
      fail "AIOperationDesk resident asset count $COUNT for $ASSET"

    LINE="$(
      grep -nF "$ASSET" "$FILE" |
      head -n 1 |
      cut -d: -f1
    )"

    [ -n "$LINE" ] ||
      fail "AIOperationDesk resident asset line unavailable for $ASSET"

    [ "$LINE" -gt "$PREV" ] ||
      fail "AIOperationDesk resident asset order violation at $ASSET"

    PREV="$LINE"
  done

  grep -Fq 'id="aiodCommonOsResidentRoot"' "$FILE" ||
    fail "AIOperationDesk resident CommonOS root missing"

  grep -Fq 'data-aiod-resident-surface=' "$FILE" ||
    fail "AIOperationDesk resident surface marker missing"

  if grep -Fq '../assets/aiod.css' "$FILE"; then
    fail "AIOperationDesk resident still references legacy aiod.css"
  fi

  COUNT="$(grep -F -c "$MODULE" "$FILE" || true)"

  [ "$COUNT" -eq 1 ] ||
    fail "AIOperationDesk resident module count $COUNT for $MODULE"

  MODULE_LINE="$(
    grep -nF "$MODULE" "$FILE" |
    head -n 1 |
    cut -d: -f1
  )"

  [ "$MODULE_LINE" -gt "$PREV" ] ||
    fail "AIOperationDesk resident module load order violation"
}

verify_aiod_resident_html \
  "$AIOD_RESIDENT_ROOT/builder_quick_panel.html" \
  "../assets/aiod_resident.js"

verify_aiod_resident_html \
  "$AIOD_RESIDENT_ROOT/builder_resident.html" \
  "./builder_resident_live.js"

verify_aiod_resident_html \
  "$AIOD_RESIDENT_ROOT/erp_quick_panel.html" \
  "../assets/aiod_resident.js"

verify_aiod_resident_html \
  "$AIOD_RESIDENT_ROOT/erp_resident.html" \
  "./erp_resident_live.js"

require_file "$AIOD_RESIDENT_JS"
require_file "$AIOD_RESIDENT_CSS"
require_file "$AIOD_RESIDENT_QUICK_JS"

for EXPECT in \
  "BusinessOSCommonOSProviderBridge" \
  "bridge.requireProvider()" \
  "BusinessOSCommonOSShell" \
  "presenter.applyTheme" \
  "provider.runtime" \
  "provider.shell.createShell" \
  "rt.button(" \
  "rt.statusChip(" \
  "rt.selectField(" \
  "rt.textArea(" \
  "rt.table(" \
  "data-commonos-provider-connected"
do
  grep -Fq "$EXPECT" "$AIOD_RESIDENT_JS" ||
    fail "AIOperationDesk resident Provider usage missing: $EXPECT"
done

if grep -Eq \
  'document\.createElement|\.innerHTML[[:space:]]*=' \
  "$AIOD_RESIDENT_JS"
then
  fail "AIOperationDesk resident direct shared DOM renderer remains"
fi

if grep -Eq \
  '\.cos-(shell|card|sync|button|status|field|dialog|toast|list|table)' \
  "$AIOD_RESIDENT_CSS"
then
  fail "AIOperationDesk resident CSS overrides CommonOS core selectors"
fi

grep -Fq 'window.AIODCommonOSResident' \
  "$AIOD_RESIDENT_QUICK_JS" ||
  fail "AIOperationDesk quick action helper not connected"

for LIVE in \
  builder_resident_live.js \
  erp_resident_live.js
do
  FILE="$AIOD_RESIDENT_ROOT/$LIVE"

  require_file "$FILE"

  grep -Fq 'window.AIODCommonOSResident' "$FILE" ||
    fail "AIOperationDesk CommonOS resident helper missing in $LIVE"

  grep -Fq 'aiodApi.compileRequest' "$FILE" ||
    fail "AIOperationDesk compileRequest missing in $LIVE"

  if grep -Fq '../assets/aiod_render.js' "$FILE"; then
    fail "AIOperationDesk legacy renderer remains in $LIVE"
  fi

  if grep -Eq \
    'document\.createElement|\.innerHTML[[:space:]]*=' \
    "$FILE"
  then
    fail "AIOperationDesk resident live direct renderer remains"
  fi
done

if grep -RIE \
  'BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|PERSONA_DATABASE_URL|DATABASE_URL|service[_-]?role[_-]?key' \
  "$BUSINESS_ROOT/AIOperationDesk/030.frontend" \
  >/dev/null 2>&1
then
  fail "privileged material detected in AIOperationDesk frontend"
fi

echo "VERIFY_OK:BUSINESSOS_COMMONOS_PROVIDER_CONNECTED"
