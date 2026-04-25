#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BATCH_CODE="${1:-}"
ACTOR_NAME="${2:-Zero}"
RUN_CODE="access_confirmed_reverify_$(date +%Y%m%d_%H%M%S)"

if [ -z "$BATCH_CODE" ]; then
  BATCH_CODE="$(
    psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT batch_code
FROM cx22073jw.access_manual_apply_receipt_batch
ORDER BY created_at DESC
LIMIT 1;
SQL
  )"
fi

if [ -z "$BATCH_CODE" ]; then
  echo "ERROR: latest access_manual_apply_receipt_batch not found"
  exit 1
fi

ESC_BATCH="$(printf "%s" "$BATCH_CODE" | sed "s/'/''/g")"
ESC_ACTOR="$(printf "%s" "$ACTOR_NAME" | sed "s/'/''/g")"

echo "============================================================"
echo "ACCESS CONFIRMED-ONLY REVERIFY"
echo "batch_code : $BATCH_CODE"
echo "run_code   : $RUN_CODE"
echo "actor      : $ACTOR_NAME"
echo "============================================================"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
SELECT cx22073jw.fn_run_access_post_apply_verification_confirmed_only(
  '$RUN_CODE',
  '$ESC_BATCH',
  '$ESC_ACTOR',
  'Confirmed-only post-apply verification.'
);
SQL

echo "[latest confirmed-only reverify summary]"
psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
TABLE cx22073jw.v_access_post_apply_verification_latest_confirmed_only_summary;
SQL

echo "============================================================"
echo "ACCESS CONFIRMED-ONLY REVERIFY DONE"
echo "============================================================"
