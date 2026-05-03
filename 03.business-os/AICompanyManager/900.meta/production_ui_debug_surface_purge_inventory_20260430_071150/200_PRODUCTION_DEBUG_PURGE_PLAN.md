# AICompanyManager production debug surface purge plan

generated_at: 2026-04-30 07:11:50 +0900

## Principle

本番後、デバッグ用コメント・カード・画面・DB確認表示は本番UIから排除する。

ただし、debug表示と本番処理が同じJSに混在している場合、index.htmlから丸ごと停止しない。
先に core と debug を分離する。

## Classification counts

- production_or_core: 0
- debug_only_candidate: 0
- coupled_debug_and_production: 23
- missing_file: 0

## Actions

### Keep in production

- production_or_core
- 本番状態管理
- 会社選択保持
- API/DB接続補助
- ロボット配置/表示に必要な処理

### Remove from production index after review

- debug_only_candidate
- debug card
- debug panel
- debug screen
- smoke/test/rescue/visible debug overlays
- developer-only DB確認カード

### Split before removal

- coupled_debug_and_production

For these:
1. Create or keep core production logic.
2. Move visible debug card/panel/screen into debug-only JS.
3. Remove debug-only JS from production index.
4. Load debug-only JS only from debug HTML or explicit dev flag.

## Important

No broad DOM removal.
No parent display:none by text search.
No whole-script disable for coupled files.
No root/body rewrite.
