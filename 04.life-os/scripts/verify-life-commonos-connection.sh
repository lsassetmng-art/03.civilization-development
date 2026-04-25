#!/data/data/com.termux/files/usr/bin/sh
set -eu

BASE="/data/data/com.termux/files/home/03.civilization-development/04.life-os"

echo "============================================================"
echo "VERIFY LIFE OS _COMMONOS CONNECTION"
echo "============================================================"

echo "[_commonos files]"
find "$BASE/_commonos" -type f | sort
echo

echo "[consumer json]"
find "$BASE" -type f -name 'commonos-consumer.json' | sort
echo

echo "[index.html script connection]"
find "$BASE" -type f -path '*/app-web/index.html' | sort | while IFS= read -r f; do
  echo "--- $f"
  grep -n '_commonos/theme/life-theme-runtime.js' "$f" || true
  grep -n '_commonos/adapter/life-record-adapter.js' "$f" || true
  grep -n '_commonos/mapper/life-view-mapper.js' "$f" || true
  grep -n '_commonos/presenter/life-web-presenter.js' "$f" || true
  grep -n '_commonos/sync/life-sync-presentation.js' "$f" || true
  grep -n '_commonos/bridge/life-commonos-bridge.js' "$f" || true
done
echo

echo "[shared-web bridge merge]"
grep -n 'COMMONOS_BRIDGE_MERGE_START' "$BASE/_shared-web/common.js" || true
echo "============================================================"
