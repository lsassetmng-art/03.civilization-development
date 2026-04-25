#!/data/data/com.termux/files/usr/bin/bash
set -eu

OS_DIR="$HOME/03.civilization-development/03.business-os"
COMMONOS_CONSUMER="$OS_DIR/_commonos"

test -f "$COMMONOS_CONSUMER/theme/business_commonos_theme_tokens.js"
test -f "$COMMONOS_CONSUMER/bridge/commonos_provider_bridge.js"
test -f "$COMMONOS_CONSUMER/adapter/namecardmanager_consumer_adapter.js"
test -f "$COMMONOS_CONSUMER/adapter/pocketsecretary_consumer_adapter.js"
test -f "$COMMONOS_CONSUMER/mapper/business_commonos_view_mapper.js"
test -f "$COMMONOS_CONSUMER/presenter/business_commonos_shell.css"
test -f "$COMMONOS_CONSUMER/presenter/business_commonos_shell.js"
test -f "$COMMONOS_CONSUMER/sync/business_commonos_sync_registry.js"

test -f "$OS_DIR/NameCardManager/web/businessos-commonos-consumer/index.html"
test -f "$OS_DIR/NameCardManager/web/businessos-commonos-consumer/app-config.js"
test -f "$OS_DIR/NameCardManager/web/businessos-commonos-consumer/consumer-entry.js"

test -f "$OS_DIR/PocketSecretary/web/businessos-commonos-consumer/index.html"
test -f "$OS_DIR/PocketSecretary/web/businessos-commonos-consumer/app-config.js"
test -f "$OS_DIR/PocketSecretary/web/businessos-commonos-consumer/consumer-entry.js"

grep -Fq "../../../_commonos/presenter/business_commonos_shell.js" "$OS_DIR/NameCardManager/web/businessos-commonos-consumer/index.html"
grep -Fq "../../../_commonos/presenter/business_commonos_shell.js" "$OS_DIR/PocketSecretary/web/businessos-commonos-consumer/index.html"

echo "VERIFY_OK:BUSINESS_OS_COMMONOS_CONSUMER"
