#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

echo "============================================================"
echo "ACCESS QUICKSTART"
echo "============================================================"

cat <<'ACCESS_QUICKSTART_TEXT'
[1] 朝の確認
- ./access_dashboard.sh
- ./access_run_review_flow.sh
- ./access_legacy_readiness.sh

[2] pending 対応
- ./access_list_pending_requests.sh
- ./access_trace_request.sh REQUEST_CODE
- ./access_confirm_request.sh REQUEST_CODE confirmed_applied
- ./access_reverify_confirmed.sh
- ./access_export_current_bundle.sh

[3] 一括処理
- ./access_bulk_confirm_all_pending.sh confirmed_applied
- ./access_bulk_apply_cycle.sh confirmed_applied

[4] 調査
- ./access_trace_request.sh REQUEST_CODE
- ./access_trace_logical_view.sh LOGICAL_VIEW_NAME
- ./access_make_request_trace_bundle.sh REQUEST_CODE
- ./access_make_logical_view_trace_bundle.sh LOGICAL_VIEW_NAME

[5] 引き継ぎ
- ./access_make_shift_report.sh
- ./access_make_timeline_report.sh
- ./access_make_master_bundle.sh
- ./access_refresh_latest_links.sh
- ./access_show_latest_links.sh

[6] 健全性 / 回帰
- ./access_doctor.sh
- ./access_validate_workspace.sh
- ./access_smoke_suite.sh
- ./access_make_regression_bundle.sh

[7] checkpoint / 差分
- ./access_make_checkpoint.sh
- ./access_list_checkpoints.sh
- ./access_compare_checkpoints.sh
- ./access_make_checkpoint_diff_report.sh

[8] 全体まとめ
- ./access_run_master_flow.sh
- ./access_make_master_bundle.sh
ACCESS_QUICKSTART_TEXT

echo "============================================================"
echo "ACCESS QUICKSTART DONE"
echo "============================================================"
