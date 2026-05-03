# AICompanyManager production-safe debug purge plan

generated_at: 2026-04-30 07:14:15 +0900

## Result

- TOTAL_VISIBLE_DEBUG_BLOCKS=41
- DEBUG_ONLY_BLOCKS=7
- COUPLED_VISIBLE_DEBUG_BLOCKS=34

## Correct policy

本番UIからデバッグカード・デバッグ画面・DB確認カードは排除する。

ただし、production logic と同じJSに混ざっている場合は、JSファイルを丸ごと止めない。
該当する visible debug block だけを以下のどちらかにする。

1. dev flag が true の時だけ描画
2. debug-only JS/HTML に移動し、本番 index.html からは読まない

## Safe removal order

1. debug_only_candidate block
   - まずここから本番描画停止
   - 失敗時の影響が小さい

2. coupled visible debug block
   - function単位で return/gate
   - production state / event / API helper は残す

3. index.html
   - debug-only JSだけ読み込み停止
   - coupled JSは止めない

## Never do

- root/body innerHTML を消す
- parent cardを文字列検索で remove
- index.html から coupled JS を丸ごと外す
- display:none を上位DOMへ広く当てる
