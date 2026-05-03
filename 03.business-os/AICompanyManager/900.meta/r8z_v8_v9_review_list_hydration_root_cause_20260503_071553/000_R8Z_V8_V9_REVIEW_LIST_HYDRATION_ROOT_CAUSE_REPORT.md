
============================================================
0. ROADMAP
============================================================
対象:
- AICompanyManager

大ロードマップ:
1. President方針をManager大項目にする
2. Manager大項目を課長へ送る
3. Leader中項目 / 成果物要件 / Worker作業単位を自動作成
4. Worker作業単位をAIWorkerOS runtimeへ自動実行依頼
5. AIWorkerOS成果物/出力を回収してWorker作業単位へ反映
6. 回収結果をレビュー・承認待ち一覧へブリッジ
7. 画面でレビュー待ち2件を表示
8. 承認/差し戻し導線を確認

現在位置:
- 1〜6はDB/API上ほぼ完了
- 7のレビュー・承認待ち一覧 UI 表示が未解決
- V7 markerは画面表示済み
- ただし rows=0 / hydrating=YES のため、review_wait_items が描画stateへ入っていない疑い

今回の作業:
- いきなりパッチしない
- 現在core/server/served core/context API/state投入経路をREAD ONLYで確認
- V8未適用か、V8適用済みだが効いていないかを切り分ける

禁止:
- DB write
- API POST
- core/server patch
- append override追加
- render関数丸ごと置換

完了条件:
- context APIで review_wait_items=2 が返るか確認
- served core と disk core の一致確認
- review-list route の呼び出し先確認
- V7/V8 marker確認
- state.context.review_wait_items 投入経路確認
- 次にやるべき最小修正を A/B/C/D で判定

============================================================
1. ENV / TARGET
============================================================
PHASE=R8Z-V8/V9 review-list context hydration root cause check
APP_ROOT=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager
CORE=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/assets/js/aicm-production-core.js
SERVER=/data/data/com.termux/files/home/03.civilization-development/03.business-os/AICompanyManager/server/aicm-local-ui-api-server.mjs
OWNER_ID=00000000-0000-4000-8000-000000000001
COMPANY_ID=8b9be487-7b74-4517-9b59-6c84a82ae6aa
AICM_BASE_URL=http://127.0.0.1:8794
DB_WRITE=NO
API_POST=NO
PATCH=NO
PASS: core file exists
PASS: server file exists

============================================================
2. node --check
============================================================
bash: /tmp/aicm_core_check.out: Permission denied
FAIL: node --check core FAIL
cat: /tmp/aicm_core_check.err: No such file or directory
