============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- 削除確認カード: OK
- 削除確定: NG
- 静的には action / bridge / execute が存在
- 旧execute関数とV9G5 fallbackが両方存在する
- 疑い: 旧executeが先に呼ばれ、POSTせずreturnしてfallbackを阻害している

今回:
1. 現在coreの削除execute関数を抽出
2. 旧executeがPOST/fetch/requestJsonを使うか確認
3. 旧executeがstateだけ消してreturnしていないか確認
4. V9G5が旧execute成功扱いでreturnしていないか確認
5. backup群から旧executeが正常だった版を探す
6. 次の最小修正方針を決める

禁止:
- DB write
- API POST
- PATCH

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g7_delete_execute_inner_cause_isolate_20260503_180508
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. extract current execute functions
============================================================
EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g7_delete_execute_inner_cause_isolate_20260503_180508/020_delete_execute_inner_extract.txt
COMPARE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g7_delete_execute_inner_cause_isolate_20260503_180508/030_delete_execute_backup_compare.tsv

---- current key facts ----
FUNCTION=aicmExecuteMajorItemDeleteConfirmR8P
EXISTS=true
USES_API_CALL=true
CLEARS_DELETE_STATE=true
USES_MANAGER_UPDATE_ENDPOINT=false
USES_MANAGER_ARCHIVE_ENDPOINT=true
FUNCTION=aicmExecuteManagerMajorDeleteConfirmR8P
EXISTS=false
USES_API_CALL=false
CLEARS_DELETE_STATE=false
USES_MANAGER_UPDATE_ENDPOINT=false
USES_MANAGER_ARCHIVE_ENDPOINT=false
FUNCTION=aicmR8zV9g5ExecuteDeleteConfirm
EXISTS=true
USES_API_CALL=true
CLEARS_DELETE_STATE=true
USES_MANAGER_UPDATE_ENDPOINT=true
USES_MANAGER_ARCHIVE_ENDPOINT=false
V9G5_CALLS_OLD1=true
V9G5_RETURNS_AFTER_OLD1=true
V9G5_HAS_FALLBACK_UPDATE=true
OLD1_API_EMPTY_BUT_EXISTS=false
LIKELY_CAUSE=OLD_EXECUTE_HAS_API_CHECK_RUNTIME_ERROR_OR_PAYLOAD

============================================================
4. backup execute candidates
============================================================
---- old execute with API candidates ----
2026-05-02T13:11:09.278Z	true	true	false	true	true	false	false	false	false	false	true	1536	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_i_worker_auto_execution_20260502_222858/aicm-production-core.before_r8z_i.js
2026-05-02T13:28:59.913Z	true	true	false	true	true	false	false	false	false	false	true	1536	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_n_worker_runtime_status_visibility_20260502_225757/aicm-production-core.before_r8z_n.js
2026-05-02T13:57:58.729Z	true	true	false	true	true	false	false	false	false	false	true	1536	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_o_production_summary_ui_20260502_231710/aicm-production-core.before_r8z_o.js
2026-05-02T21:05:34.743Z	true	true	false	true	true	false	false	false	false	false	true	1536	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v4_review_list_render_route_fix_20260503_060534/aicm-production-core.before_r8z_v4.js
2026-05-02T21:07:51.735Z	true	true	false	true	true	false	false	false	false	false	true	1536	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v4b_review_list_stable_renderer_20260503_060751/aicm-production-core.before_r8z_v4b.js
2026-05-02T21:22:20.627Z	true	true	false	true	true	false	false	false	false	false	true	1536	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v5b_stable_context_hydration_20260503_062219/aicm-production-core.before_r8z_v5b.js
2026-05-02T21:25:13.275Z	true	true	false	true	true	false	false	false	false	false	true	1536	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v5c_review_list_append_override_20260503_062512/aicm-production-core.before_r8z_v5c.js
2026-05-02T21:35:43.271Z	true	true	false	true	true	false	false	false	false	false	true	1536	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v5d_review_list_append_override_20260503_063542/aicm-production-core.before_r8z_v5d.js
2026-05-02T22:03:53.393Z	true	true	false	true	true	false	false	false	false	false	true	1536	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v7_review_list_route_bridge_20260503_070352/aicm-production-core.before_r8z_v7.js
2026-05-02T22:03:53.677Z	true	true	false	true	true	false	false	false	false	false	true	1536	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8o_r8p_r8q_major_item_paging_delete_prompt_anchor_patch_20260503_071242/aicm-production-core.before_r8o_r8p_r8q_anchor.js
2026-05-02T22:17:01.397Z	true	true	false	true	true	false	false	false	false	false	true	1160	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8_v9_review_list_hydration_root_cause_fixed_20260503_071700/030_served_aicm-production-core.js
2026-05-03T01:30:48.074Z	true	true	false	true	true	false	false	false	false	false	true	1160	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8g_v7_review_wait_items_merge_fix_20260503_103047/aicm-production-core.before_r8z_v8g.js
2026-05-03T01:33:15.250Z	true	true	false	true	true	false	false	false	false	false	true	1160	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8h_v7_merge_finalizer_rerender_fix_20260503_103314/aicm-production-core.before_r8z_v8h.js
2026-05-03T01:41:07.938Z	true	true	false	true	true	false	false	false	false	false	true	1160	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8k_visible_runtime_debug_20260503_104107/aicm-production-core.before_r8z_v8k.js
2026-05-03T01:43:56.166Z	true	true	false	true	true	false	false	false	false	false	true	1160	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v8l_v7_fetch_timeout_xhr_fallback_20260503_104355/aicm-production-core.before_r8z_v8l.js
2026-05-03T01:53:38.950Z	true	true	false	true	true	false	false	false	false	false	true	1160	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9_review_list_script_context_hydrate_20260503_105338/aicm-production-core.before_r8z_v9.js
2026-05-03T01:57:37.126Z	true	true	false	true	true	false	false	false	false	false	true	1160	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9c_window_callback_script_hydrate_20260503_105736/aicm-production-core.before_r8z_v9c.js
2026-05-03T02:05:16.242Z	true	true	false	true	true	false	false	false	false	false	true	1160	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9d1_is_pending_major_scope_callsite_fix_20260503_110515/aicm-production-core.before_r8z_v9d1.js
2026-05-03T02:12:04.946Z	true	true	false	true	true	false	false	false	false	false	true	1160	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9e_review_list_local_render_only_20260503_111204/aicm-production-core.before_r8z_v9e.js
2026-05-03T02:13:18.242Z	true	true	false	true	true	false	false	false	false	false	true	1160	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9e2_local_render_static_gate_correction_20260503_111317/aicm-production-core.before_r8z_v9e2.js
2026-05-03T02:19:31.454Z	true	true	false	true	true	false	false	false	false	false	true	1160	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f3_restore_leader_handoff_open_confirm_20260503_111930/aicm-production-core.before_r8z_v9f3.js
2026-05-03T02:23:55.902Z	true	true	false	true	true	false	false	false	false	false	true	1160	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f4_restore_leader_handoff_confirm_card_20260503_112355/aicm-production-core.before_r8z_v9f4.js
2026-05-03T02:25:34.938Z	true	true	false	true	true	false	false	false	false	false	true	1160	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f4b_confirm_card_post_render_wrapper_20260503_112534/aicm-production-core.before_r8z_v9f4b.js
2026-05-03T08:24:08.758Z	true	true	false	true	true	false	false	false	false	false	true	1160	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9f6_restore_leader_handoff_execute_20260503_172408/aicm-production-core.before_r8z_v9f6.js
2026-05-03T09:00:01.891Z	true	true	false	true	true	false	false	false	false	false	true	1160	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g5_restore_delete_confirm_execute_bridge_20260503_180001/aicm-production-core.before_r8z_v9g5.js

============================================================
5. final
============================================================
FINAL_JUDGEMENT=CAUSE_PROBABLE_OLD_EXECUTE_RETURN_BLOCKS_FALLBACK
LIKELY_CAUSE=OLD_EXECUTE_HAS_API_CHECK_RUNTIME_ERROR_OR_PAYLOAD
OLD1_API_EMPTY_BUT_EXISTS=false
V9G5_RETURNS_AFTER_OLD1=true
V9G5_HAS_FALLBACK_UPDATE=true
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g7_delete_execute_inner_cause_isolate_20260503_180508/000_R8Z_V9G7_DELETE_EXECUTE_INNER_CAUSE_ISOLATE_REPORT.md
EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g7_delete_execute_inner_cause_isolate_20260503_180508/020_delete_execute_inner_extract.txt
COMPARE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v9g7_delete_execute_inner_cause_isolate_20260503_180508/030_delete_execute_backup_compare.tsv
DB_WRITE=NO
API_POST=NO
PATCH=NO

NEXT:
- CAUSE_CONFIRMED_OLD_EXECUTE_NO_API_BLOCKS_FALLBACK:
  V9G5から旧execute優先呼び出しを外し、fallbackのmanager-major/updateを正本実行にする。
  既存旧execute関数は削除しない。V9G5内の分岐だけ最小修正。

- CAUSE_PROBABLE_OLD_EXECUTE_RETURN_BLOCKS_FALLBACK:
  同上。旧executeを先に呼ぶ設計をやめる。

- CAUSE_STILL_RUNTIME_OR_PAYLOAD_CHECK_REQUIRED:
  次はpayload majorId/owner と POST body のruntime debug。
