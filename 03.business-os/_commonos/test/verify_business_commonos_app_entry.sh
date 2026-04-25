#!/data/data/com.termux/files/usr/bin/bash
set -eu

OS_DIR="$HOME/03.civilization-development/03.business-os"
COMMONOS_CONSUMER="$OS_DIR/_commonos"

test -f "$COMMONOS_CONSUMER/presenter/business_commonos_launch_shell.css"
test -f "$COMMONOS_CONSUMER/presenter/business_commonos_launch_shell.js"
test -f "$COMMONOS_CONSUMER/bridge/business_commonos_launch_registry.json"

test -f "$OS_DIR/NameCardManager/web/launch-via-commonos/index.html"
test -f "$OS_DIR/NameCardManager/web/launch-via-commonos/launch-config.js"
test -f "$OS_DIR/NameCardManager/web/launch-via-commonos/launch-entry.js"
test -f "$OS_DIR/NameCardManager/android/app/src/main/java/com/lsam/NameCardManager/launch/BusinessOSCommonOSLaunchDescriptor.java"
test -f "$OS_DIR/NameCardManager/android/app/src/main/java/com/lsam/NameCardManager/launch/BusinessOSCommonOSLaunchRegistry.java"
test -f "$OS_DIR/NameCardManager/android/app/src/main/java/com/lsam/NameCardManager/launch/BusinessOSCommonOSLaunchOrchestrator.java"
test -f "$OS_DIR/NameCardManager/android/app/src/main/java/com/lsam/NameCardManager/launch/BusinessOSCommonOSLaunchSmoke.java"
test -f "$OS_DIR/NameCardManager/iphone/NameCardManager/BusinessOSCommonOSLaunch/BusinessOSCommonOSLaunchDescriptor.swift"
test -f "$OS_DIR/NameCardManager/iphone/NameCardManager/BusinessOSCommonOSLaunch/BusinessOSCommonOSLaunchRegistry.swift"
test -f "$OS_DIR/NameCardManager/iphone/NameCardManager/BusinessOSCommonOSLaunch/BusinessOSCommonOSLaunchView.swift"

test -f "$OS_DIR/PocketSecretary/web/launch-via-commonos/index.html"
test -f "$OS_DIR/PocketSecretary/web/launch-via-commonos/launch-config.js"
test -f "$OS_DIR/PocketSecretary/web/launch-via-commonos/launch-entry.js"
test -f "$OS_DIR/PocketSecretary/android/app/src/main/java/com/lsam/PocketSecretary/launch/BusinessOSCommonOSLaunchDescriptor.java"
test -f "$OS_DIR/PocketSecretary/android/app/src/main/java/com/lsam/PocketSecretary/launch/BusinessOSCommonOSLaunchRegistry.java"
test -f "$OS_DIR/PocketSecretary/android/app/src/main/java/com/lsam/PocketSecretary/launch/BusinessOSCommonOSLaunchOrchestrator.java"
test -f "$OS_DIR/PocketSecretary/android/app/src/main/java/com/lsam/PocketSecretary/launch/BusinessOSCommonOSLaunchSmoke.java"
test -f "$OS_DIR/PocketSecretary/iphone/PocketSecretary/BusinessOSCommonOSLaunch/BusinessOSCommonOSLaunchDescriptor.swift"
test -f "$OS_DIR/PocketSecretary/iphone/PocketSecretary/BusinessOSCommonOSLaunch/BusinessOSCommonOSLaunchRegistry.swift"
test -f "$OS_DIR/PocketSecretary/iphone/PocketSecretary/BusinessOSCommonOSLaunch/BusinessOSCommonOSLaunchView.swift"

grep -Fq "../../../_commonos/presenter/business_commonos_launch_shell.js" "$OS_DIR/NameCardManager/web/launch-via-commonos/index.html"
grep -Fq "../../../_commonos/presenter/business_commonos_launch_shell.js" "$OS_DIR/PocketSecretary/web/launch-via-commonos/index.html"
grep -Fq 'launch_via_commonos_consumer' "$OS_DIR/NameCardManager/android/app/src/main/java/com/lsam/NameCardManager/launch/BusinessOSCommonOSLaunchRegistry.java"
grep -Fq 'launch_via_commonos_consumer' "$OS_DIR/PocketSecretary/android/app/src/main/java/com/lsam/PocketSecretary/launch/BusinessOSCommonOSLaunchRegistry.java"

echo "VERIFY_OK:BUSINESS_OS_COMMONOS_APP_ENTRY"
