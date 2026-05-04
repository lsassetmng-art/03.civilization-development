# AICompanyManager V10L-C1B renderer target investigation report

## 1. Scope

- Target: AICompanyManager / 部門別タスク台帳 / 登録済み大項目
- Purpose: 既存レンダラー内へ最小差分で選択UIを入れる前の、該当レンダラー確定
- PATCH: NO
- DB_WRITE: NO
- API_POST: NO
- SERVER_RESTART: NO

## 2. Important rules

- DOM後付け探索パッチは禁止寄り
- B1I/B1J/C1系の再追加は禁止
- server/API/DB route は触らない
- 関数丸ごと自動置換しない
- 既存レンダラーの rows.map / カード出力周辺だけを最小修正対象にする
- DB作業なし。佐藤(DB担当)レビュー観点では、SQL/psql/PERSONA_DATABASE_URL未使用で DB_WRITE=NO

## 3. Inputs

- CORE: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
- RENDERER_EXTRACT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1a_cleanup_b1_addons_only_20260504_114006/040_renderer_exact_extract.txt
- ROUTE_EXTRACT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1a_cleanup_b1_addons_only_20260504_114006/050_route_action_extract.txt

## 4. Outputs

- MARKERS_OUT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1b_renderer_target_investigation_20260504_114937/010_marker_counts.txt
- RENDERER_SCAN: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1b_renderer_target_investigation_20260504_114937/020_renderer_extract_scan.txt
- ROUTE_SCAN: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1b_renderer_target_investigation_20260504_114937/030_route_extract_scan.txt
- CORE_SCAN: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1b_renderer_target_investigation_20260504_114937/040_core_renderer_candidate_scan.txt
- FUNCTION_EXTRACT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1b_renderer_target_investigation_20260504_114937/050_candidate_function_extracts.txt
- DECISION_OUT: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10l_c1b_renderer_target_investigation_20260504_114937/060_renderer_target_decision_draft.txt

## 5. Candidate functions

- renderPmlwMajorRowsBaseAxuR1B(rows)
- renderPmlwMajorRows(rows)
- aicmRenderTaskLedgerSafeR8V4(...)
- aicmOpenTaskLedgerScreenR8V3Clean(...)

## 6. Next

次はこの結果を見て、V10L-C1B_MINIMAL_RENDERER_PATCH を作る。
ただし、PATCH前に 050_candidate_function_extracts.txt と 060_renderer_target_decision_draft.txt を確認する。

