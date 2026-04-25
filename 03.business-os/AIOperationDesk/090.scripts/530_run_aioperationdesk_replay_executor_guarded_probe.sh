#!/data/data/com.termux/files/usr/bin/sh
set -eu

APP_ROOT="$HOME/03.civilization-development/03.business-os/AIOperationDesk"
TMP_JS="$APP_ROOT/900.meta/replay_executor_guarded_probe_$(date +%Y%m%d_%H%M%S).mjs"
OUT_TXT="${TMP_JS%.mjs}.txt"

cat > "$TMP_JS" <<'EOF_REPLAY_PROBE_JS'
import { runReplayExecutor } from "../070.jobs/aiod_replay_executor.js";

const result = await runReplayExecutor();
console.log(JSON.stringify(result, null, 2));
EOF_REPLAY_PROBE_JS

AIOD_REPLAY_EXECUTION_MODE="${AIOD_REPLAY_EXECUTION_MODE:-dry_run}"
export AIOD_REPLAY_EXECUTION_MODE

cd "$APP_ROOT/900.meta"
deno run --allow-env --allow-read --allow-run "$TMP_JS" > "$OUT_TXT"

printf '%s\n' '============================================================'
printf '%s\n' 'AIOPERATIONDESK REPLAY EXECUTOR GUARDED PROBE DONE'
printf '%s\n' "OUT_TXT=$OUT_TXT"
printf '%s\n' '============================================================'
sed -n '1,200p' "$OUT_TXT"
