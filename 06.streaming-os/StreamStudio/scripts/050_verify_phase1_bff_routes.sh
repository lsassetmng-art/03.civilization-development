set -eu

APP_ROOT="$HOME/03.civilization-development/06.streaming-os/StreamStudio"
BFF_FILE="$APP_ROOT/supabase/functions/streamstudio-phase1-bff/index.ts"

echo "============================================================"
echo "VERIFY STREAMSTUDIO PHASE1 BFF ROUTES"
echo "BFF_FILE = $BFF_FILE"
echo "============================================================"

if [ ! -f "$BFF_FILE" ]; then
  echo "ERROR: file not found -> $BFF_FILE"
  exit 1
fi

grep -n 'streamstudio/' "$BFF_FILE" || true

echo "============================================================"
echo "DONE"
echo "============================================================"
