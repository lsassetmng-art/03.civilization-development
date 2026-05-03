# AICompanyManager R8Z-C2 move output panel below summary

## Scope
- core file write: YES
- server file write: NO
- api post: NO
- db write: NO
- persistent db write: NO

## Purpose
Move Leader以降の出力 panel from bottom of task-ledger screen to immediately after Manager大項目サマリ.

## Expected UI order
1. Manager大項目サマリ
2. Leader以降の出力
3. CSV取り込み
4. 登録済み大項目

## Checks
- node_check_before: PASS
- move_patch: PASS
- node_check_after: PASS
- ui_server_restart: PASS
- api_post: NO
- db_write: NO
- persistent_db_write: NO

## Result
- final_status: R8Z_C2_MOVE_OUTPUT_PANEL_DONE_REVIEW_REQUIRED

## Outputs
- backup_core: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c2_move_output_panel_below_summary_20260502_214258/aicm-production-core.before_r8z_c2.js
- patch_out: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c2_move_output_panel_below_summary_20260502_214258/110_patch_result.json
- scan_after: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c2_move_output_panel_below_summary_20260502_214258/120_core_scan_after.log
- server_log: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_c2_move_output_panel_below_summary_20260502_214258/300_server_nohup.log
