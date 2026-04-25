#!/data/data/com.termux/files/usr/bin/bash
set -eu

OS_DIR="$HOME/03.civilization-development/03.business-os"
COMMONOS="$OS_DIR/_commonos"

test -f "$COMMONOS/adapter/businessos_commonos_adapter_registry.js"
test -f "$COMMONOS/bridge/businessos_commonos_provider_bridge.js"
test -f "$COMMONOS/mapper/businessos_commonos_view_mapper.js"
test -f "$COMMONOS/presenter/businessos_commonos_shell.css"
test -f "$COMMONOS/presenter/businessos_commonos_shell.js"
test -f "$COMMONOS/theme/businessos_commonos_theme_tokens.js"
test -f "$COMMONOS/sync/businessos_commonos_sync_registry.js"

for APP in NameCardManager PocketSecretary
do
  test -f "$OS_DIR/$APP/web/businessos-commonos-consumer/index.html"
  test -f "$OS_DIR/$APP/web/businessos-commonos-consumer/app-config.js"
  test -f "$OS_DIR/$APP/web/businessos-commonos-consumer/consumer-entry.js"

  test -f "$OS_DIR/$APP/android/app/src/main/java/com/lsam/$APP/commonosconsumer/BusinessOSCommonOSConsumerDescriptor.java"
  test -f "$OS_DIR/$APP/android/app/src/main/java/com/lsam/$APP/commonosconsumer/BusinessOSCommonOSConsumerRegistry.java"
  test -f "$OS_DIR/$APP/android/app/src/main/java/com/lsam/$APP/commonosconsumer/BusinessOSCommonOSConsumerSmoke.java"

  test -f "$OS_DIR/$APP/iphone/$APP/BusinessOSCommonOSConsumer/BusinessOSCommonOSConsumerDescriptor.swift"
  test -f "$OS_DIR/$APP/iphone/$APP/BusinessOSCommonOSConsumer/BusinessOSCommonOSConsumerRegistry.swift"
  test -f "$OS_DIR/$APP/iphone/$APP/BusinessOSCommonOSConsumer/BusinessOSCommonOSConsumerView.swift"

  grep -Fq "../../../_commonos/presenter/businessos_commonos_shell.js" "$OS_DIR/$APP/web/businessos-commonos-consumer/index.html"
  grep -Fq "os_side_consumer" "$OS_DIR/$APP/android/app/src/main/java/com/lsam/$APP/commonosconsumer/BusinessOSCommonOSConsumerRegistry.java"
done

echo "VERIFY_OK:BUSINESSOS_COMMONOS_CONSUMER_NORMALIZED"
