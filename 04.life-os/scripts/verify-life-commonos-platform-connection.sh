#!/data/data/com.termux/files/usr/bin/sh
set -eu

BASE="/data/data/com.termux/files/home/03.civilization-development/04.life-os"

echo "============================================================"
echo "VERIFY LIFE OS _COMMONOS PLATFORM CONNECTION"
echo "============================================================"

echo "[_commonos platform contracts]"
find "$BASE/_commonos" -type f \
  \( -name 'android-*.json' -o -name 'ios-*.json' -o -name 'platform-consumer-smoke-test.json' \) \
  | sort
echo

echo "[android consumer manifests]"
find "$BASE" -type f -path '*/app-android/app/src/main/assets/commonos-consumer.json' | sort
echo

echo "[android render contracts]"
find "$BASE" -type f -path '*/app-android/app/src/main/assets/commonos-render-contract.json' | sort
echo

echo "[iphone consumer manifests]"
find "$BASE" -type f -path '*/app-iphone/*/commonos-consumer.json' | sort
echo

echo "[iphone render contracts]"
find "$BASE" -type f -path '*/app-iphone/*/commonos-render-contract.json' | sort
echo

echo "============================================================"
