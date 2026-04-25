set -eu

ROOT="/data/data/com.termux/files/home/03.civilization-development/06.streaming-os/_commonos"

echo "============================================================"
echo "VERIFY STREAMING _COMMONOS CONSUMER"
echo "ROOT = $ROOT"
echo "============================================================"

for DIR in adapter bridge mapper presenter theme sync test; do
  if [ ! -d "$ROOT/$DIR" ]; then
    echo "ERROR: missing dir -> $ROOT/$DIR"
    exit 1
  fi
  echo "OK DIR: $ROOT/$DIR"
done

find "$ROOT" -maxdepth 2 -type f | sort

echo "============================================================"
echo "DONE"
echo "============================================================"
