set -eu

echo "============================================================"
echo "VERIFY STREAMING PHASE1 PROJECTION / RPC ALL"
echo "DB_ENV = PERSONA_DATABASE_URL"
echo "============================================================"

"$HOME/03.civilization-development/06.streaming-os/StreamWatch/scripts/070_verify_phase1_projection_rpc.sh"
"$HOME/03.civilization-development/06.streaming-os/StreamStudio/scripts/070_verify_phase1_projection_rpc.sh"

echo "============================================================"
echo "DONE"
echo "============================================================"
