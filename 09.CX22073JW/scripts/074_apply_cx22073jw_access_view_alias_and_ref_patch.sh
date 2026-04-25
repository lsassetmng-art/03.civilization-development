#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TMP_DIR="/data/data/com.termux/files/home/.tmp/cx22073jw_access_view_alias_patch"
RUN_TS="$(date +%Y%m%d_%H%M%S)"
OUT="$BASE/logs/${RUN_TS}_access_view_alias_patch"

MAP_TSV="$OUT/000_view_map.tsv"
BEFORE_HITS="$OUT/010_before_view_hits.txt"
AFTER_HITS="$OUT/020_after_view_hits.txt"
PATCH_LOG="$OUT/030_patch_log.txt"
TARGETS="$OUT/040_targets.txt"
LOG_FILE="$OUT/050_run.log"

mkdir -p "$TMP_DIR" "$OUT"

{
  echo "============================================================"
  echo "CX22073JW ACCESS VIEW ALIAS AND REF PATCH START"
  echo "target db var : PERSONA_DATABASE_URL"
  echo "target schema : cx22073jw"
  echo "reviewer      : Sato (DB)"
  echo "base          : $BASE"
  echo "out           : $OUT"
  echo "============================================================"

  echo "============================================================"
  echo "PHASE 1: CREATE ACCESS VIEW ALIASES"
  echo "============================================================"

  psql "$PERSONA_DATABASE_URL" -X -A -F $'\t' -v ON_ERROR_STOP=1 <<'SQL' > "$MAP_TSV"
BEGIN;

SET search_path TO cx22073jw, public;

CREATE TEMP TABLE tmp_view_map AS
SELECT
  table_name AS old_name,
  regexp_replace(table_name, '^v_access_', 'v_access_') AS new_name
FROM information_schema.views
WHERE table_schema = 'cx22073jw'
  AND table_name LIKE 'v_access_%'
ORDER BY table_name;

DO $$
DECLARE
  v_dup_count integer;
  v_collision_count integer;
  r record;
BEGIN
  SELECT COUNT(*)
    INTO v_dup_count
  FROM (
    SELECT new_name
    FROM tmp_view_map
    GROUP BY new_name
    HAVING COUNT(*) > 1
  ) d;

  IF v_dup_count > 0 THEN
    RAISE EXCEPTION 'Alias creation aborted: duplicate target view names detected.';
  END IF;

  SELECT COUNT(*)
    INTO v_collision_count
  FROM tmp_view_map m
  JOIN pg_class c
    ON c.relname = m.new_name
  JOIN pg_namespace n
    ON n.oid = c.relnamespace
  WHERE n.nspname = 'cx22073jw'
    AND c.relkind NOT IN ('v','m');

  IF v_collision_count > 0 THEN
    RAISE EXCEPTION 'Alias creation aborted: non-view object collision exists for target names.';
  END IF;

  FOR r IN
    SELECT old_name, new_name
    FROM tmp_view_map
    ORDER BY old_name
  LOOP
    EXECUTE format(
      'CREATE OR REPLACE VIEW cx22073jw.%I AS SELECT * FROM cx22073jw.%I',
      r.new_name,
      r.old_name
    );
  END LOOP;
END
$$;

SELECT old_name, new_name
FROM tmp_view_map
ORDER BY old_name;

COMMIT;
SQL

  echo "--- view alias map ---"
  cat "$MAP_TSV"

  echo "============================================================"
  echo "PHASE 2: PATCH FILE REFERENCES"
  echo "============================================================"

  find "$BASE" -type f \
    \( -name '*.sh' -o -name '*.sql' -o -name '*.md' -o -name '*.txt' -o -name '*.tsv' -o -name '*.json' -o -name '*.yaml' -o -name '*.yml' \) \
    ! -path "$BASE/logs/*" \
    ! -path "$BASE/exports/*" \
    ! -path "$BASE/.git/*" \
    ! -name '*.bak_access_patch_03' \
    | sort > "$TARGETS"

  : > "$BEFORE_HITS"
  while IFS= read -r f; do
    if grep -nE '\bv_access_[A-Za-z0-9_]*\b' "$f" >/dev/null 2>&1; then
      {
        echo "----- $f"
        grep -nE '\bv_access_[A-Za-z0-9_]*\b' "$f" || true
      } >> "$BEFORE_HITS"
    fi
  done < "$TARGETS"

  : > "$PATCH_LOG"
  while IFS= read -r f; do
    if grep -qE '\bv_access_' "$f" 2>/dev/null; then
      cp "$f" "$f.bak_access_view_patch"
      perl -0pi -e 's/\bv_access_/v_access_/g' "$f"
      if ! cmp -s "$f" "$f.bak_access_view_patch"; then
        printf '%s\n' "$f" >> "$PATCH_LOG"
      else
        rm -f "$f.bak_access_view_patch"
      fi
    fi
  done < "$TARGETS"

  : > "$AFTER_HITS"
  while IFS= read -r f; do
    if grep -nE '\bv_access_[A-Za-z0-9_]*\b' "$f" >/dev/null 2>&1; then
      {
        echo "----- $f"
        grep -nE '\bv_access_[A-Za-z0-9_]*\b' "$f" || true
      } >> "$AFTER_HITS"
    fi
  done < "$TARGETS"

  BEFORE_COUNT="$(grep -c '^----- ' "$BEFORE_HITS" || true)"
  AFTER_COUNT="$(grep -c '^----- ' "$AFTER_HITS" || true)"
  PATCHED_FILE_COUNT="$(wc -l < "$PATCH_LOG" | tr -d '[:space:]')"

  echo "============================================================"
  echo "PHASE 3: VERIFY DB"
  echo "============================================================"
  psql "$PERSONA_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SET search_path TO cx22073jw, public;

\echo '=== alias count ==='
SELECT COUNT(*) AS v_access_alias_count
FROM information_schema.views
WHERE table_schema = 'cx22073jw'
  AND table_name LIKE 'v_access_%';

\echo '=== legacy compatibility view count ==='
SELECT COUNT(*) AS v_access_compat_count
FROM information_schema.views
WHERE table_schema = 'cx22073jw'
  AND table_name LIKE 'v_access_%';

\echo '=== sample access aliases ==='
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'cx22073jw'
  AND table_name LIKE 'v_access_%'
ORDER BY table_name
LIMIT 40;
SQL

  echo "============================================================"
  echo "SUMMARY"
  echo "============================================================"
  echo "before_v_access_ref_file_count=$BEFORE_COUNT"
  echo "after_v_access_ref_file_count=$AFTER_COUNT"
  echo "patched_file_count=$PATCHED_FILE_COUNT"
  echo "view_map=$MAP_TSV"
  echo "before_hits=$BEFORE_HITS"
  echo "after_hits=$AFTER_HITS"
  echo "patch_log=$PATCH_LOG"

  echo "============================================================"
  echo "CX22073JW ACCESS VIEW ALIAS AND REF PATCH DONE"
  echo "============================================================"
} | tee "$LOG_FILE"
