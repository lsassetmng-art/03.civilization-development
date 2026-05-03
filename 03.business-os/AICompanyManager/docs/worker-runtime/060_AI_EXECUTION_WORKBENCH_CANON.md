# AI Execution Workbench Canon

status: active
scope: AICompanyManager / AI Operation Desk reusable execution surface
owner: Boss
prepared_by: Zero

## 1. 結論

AICompanyManagerに追加された手動実行UIは、通常業務の正規入口ではなく、AI実行Workbenchとして扱う。

AICompanyManagerの正規フローは、部門別タスク台帳 / PMLW / レビュー・承認待ち一覧を中心にした連続実行である。

AI実行Workbenchは、以下の用途に限定して残す。

- 例外対応
- 手動再実行
- runtime smoke test
- AIWorkerOS連携確認
- 台帳行に紐付かない一時検証
- 将来の AI Operation Desk へのUI流用

## 2. AICompanyManagerでの位置づけ

AICompanyManagerでは、ユーザーの通常操作は以下を中心にする。

- AI企業設定
- 会社ダッシュボード
- 部門別タスク台帳
- レビュー・承認待ち一覧

AI実行Workbenchは補助画面であり、通常の作業分配は台帳から行う。

正規フロー:

部門別タスク台帳
→ Manager大項目
→ Leader中項目
→ Worker作業単位
→ AIWorkerOS Runtime Execution request
→ app-read-payload
→ レビュー・承認待ち
→ 納品/承認

## 3. AI Operation Deskへの流用方針

AI Operation Deskでは、AI実行Workbenchを主画面候補として流用できる。

理由:

- AI Operation Deskは操作専用/実行補助アプリ
- ユーザーがAIに作業依頼し、確認/レビュー/エラー通知を受ける導線と相性がよい
- Runtime Execution requestのUI部品を共通化できる

ただし、流用時も以下は禁止。

- tokenをブラウザへ出す
- DB接続URLをpayloadへ入れる
- forbidden_actionsをUIから弱める
- Human GOを飛ばす
- PG apply / destructive actionを勝手に有効化する

## 4. 実装上の扱い

screen codeは当面 worker-runtime-request のまま維持する。

理由:

- 既存実装への影響を最小化する
- server endpoint /api/aicm/v2/worker-runtime/request と対応が取りやすい
- UI文言だけ AI実行Workbench に変更することで保守性を守る

## 5. endpointの意味

POST /api/aicm/v2/worker-runtime/request

これはAICompanyManager local serverの中継endpointである。

UIはこのlocal endpointへPOSTする。
AIWorkerOS tokenはserver側envだけで扱う。

server側env:

- PERSONA_AIWORKEROS_BASE_URL
- PERSONA_AIWORKEROS_AUTH_TOKEN

## 6. 今後の優先順位

優先1:
- 台帳行 / PMLW行からruntime requestを生成する内部処理

優先2:
- app-read-payload表示

優先3:
- レビュー・承認待ち一覧との接続

優先4:
- AI実行Workbenchの共通化
- AI Operation Deskへ流用できる形に部品化

## 7. 保守性ルール

- 通常業務は台帳ベース
- Workbenchは補助/例外/検証用
- screen codeは急に変えない
- endpoint名も急に変えない
- UI文言と設計上の意味だけをAI実行Workbenchへ寄せる
- CommonOS化する場合も、業務正本は各アプリ側に残す
