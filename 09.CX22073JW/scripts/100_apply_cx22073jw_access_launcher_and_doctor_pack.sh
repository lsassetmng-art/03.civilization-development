#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
DOCS_DIR="$BASE/docs"

mkdir -p "$TOOLS_DIR" "$DOCS_DIR"

cat > "$TOOLS_DIR/access_menu.sh" <<'ACCESS_MENU_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"

run_cmd() {
  local label="$1"
  local path="$2"
  shift 2 || true

  echo "============================================================"
  echo "$label"
  echo "============================================================"

  if [ ! -x "$path" ]; then
    echo "MISSING COMMAND: $path"
    return 1
  fi

  "$path" "$@"
}

while true; do
  echo "============================================================"
  echo "ACCESS MENU"
  echo "============================================================"
  echo "1) status"
  echo "2) latest batch"
  echo "3) open blockers"
  echo "4) legacy readiness"
  echo "5) daily refresh"
  echo "6) export current bundle"
  echo "7) make shift report"
  echo "8) confirm request"
  echo "9) reverify confirmed"
  echo "10) doctor"
  echo "0) exit"
  printf "select> "
  IFS= read -r choice

  case "${choice:-}" in
    1)
      run_cmd "ACCESS STATUS" "$TOOLS_DIR/access_status.sh"
      ;;
    2)
      run_cmd "ACCESS LATEST BATCH" "$TOOLS_DIR/access_show_latest_batch.sh"
      ;;
    3)
      run_cmd "ACCESS OPEN BLOCKERS" "$TOOLS_DIR/access_open_blockers.sh"
      ;;
    4)
      run_cmd "ACCESS LEGACY READINESS" "$TOOLS_DIR/access_legacy_readiness.sh"
      ;;
    5)
      run_cmd "ACCESS DAILY REFRESH" "$TOOLS_DIR/access_daily_refresh.sh"
      ;;
    6)
      run_cmd "ACCESS EXPORT CURRENT BUNDLE" "$TOOLS_DIR/access_export_current_bundle.sh"
      ;;
    7)
      run_cmd "ACCESS MAKE SHIFT REPORT" "$TOOLS_DIR/access_make_shift_report.sh"
      ;;
    8)
      printf "request_code> "
      IFS= read -r request_code
      printf "status[confirmed_applied]> "
      IFS= read -r status_value
      printf "executor[Zero]> "
      IFS= read -r executor_name
      printf "note[manual confirm]> "
      IFS= read -r note_text
      printf "batch_code[latest]> "
      IFS= read -r batch_code

      [ -n "${status_value:-}" ] || status_value="confirmed_applied"
      [ -n "${executor_name:-}" ] || executor_name="Zero"
      [ -n "${note_text:-}" ] || note_text="manual confirm from access_menu.sh"

      run_cmd \
        "ACCESS CONFIRM REQUEST" \
        "$TOOLS_DIR/access_confirm_request.sh" \
        "${request_code:-}" \
        "$status_value" \
        "$executor_name" \
        "$note_text" \
        "${batch_code:-}"
      ;;
    9)
      printf "batch_code[latest]> "
      IFS= read -r batch_code
      printf "actor[Zero]> "
      IFS= read -r actor_name
      [ -n "${actor_name:-}" ] || actor_name="Zero"

      run_cmd \
        "ACCESS REVERIFY CONFIRMED" \
        "$TOOLS_DIR/access_reverify_confirmed.sh" \
        "${batch_code:-}" \
        "$actor_name"
      ;;
    10)
      run_cmd "ACCESS DOCTOR" "$TOOLS_DIR/access_doctor.sh"
      ;;
    0)
      echo "EXIT"
      break
      ;;
    *)
      echo "INVALID SELECTION"
      ;;
  esac
done
ACCESS_MENU_CMD
chmod +x "$TOOLS_DIR/access_menu.sh"

cat > "$TOOLS_DIR/access_doctor.sh" <<'ACCESS_DOCTOR_CMD'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

: "${PERSONA_DATABASE_URL:?ERROR: PERSONA_DATABASE_URL is not set}"

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
TOOLS_DIR="$BASE/tools"
SCRIPTS_DIR="$BASE/scripts"

pass_count=0
warn_count=0
fail_count=0

pass() {
  pass_count=$((pass_count + 1))
  printf 'PASS | %s\n' "$1"
}

warn() {
  warn_count=$((warn_count + 1))
  printf 'WARN | %s\n' "$1"
}

fail() {
  fail_count=$((fail_count + 1))
  printf 'FAIL | %s\n' "$1"
}

view_exists() {
  local v="$1"
  psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | grep -qx 't'
SELECT EXISTS (
  SELECT 1
  FROM information_schema.views
  WHERE table_schema = 'cx22073jw'
    AND table_name = '$v'
);
SQL
}

table_exists() {
  local t="$1"
  psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<SQL | grep -qx 't'
SELECT EXISTS (
  SELECT 1
  FROM information_schema.tables
  WHERE table_schema = 'cx22073jw'
    AND table_name = '$t'
);
SQL
}

echo "============================================================"
echo "ACCESS DOCTOR"
echo "============================================================"
echo "[env]"
pass "PERSONA_DATABASE_URL is set"

echo "[scripts]"
for f in \
  "$TOOLS_DIR/access_status.sh" \
  "$TOOLS_DIR/access_show_latest_batch.sh" \
  "$TOOLS_DIR/access_open_blockers.sh" \
  "$TOOLS_DIR/access_legacy_readiness.sh" \
  "$TOOLS_DIR/access_daily_refresh.sh" \
  "$TOOLS_DIR/access_export_current_bundle.sh" \
  "$TOOLS_DIR/access_make_shift_report.sh" \
  "$TOOLS_DIR/access_menu.sh"
do
  if [ -x "$f" ]; then
    pass "executable: $f"
  else
    fail "missing executable: $f"
  fi
done

echo "[db tables]"
for t in \
  access_manual_apply_receipt_batch \
  access_manual_apply_receipt_item \
  access_post_apply_verification_run \
  access_post_apply_verification_item \
  access_baseline_health_run \
  access_current_state_bundle_export_run
do
  if table_exists "$t"; then
    pass "table exists: cx22073jw.$t"
  else
    fail "table missing: cx22073jw.$t"
  fi
done

echo "[db views]"
for v in \
  v_access_baseline_health_latest_summary \
  v_access_baseline_health_latest_items \
  v_access_manual_apply_receipt_latest_batch_summary \
  v_access_manual_apply_receipt_latest_pending_summary \
  v_access_manual_apply_receipt_latest_items \
  v_access_post_apply_verification_latest_confirmed_only_summary \
  v_access_post_apply_verification_latest_confirmed_only_items \
  v_access_legacy_cutover_gate_latest_summary \
  v_access_legacy_retirement_plan_latest_summary \
  v_access_current_state_bundle_export_latest_summary
do
  if view_exists "$v"; then
    pass "view exists: cx22073jw.$v"
  else
    fail "view missing: cx22073jw.$v"
  fi
done

echo "[self-reference smoke]"
self_ref_count="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | tr -d '[:space:]'
WITH defs AS (
  SELECT
    table_name,
    pg_get_viewdef(('cx22073jw.' || table_name)::regclass, true) AS def
  FROM information_schema.views
  WHERE table_schema = 'cx22073jw'
    AND table_name IN (
      'v_access_manual_apply_receipt_latest_batch_summary',
      'v_access_manual_apply_receipt_latest_pending_summary',
      'v_access_post_apply_verification_latest_confirmed_only_summary'
    )
)
SELECT COUNT(*)
FROM defs
WHERE def ILIKE '%' || table_name || '%';
SQL
)"
case "${self_ref_count:-}" in
  ''|*[!0-9]*) self_ref_count=999 ;;
esac

if [ "$self_ref_count" -eq 0 ]; then
  pass "no obvious self-reference in critical latest-summary views"
else
  fail "critical latest-summary views appear self-referential count=$self_ref_count"
fi

echo "[latest summary smoke]"
baseline_rows="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | tr -d '[:space:]'
SELECT COUNT(*) FROM cx22073jw.v_access_baseline_health_latest_summary;
SQL
)"
case "${baseline_rows:-}" in
  ''|*[!0-9]*) baseline_rows=0 ;;
esac
if [ "$baseline_rows" -ge 0 ]; then
  pass "baseline summary query executed"
else
  fail "baseline summary query failed"
fi

bundle_rows="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | tr -d '[:space:]'
SELECT COUNT(*) FROM cx22073jw.v_access_current_state_bundle_export_latest_summary;
SQL
)"
case "${bundle_rows:-}" in
  ''|*[!0-9]*) bundle_rows=0 ;;
esac
if [ "$bundle_rows" -ge 0 ]; then
  pass "current bundle summary query executed"
else
  fail "current bundle summary query failed"
fi

legacy_status="$(
psql "$PERSONA_DATABASE_URL" -XqAt -v ON_ERROR_STOP=1 <<'SQL' | head -n 1
SELECT COALESCE(readiness_status, 'unknown')
FROM cx22073jw.v_access_legacy_cutover_gate_latest_summary
LIMIT 1;
SQL
)"
case "${legacy_status:-unknown}" in
  ready) pass "legacy readiness is ready" ;;
  blocked) warn "legacy readiness is blocked" ;;
  error) fail "legacy readiness is error" ;;
  *) warn "legacy readiness is unknown" ;;
esac

echo "============================================================"
echo "ACCESS DOCTOR SUMMARY"
echo "============================================================"
echo "pass_count=$pass_count"
echo "warn_count=$warn_count"
echo "fail_count=$fail_count"

if [ "$fail_count" -gt 0 ]; then
  exit 1
fi
ACCESS_DOCTOR_CMD
chmod +x "$TOOLS_DIR/access_doctor.sh"

README_FILE="$TOOLS_DIR/README_ACCESS_COMMANDS.md"
if [ -f "$README_FILE" ]; then
  if ! grep -q 'access_menu.sh' "$README_FILE"; then
    cat >> "$README_FILE" <<'README_APPEND_100'

launcher_commands:
- ./access_menu.sh
- ./access_doctor.sh
README_APPEND_100
  fi
else
  cat > "$README_FILE" <<'README_NEW_100'
# ============================================================
# ACCESS COMMAND PACK
# ============================================================

launcher_commands:
- ./access_menu.sh
- ./access_doctor.sh
README_NEW_100
fi

echo "============================================================"
echo "ACCESS LAUNCHER AND DOCTOR PACK CREATED"
echo "============================================================"
find "$TOOLS_DIR" -maxdepth 1 -type f | sort
