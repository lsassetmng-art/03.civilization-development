# R17 → B1: PersonaOS 一回限り認証ハンドオフ／B2受入契約

- 更新: 2026-11-17
- 目的: PersonaOSへの正本移管準備。R17の暗号化PKCEハンドオフに永続的なワンタイム消費を追加する。
- 実装位置: `lsassetmng-art/03.civilization-development` のR17ブランチ派生で実装。`main`の558未コミット変更を触らない。
- 実装ステータス: **B1の隔離ブランチ作成・型検査・push後も未デプロイ、DB未適用**。B2のPersonaOS実装は**専用チャットの責任範囲**。

## 1. 正本と根拠

1. `00_CIVILIZATION_PORTAL_SITE_FULLY_INTEGRATED_ALL_FILES_v2.md`：Portalだけが各OSへの公式Web入口を保持し、認証・Civilization IDの正本はCivilizationOS、内部権限は各OS。
2. `000000_PERSONA_OS_FULL_INTEGRATED_CANONICAL.md`：PersonaOSの業務・人格データの正本はPersonaOS。
3. GitHub `work/r17-persona-canonical-auth-handoff-20261025`：旧Portal callback、CivilizationOSの発行・交換、Portal側セッション保護。
4. `R17_R29_PERSONA_BOUNDARY_PHASE_B_20261117.md`：R29直接遷移不採用、B1/B2/B3段階移管。
5. Supabase（READ ONLY）`ihrukfdlcolygyvccujd`：`civilization.lifeos_auth_handoff` と既存LifeOSの発行・消費関数は確認。Persona専用の台帳・消費関数は未確認。LifeOS用は変更しない。

## 2. 変更ファイル／機能

| 対象 | 変更 | 責任 |
|---|---|---|
| `CivilizationOS/lib/persona-auth-handoff.ts` | コード発行前の台帳登録、交換時の原子的消費、callbackのサーバー固定 | CivilizationOS |
| `CivilizationOS/lib/persona-auth-ledger.ts` | `pg` 接続とB1専用RPCへの照会、fail-closed | CivilizationOS |
| `CivilizationOS/app/api/civilization/auth/continue/route.ts` | 旧Portal callbackと新PersonaOS callbackをサーバー設定で厳格に切替 | CivilizationOS |
| `CivilizationOS/sql/persona_auth_handoff_ledger_v1.sql` | 新規台帳、RLS、2 RPC、最小権限ロール | civilization schema |
| `CivilizationOS/sql/persona_auth_handoff_ledger_integration_test.sql` | テスト専用、DBトランザクション内で再利用拒否を確認してROLLBACK | DB検証担当 |

Portal既存画面・PersonaOS UI・LifeOS・Gatewayはこのブランチでは変更しない。

## 3. DB契約（未適用）

- 専用テーブル: `civilization.persona_auth_handoff_ledger_v1`
- 主キー: SHA-256 `code_hash`（暗号化されたコードそのものはDBに保存しない）
- `actor_key` / `audience=persona` / SHA-256 `state_hash` / PKCEチャレンジ / callback origin & path / 発行・失効・消費時刻
- `persona_handoff_issue_v1(...)`: 一回限りコードの登録に成功したときのみtrue
- `persona_handoff_consume_v1(...)`: 原子的UPDATEで未消費・未失効・正しいaudience/actor/state/PKCE/callbackのみtrue。二回目はfalse
- RLS有効、直接table権限付与なし。PUBLICへのRPC EXECUTEを同じトランザクション内でREVOKE。実行権限は`civilization_persona_handoff_runtime`ロールのみ。
- 対象DB: PersonaOS Supabaseプロジェクトの`civilization` schema。LifeOSの台帳／関数は無変更。
- 専用DB接続: `CIVILIZATION_PERSONA_HANDOFF_DATABASE_URL`（秘密値はAWS Secret Store管理／ログ禁止）。既存読取トランザクション流用禁止。DB接続はサーバー側のみでTLS証明書検証を要求。
- ロール作成は**NOLOGIN**。別レビューで専用LOGINの資格情報を払い出して所属させる。`anon`、`authenticated`、サービスロール、クライアントへ配布しない。
- 運用: 期限切れコードを7日経過後に削除する権限分離済みジョブが本番GO条件。ランタイムへ削除権限を渡さない。

## 4. Callbackの切替

`CIVILIZATION_PERSONA_CALLBACK_MODE` は `portal` または `persona` のみ。

| 値 | `CIVILIZATION_PORTAL_PUBLIC_BASE_URL` / `PERSONAOS_PUBLIC_BASE_URL` | callback |
|---|---|---|
| `portal`（既定・R17互換） | Portal公開オリジン | `/api/persona/auth/callback` |
| `persona`（将来） | PersonaOS公開オリジン（Gateway同一オリジン） | `/persona-menu/api/auth/callback` |

- HTTPS・公開オリジン固定。ブラウザの任意callbackや`return_to`をリダイレクト先に使わない。
- DB ledgerは選択されたorigin/pathを紐付ける。切替中の旧トークンの最大120秒失効を確認。
- Gatewayは`/persona-menu`以下だけPersonaOSへルーティングできる現行仕様。新callbackはその名前空間内。

## 5. B2（PersonaOS専用チャットへの契約）

1. PersonaOSの`/persona-menu`下で独立した認証開始・callback・署名Cookie・保護レイアウト・API認可を実装。
2. `start`はHttpOnly/Secure/SameSite=Lax一時Cookieにstate/verifierを保存し、CivilizationOSの認証継続エンドポイントへS256ハンドオフ。
3. callbackはstateを検証してCivilizationOSの`/api/civilization/auth/handoff/persona-exchange`へサーバー間POST。成功後PersonaOS独自のセッションCookieを発行。
4. PersonaOSの保護ページと保護APIでサーバーセッション・内部権限の両方を検証。Portalの署名鍵を流用しない。
5. Cookie失効・logout、CSRF、CSP、オリジン固定、コード再利用拒否、期限切れ、改ざん、ネットワーク障害時fail-closedを実装・検証。
6. メニュー・作成画面の本体は`02.persona-os/persona-os-web`を正本とする。旧Portal UIは移管成功まで残す。
7. Gateway切替前にAWSの安全な検証経路でスマホ実UIテスト。旧R17も回帰。**R29をマージ・デプロイしない**。

## 6. B1ブランチのGOゲート

1. `origin/work/r17-persona-canonical-auth-handoff-20261025`の2ファイルGit blobが固定値と一致、作業worktreeがクリーン。
2. R17のベースライン型検査PASS。
3. Nodeパッチが予定した2ファイルのみ変更し、新規ledger serviceとSQLを追加。
4. `git diff --check` とTypeScript再検査PASS、SQL静的契約検査PASS。
5. GitHub新ブランチのみpush。**SQLの実行、AWSのデプロイ、SSMコマンド送信は禁止**。
6. 本番DBマイグレーションは独立したDB GOとレビュー後。専用ログイン設定／権限の検査、本番デプロイSHA、AWS UIテスト後で初めて切替可。

## 7. 失敗時の復旧

- GitHubブランチpush前の失敗: 隔離worktreeを削除し、新規ブランチを削除。mainは触らない。
- DB SQLはファイルのみで、DB変更は常に0。
- AWS切替に進む際は既知GOODのR17構成・Gateway値・稼働SHAを固定し、失敗時は既知GOODへロールバックする。
- Termuxの長いnpm/TypeScript出力は`$HOME/.tmp`に保存し、端末はPASS/FAILと数行だけ表示する。
