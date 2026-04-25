set -eu

APP_ROOT="$HOME/03.civilization-development/06.streaming-os/StreamWatch"
BFF_FILE="$APP_ROOT/supabase/functions/streamwatch-phase1-bff/index.ts"

echo "============================================================"
echo "VERIFY STREAMWATCH PHASE1 BFF ROUTES"
echo "BFF_FILE = $BFF_FILE"
echo "============================================================"

if [ ! -f "$BFF_FILE" ]; then
  echo "ERROR: file not found -> $BFF_FILE"
  exit 1
fi

grep -n 'streamwatch/' "$BFF_FILE" || true

echo "============================================================"
echo "DONE"
echo "============================================================"
