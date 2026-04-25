set -eu

echo "============================================================"
echo "APPLY STREAMING PHASE1 PROJECTION / RPC ALL"
echo "DB_ENV = PERSONA_DATABASE_URL"
echo "============================================================"

"$HOME/03.civilization-development/06.streaming-os/StreamWatch/scripts/060_apply_phase1_projection_rpc.sh"
"$HOME/03.civilization-development/06.streaming-os/StreamStudio/scripts/060_apply_phase1_projection_rpc.sh"

echo "============================================================"
echo "DONE"
echo "============================================================"
