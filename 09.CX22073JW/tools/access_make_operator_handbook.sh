#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

BASE="/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW"
DOCS_DIR="$BASE/docs"
OUT_FILE="$DOCS_DIR/068_ACCESS_OPERATOR_HANDBOOK.md"

mkdir -p "$DOCS_DIR"

cat > "$OUT_FILE" <<'EOF_ACCESS_HANDBOOK_134'
# ============================================================
# ACCESS OPERATOR HANDBOOK
# ============================================================

## 1. 入口
- `./access_dashboard.sh`
- `./access_quickstart.sh`
- `./access_menu.sh`

## 2. 日常確認
- `./access_status.sh`
- `./access_run_review_flow.sh`
- `./access_legacy_readiness.sh`
- `./access_open_blockers.sh`

## 3. pending 対応
- `./access_list_pending_requests.sh`
- `./access_trace_request.sh REQUEST_CODE`
- `./access_confirm_request.sh REQUEST_CODE confirmed_applied`
- `./access_reverify_confirmed.sh`
- `./access_export_current_bundle.sh`

## 4. 一括処理
- `./access_bulk_confirm_all_pending.sh confirmed_applied`
- `./access_bulk_apply_cycle.sh confirmed_applied`

## 5. 調査 / trace
- `./access_trace_request.sh REQUEST_CODE`
- `./access_trace_logical_view.sh LOGICAL_VIEW_NAME`
- `./access_make_request_trace_bundle.sh REQUEST_CODE`
- `./access_make_logical_view_trace_bundle.sh LOGICAL_VIEW_NAME`

## 6. 引き継ぎ / 証跡
- `./access_make_shift_report.sh`
- `./access_make_timeline_report.sh`
- `./access_make_master_bundle.sh`
- `./access_make_final_handoff_bundle.sh`
- `./access_collect_incident_bundle.sh`

## 7. 健全性 / 回帰
- `./access_doctor.sh`
- `./access_validate_workspace.sh`
- `./access_smoke_suite.sh`
- `./access_make_regression_bundle.sh`
- `./access_release_readiness.sh`

## 8. 台帳 / 差分 / checkpoint
- `./access_make_checkpoint.sh`
- `./access_list_checkpoints.sh`
- `./access_compare_checkpoints.sh`
- `./access_make_checkpoint_diff_report.sh`
- `./access_compare_latest_runs.sh`
- `./access_make_delta_report.sh`

## 9. 保管 / cleanup
- `./access_workspace_stats.sh`
- `./access_make_storage_report.sh`
- `./access_cleanup_preview.sh 14`
- `./access_cleanup_empty_dirs.sh`
- `./access_archive_old_artifacts_preview.sh 30`
- `./access_archive_old_artifacts_move.sh 30 apply`

## 10. 正本整理
- `./access_make_workspace_manifest.sh`
- `./access_make_command_matrix.sh`
- `./access_refresh_latest_links.sh`
- `./access_show_latest_links.sh`
- `./access_latest_artifacts.sh`

## 11. 推奨フロー
1. `./access_dashboard.sh`
2. `./access_run_review_flow.sh`
3. 必要なら pending / trace / confirm
4. `./access_run_handoff_flow.sh`
5. `./access_release_readiness.sh`
6. `./access_make_final_handoff_bundle.sh`
EOF_ACCESS_HANDBOOK_134

echo "============================================================"
echo "ACCESS OPERATOR HANDBOOK CREATED"
echo "============================================================"
echo "out_file : $OUT_FILE"
echo "============================================================"
sed -n '1,160p' "$OUT_FILE"
