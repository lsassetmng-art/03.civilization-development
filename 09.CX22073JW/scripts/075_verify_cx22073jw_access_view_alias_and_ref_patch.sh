#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
LATEST_REPORT="$(find "$BASE/logs" -maxdepth 1 -type d -name '*_access_view_alias_patch' | sort | tail -n 1)"

psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SET search_path TO cx22073jw, public;

\echo '=== v_access alias count ==='
SELECT COUNT(*) AS v_access_alias_count
FROM information_schema.views
WHERE table_schema = 'cx22073jw'
  AND table_name LIKE 'v_access_%';

\echo '=== legacy v_access compatibility count ==='
SELECT COUNT(*) AS v_access_compat_count
FROM information_schema.views
WHERE table_schema = 'cx22073jw'
  AND table_name LIKE 'v_access_%';

\echo '=== sample v_access aliases ==='
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'cx22073jw'
  AND table_name LIKE 'v_access_%'
ORDER BY table_name
LIMIT 60;
SQL

if [ -n "${LATEST_REPORT:-}" ] && [ -d "$LATEST_REPORT" ]; then
  echo "============================================================"
  echo "LATEST_REPORT=$LATEST_REPORT"
  echo "============================================================"
  echo "--- BEFORE HITS ---"
  sed -n '1,200p' "$LATEST_REPORT/010_before_view_hits.txt" || true
  echo "--- AFTER HITS ---"
  sed -n '1,200p' "$LATEST_REPORT/020_after_view_hits.txt" || true
  echo "--- PATCH LOG ---"
  sed -n '1,200p' "$LATEST_REPORT/030_patch_log.txt" || true
else
  echo "ERROR: latest access_view_alias_patch report not found"
  exit 1
fi
