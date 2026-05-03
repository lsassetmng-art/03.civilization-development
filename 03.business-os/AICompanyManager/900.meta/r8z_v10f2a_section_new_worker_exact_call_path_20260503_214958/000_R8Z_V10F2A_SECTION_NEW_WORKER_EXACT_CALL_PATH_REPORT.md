============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

現在位置:
- V10F確認カード OK / git checkpoint OK: 9f4f9b3
- 課新規追加画面で、他課の従業員設定が表示される
- 前回調査: SECTION_NEW_WORKER_LEAK_LIKELY_STATE_SCOPE
- ただしHTML後置換/wrap修正は保守性が低いので破棄

今回:
1. core/server syntax確認
2. served core一致確認
3. renderSectionNew の実体を抽出
4. renderSectionNew が呼ぶ関数を抽出
5. worker / placement / 従業員設定 関連関数の定義を抽出
6. selectedSectionId / selectedSection / placements / sectionNewDraft の参照箇所を抽出
7. section-new の遷移/actionを抽出
8. 正しい最小修正点を分類する

禁止:
- DB write
- API POST
- PATCH
- HTML後置換
- renderSectionNew外側wrapによる応急修正

============================================================
1. ENV
============================================================
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
RUN_DIR=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2a_section_new_worker_exact_call_path_20260503_214958
DB_WRITE=NO
API_POST=NO
PATCH=NO

============================================================
2. syntax
============================================================
PASS: syntax OK

============================================================
3. served core check
============================================================
ROOT_HTTP=200
SERVED_HTTP=200
DISK_SHA=c19688ee17ca581075e77c466ca94cd129c221c5d70866feb98b4e39236e2356
SERVED_SHA=c19688ee17ca581075e77c466ca94cd129c221c5d70866feb98b4e39236e2356
PASS: served core matches disk

============================================================
4. exact call path extraction
============================================================
SECTION_NEW_FUNC_FOUND=true
SECTION_NEW_LINE=2943
SECTION_NEW_CALL_COUNT=5
SECTION_NEW_CALLS=join,renderCompanySelect,renderDepartmentSelect,renderSectionNew,renderShell
SECTION_NEW_HAS_WORKER_TEXT=false
SECTION_NEW_READS_SELECTED_SECTION=false
SECTION_NEW_READS_PLACEMENTS=false
SECTION_NEW_HAS_DRAFT=false
WORKER_RELATED_CALL_COUNT=4
PLACEMENT_RELATED_CALL_COUNT=0
STATE_RELATED_CALL_COUNT=1
FINAL_STATIC_JUDGEMENT=FIX_WORKER_RENDERER_ADD_MODE_NEW_EMPTY_DRAFT

============================================================
5. focused preview
============================================================
---- renderSectionNew head ----
FUNCTION=renderSectionNew
LINE=2943
START=97417
END=97930

function renderSectionNew() {
    return renderShell([
      '<section class="aicm-core-card">',
      renderCompanySelect(),
      renderDepartmentSelect(),
      '</section>',
      '<form data-core-form="section-create" class="aicm-core-card">',
      '  <label>課名</label>',
      '  <input name="sectionName" autocomplete="off" required>',
      '  <label>目的</label>',
      '  <textarea name="purpose" rows="3"></textarea>',
      '  <button type="submit">課を作成</button>',
      '</form>'
    ].join(""));
  }
---- call graph worker/state candidates ----
called_name	defined	line	worker_related	placement_related	state_related
renderSectionNew	true	2943	false	false	true
renderShell	true	545	true	false	false

---- classification ----
FINAL_STATIC_JUDGEMENT=FIX_WORKER_RENDERER_ADD_MODE_NEW_EMPTY_DRAFT

Recommended high-maintainability patch policy:
- Do not post-process HTML.
- Do not wrap renderSectionNew just to replace output.
- Add explicit mode='new' / mode='edit' to worker placement renderer if shared.
- section-new must pass empty draft rows, not selected section placements.
- section-edit/detail may continue reading selected section placements.
- section-new entry should initialize sectionNewDraft, not reuse selectedSectionId.

============================================================
6. final
============================================================
FINAL_JUDGEMENT=FIX_WORKER_RENDERER_ADD_MODE_NEW_EMPTY_DRAFT
ROOT_HTTP=200
SERVED_HTTP=200
SECTION_NEW_FUNC_FOUND=true
SECTION_NEW_LINE=2943
SECTION_NEW_CALL_COUNT=5
SECTION_NEW_HAS_WORKER_TEXT=false
SECTION_NEW_READS_SELECTED_SECTION=false
SECTION_NEW_READS_PLACEMENTS=false
SECTION_NEW_HAS_DRAFT=false
WORKER_RELATED_CALL_COUNT=4
PLACEMENT_RELATED_CALL_COUNT=0
STATE_RELATED_CALL_COUNT=1
SECTION_NEW_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2a_section_new_worker_exact_call_path_20260503_214958/extract/020_renderSectionNew_extract.txt
CALL_GRAPH=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2a_section_new_worker_exact_call_path_20260503_214958/extract/030_section_new_call_graph.tsv
WORKER_FUNC_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2a_section_new_worker_exact_call_path_20260503_214958/extract/040_worker_related_function_extract.txt
STATE_USAGE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2a_section_new_worker_exact_call_path_20260503_214958/extract/050_state_usage_extract.txt
RENDER_ROUTE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2a_section_new_worker_exact_call_path_20260503_214958/extract/060_render_route_extract.txt
ACTION_EXTRACT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2a_section_new_worker_exact_call_path_20260503_214958/extract/070_section_new_action_extract.txt
CLASSIFY_TXT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2a_section_new_worker_exact_call_path_20260503_214958/extract/080_classification.txt
REPORT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/900.meta/r8z_v10f2a_section_new_worker_exact_call_path_20260503_214958/000_R8Z_V10F2A_SECTION_NEW_WORKER_EXACT_CALL_PATH_REPORT.md
DB_WRITE=NO
API_POST=NO
PATCH=NO

NEXT_PATCH_POLICY:
- FINAL_JUDGEMENT=FIX_RENDER_SECTION_NEW_REMOVE_SELECTED_SECTION_READS:
  renderSectionNew 内の selectedSectionId / selectedSection 参照を新規draft参照へ変更する。

- FINAL_JUDGEMENT=FIX_RENDER_SECTION_NEW_PASS_EMPTY_PLACEMENTS_FOR_NEW:
  renderSectionNew から worker/placement renderer へ rows=[] を明示して渡す。

- FINAL_JUDGEMENT=FIX_WORKER_RENDERER_ADD_MODE_NEW_EMPTY_DRAFT:
  共通従業員rendererに mode="new" を追加し、newではDB/context placementsを読まない。

- FINAL_JUDGEMENT=FIX_SECTION_NEW_LOCAL_WORKER_DRAFT_ONLY:
  新規課専用の sectionNewDraft.workerPlacements を作り、既存課placementsとは分離する。

保守性ルール:
- HTML後置換禁止
- renderSectionNewの外側wrapによる出力改変禁止
- selectedSectionIdを一時退避して戻す方式禁止
- 新規課draftと既存課placementsをデータ構造で分離
