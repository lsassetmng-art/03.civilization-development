#!/data/data/com.termux/files/usr/bin/bash
set -eu

OS_DIR="$HOME/03.civilization-development/03.business-os"
COMMONOS_CONSUMER="$OS_DIR/_commonos"

test -f "$COMMONOS_CONSUMER/bridge/business_commonos_mobile_wrapper_contract.json"
test -f "$COMMONOS_CONSUMER/presenter/business_commonos_mobile_wrapper_usage.json"
test -f "$COMMONOS_CONSUMER/theme/business_commonos_mobile_variant_registry.json"
test -f "$COMMONOS_CONSUMER/sync/business_commonos_mobile_sync_boundary.json"

test -f "$OS_DIR/NameCardManager/android/app/src/main/java/com/lsam/NameCardManager/wrapper/BusinessOSCommonOSWrapperDescriptor.java"
test -f "$OS_DIR/NameCardManager/android/app/src/main/java/com/lsam/NameCardManager/wrapper/BusinessOSCommonOSWrapperRegistry.java"
test -f "$OS_DIR/NameCardManager/android/app/src/main/java/com/lsam/NameCardManager/wrapper/BusinessOSCommonOSWrapperSmoke.java"
test -f "$OS_DIR/NameCardManager/iphone/NameCardManager/BusinessOSCommonOSWrapper/BusinessOSCommonOSWrapperDescriptor.swift"
test -f "$OS_DIR/NameCardManager/iphone/NameCardManager/BusinessOSCommonOSWrapper/BusinessOSCommonOSWrapperRegistry.swift"
test -f "$OS_DIR/NameCardManager/iphone/NameCardManager/BusinessOSCommonOSWrapper/BusinessOSCommonOSWrapperView.swift"

test -f "$OS_DIR/PocketSecretary/android/app/src/main/java/com/lsam/PocketSecretary/wrapper/BusinessOSCommonOSWrapperDescriptor.java"
test -f "$OS_DIR/PocketSecretary/android/app/src/main/java/com/lsam/PocketSecretary/wrapper/BusinessOSCommonOSWrapperRegistry.java"
test -f "$OS_DIR/PocketSecretary/android/app/src/main/java/com/lsam/PocketSecretary/wrapper/BusinessOSCommonOSWrapperSmoke.java"
test -f "$OS_DIR/PocketSecretary/iphone/PocketSecretary/BusinessOSCommonOSWrapper/BusinessOSCommonOSWrapperDescriptor.swift"
test -f "$OS_DIR/PocketSecretary/iphone/PocketSecretary/BusinessOSCommonOSWrapper/BusinessOSCommonOSWrapperRegistry.swift"
test -f "$OS_DIR/PocketSecretary/iphone/PocketSecretary/BusinessOSCommonOSWrapper/BusinessOSCommonOSWrapperView.swift"

grep -Fq 'shared_provider' "$OS_DIR/NameCardManager/android/app/src/main/java/com/lsam/NameCardManager/wrapper/BusinessOSCommonOSWrapperRegistry.java"
grep -Fq 'os_side_consumer' "$OS_DIR/PocketSecretary/android/app/src/main/java/com/lsam/PocketSecretary/wrapper/BusinessOSCommonOSWrapperRegistry.java"

echo "VERIFY_OK:BUSINESS_OS_COMMONOS_MOBILE_WRAPPER"
