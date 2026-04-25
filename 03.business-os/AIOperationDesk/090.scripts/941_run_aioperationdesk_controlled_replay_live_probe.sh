#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
TMP_JS="$APP_ROOT/900.meta/replay_live_probe_$(date +%Y%m%d_%H%M%S).mjs"
OUT_TXT="${TMP_JS%.mjs}.txt"

cat > "$TMP_JS" <<'EOF_REPLAY_LIVE_JS'
import { runReplayExecutor } from "../070.jobs/aiod_replay_executor.js";

const result = await runReplayExecutor();
console.log(JSON.stringify(result, null, 2));
EOF_REPLAY_LIVE_JS

REPLAY_MODE="live"
if [ -z "${PERSONA_DATABASE_URL:-}" ] || ! command -v psql >/dev/null 2>&1; then
  REPLAY_MODE="dry_run"
fi

AIOD_REPLAY_EXECUTION_MODE="$REPLAY_MODE"
export AIOD_REPLAY_EXECUTION_MODE

cd "$APP_ROOT/900.meta"
deno run --allow-env --allow-read --allow-run --allow-write "$TMP_JS" > "$OUT_TXT"

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK CONTROLLED REPLAY PROBE DONE'
printf '%s\n' "REPLAY_MODE=$REPLAY_MODE"
printf '%s\n' "OUT_TXT=$OUT_TXT"
printf '%s\n' '============================================================'
sed -n '1,220p' "$OUT_TXT"
