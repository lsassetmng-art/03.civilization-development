# AICompanyManager R8Z-V3 review visibility root cause report

## Final judgement
- final_judgement: CAUSE_UI_RENDER_OR_SCREEN_STATE_FILTER
- cause: context APIには review_wait_items が入っています。DB/view/serverではなく、画面側のrender/filter/screen state/キャッシュが原因です。
- next_action: renderReviewList 側の参照key、空判定、selectedCompanyId、screen遷移、served core cacheを確認する。

## Counts
- human_review_table_count: 2
- human_review_pending_table_count: 2
- human_review_r8z_v2_count: 2
- view_wait_display_count: 2
- context_review_wait_items_count: 2

## Files
- db_log: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v3_review_visibility_root_cause_20260503_055550/020_db_review_visibility_check.log
- db_json: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v3_review_visibility_root_cause_20260503_055550/030_db_review_visibility_summary.json
- context_json: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v3_review_visibility_root_cause_20260503_055550/050_context_review_visibility_summary.json
- core_scan_json: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v3_review_visibility_root_cause_20260503_055550/070_core_review_render_scan.json
- final_env: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v3_review_visibility_root_cause_20260503_055550/190_final_values.env
