# CivilizationOS / PortalOS R22 開発環境設計書

- 版：R22 環境確定記録 v1.1（2026-11-18）
- 状態：**Termux↔Codespacesの開発接続は検証済み。システム全体の開発・AWS UI受入・ローカル原本整理は未完了。**
- 根拠：`R22_ENVIRONMENT_FACTS_20261118T063023Z.md`（実測）、R9監査、R10/R11/R13/R14実行結果、GitHub上のR22既存設計書。
- 保存先（隔離ブランチ保全対象）：`00.civilization-deployment/civilization-cloud-dev/R22_ENVIRONMENT_DESIGN.md`。

## 1. 構成・責務

| 層 | 採用環境 | 責任範囲 | 禁止・境界 |
|---|---|---|---|
| 操作・ローカル原本 | Android 16 / Termux | スマホ操作、GitHub CLI、監査、未コミット原本保護 | dirty `main`をクラウド版で上書きしない |
| ソース保管 | GitHub `lsassetmng-art/03.civilization-development`（公開） | 監査・レビュー済みコード、設計・コミット履歴 | 認証情報、秘密鍵、非公開ログ・未検証資料を公開pushしない |
| クラウド開発 | GitHub Codespaces | Node開発、構文・契約・回帰テスト、Git操作 | AWS受入テストの代用にしない |
| CI | GitHub Actions | ソース試験・独立検証の設計上の担当 | ジョブ構成・権限は未実測 |
| 実環境検証 | AWS | AWS上に構築した環境でのUI中心の総合・回帰テスト | AWSテスト環境・CodeBuild・実URLは未確認、作成・本番切替未実施 |
| DB | Supabase | 各OSのDB正本・RLS・永続データ | 本工程では接続・書込・構成変更なし |

責務境界：CivilizationOS＝認証正本、Portal＝入口・ナビゲーション、Gateway＝ルーティング、各OS＝各自メニューとAPI。原本の責任移転なし。

## 2. 実測環境（2026-11-18 06:30:23 UTC）

### Termux

| 項目 | 実測値 |
|---|---|
| Android / CPU | 16 / `aarch64` |
| Node.js | `v24.14.1` |
| Git | `2.53.0` |
| GitHub CLI | `2.95.0` |
| Git原本 | `/data/data/com.termux/files/home/03.civilization-development` |
| 現行ブランチ / HEAD | `main` / `4e2e4602704dc4f06845dfa2bc82cda67d4fcbd4` |
| 登録worktree | **10個**（R11整理後） |
| R16-R1監査前のmain変更エントリ | **5,934件**（R21後は約4,117件。R22の動的レポートで現行実測を確認） |
| 実測空き容量 | **1,790 MiB** |

### Codespaces

| 項目 | 実測値 |
|---|---|
| Codespace名 | `glorious-giggle-4qvg4965pjgfjj7x` |
| VM | **2 vCPU、8 GiB RAM、32 GiB storage** |
| Region | `SouthEastAsia` |
| OS / CPU | Debian GNU/Linux 12 (bookworm) / `x86_64` |
| Devcontainer image | `mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm` |
| remoteUser | `node` |
| Node.js / npm / Git | `v22.16.0` / `10.9.2` / `2.49.0` |
| 作業フォルダ | `/workspaces/03.civilization-development` |
| ブランチ | `work/r22-r14-codespaces-sshd-20261118` |
| HEAD | `d48615194de9b0a95e463c961d41fba60b9c011a` |
| Git変更エントリ | **0件** |
| 実測空き容量 | **28,530 MiB** |
| 自動停止（idle timeout） | **30分** |
| retention | **43,200分（30日）** |
| 採取前状態 | `Shutdown` |
| 採取後 | `gh codespace stop`要求成功。停止完了状態の再読取は未実施 |

Node.jsのバージョンは端末間で異なる。実装・テストの基準は**CodespacesのNode 22**とし、TermuxのNode 24では結果が異なる可能性を考慮する。

## 3. 接続・ライフサイクル（Termuxで実行）

- 認証：`gh auth status`。Codespaces操作はGitHub CLIの`codespace`権限が必要。認証修復は`gh auth refresh -h github.com -s codespace`。
- 起動：`gh api -X POST user/codespaces/glorious-giggle-4qvg4965pjgfjj7x/start`（停止中のみ。起動後は状態確認）。
- 状態確認：`gh codespace list --repo lsassetmng-art/03.civilization-development --json name,state`。
- **対話型接続**：`gh codespace ssh -c glorious-giggle-4qvg4965pjgfjj7x`（Termux通常プロンプトから直接実行）。
- 接続先確認：`cd /workspaces/03.civilization-development && git branch --show-current && node --version`。
- 接続終了：Codespaces内で`exit`。
- 停止：`gh codespace stop -c glorious-giggle-4qvg4965pjgfjj7x`。
- 再構築：`gh codespace rebuild -c glorious-giggle-4qvg4965pjgfjj7x`（devcontainerを変更した場合。未コミット変更・再構築影響を確認後に実行）。
- SSHの恒久設定：`.devcontainer/devcontainer.json`内の`"ghcr.io/devcontainers/features/sshd:1": {}`。

`bash <<'BASH'`から対話型SSHを呼ぶとPTYが割り当てられず、一時接続後にTermuxへ戻る場合がある。対話型SSHは直接プロンプトから起動する。

## 4. Git運用・開発テスト

- 基礎：R21 `8cf84fa2dc38b942f55b9348a0ae2783e2527e32`からR22クラウド基盤を分離。開発用基盤コミット：`6705f5b3bd38aa3edb6161a15750f5f65ca8f861`。
- R13 KDB復旧：`6af47e739180b954d5f697bf5055a694dadedeba`（Node契約・回帰テストPASS）。
- R14 SSH対応：`d48615194de9b0a95e463c961d41fba60b9c011a`（対話型SSH接続PASS）。
- 変更は目的別隔離`work/...`ブランチに限定。`main`への直接統合・本番切替は別GO判定。
- Codespaces開始時：`bash tools/r22_cloud_preflight.sh`でソース前提・既存テストを検証。
- 実装時：構文チェック→契約・回帰テストを一括実施→差分検査→コミット→リモートSHA照合。失敗時は今回の変更をロールバック。
- npm依存の自動インストールはR22基盤で行わない。TypeScriptテストは依存関係の確認が必要で、現段階では未実施。
- UI変更の受入は**AWS上の実環境**で行う。CodespacesのNodeテストやローカルsmokeだけで完了にしない。

## 5. 原本保全・容量管理

R9監査基準（**2026-11-18の過去時点、R11整理前の全worktree**）：

| 項目 | 件数 |
|---|---:|
| 監査対象worktree | 18 |
| 変更エントリ | 6,004 |
| 内容読取 | 5,987 |
| 重複エントリ | 3,192 |
| ローカルGit Blob存在 | 4,122 |
| 秘密情報パターン要レビュー | 5 |
| 2MiB超の未読取 | 14 |
| バイナリ | 28 |
| シンボリックリンク | 3 |
| UTF-8不正 | 3 |
| 監査エラー | 0 |

監査クラスには`DOC_CONFIG_REVIEW=4,258`、`AUTH_SECURITY_CONTEXT=1,104`、`CODE_CONTENT_REVIEW=195`などが含まれる。**パス分類・ハッシュ一致だけで「不要」とは判断しない。** 特に`900.meta`には実行ログ以外に設計・SQL・復旧証跡が混在する。

- R7：23ファイルを隔離バックアップrefへpush済み。
- R10：13ファイルを3本の隔離バックアップrefへpushし、GitHub上のコミットを照合済み（重複があり得るため純増13件とは限らない）。
- R11：cleanかつリモート到達確認済みのworktree **8個**を通常のGit削除で整理。R11作業前後の空き容量は360→1,277MiB。R22初回採取時の実測は**1,790MiB**（R21後は1,596MiB）。
- 現在の`main`変更**5,934件**とR9の全体**6,004件**は集計範囲・採取時点が異なり、差70件を「削除済み」と解釈しない。
- 今後の判定：①正本・実装・未実行SQL・復旧証跡は保護、②リモートのファイル実体・ハッシュを確認して重複除去可否を検討、③生成ログ・一時物は再生成可能性を立証して削除候補とする。
- 公開push：実コード・設計根拠と機密検査を通過した**必要ファイルだけ**。機密データはPrivate保全の要否を別判定。不要ファイルも確認前に削除しない。
- 保全・削除の完了条件：対象ファイル一覧、要否理由、保存先、リモート検証SHA、削除前後ハッシュ・容量、失敗時ロールバック結果を監査ログに残す。
- Termux作業ログは`$HOME/.tmp`に短期保存し、必要な証跡のみ選別保全。容量不足時も未保全原本・dirty worktreeは削除しない。

## 6. セキュリティ・費用・障害対応

- GitHub上の本リポジトリは公開。`.env`、鍵、認証情報、個人情報、秘密設定はコードと一緒にpushしない。ドキュメントにも実値を記載しない。
- Codespacesは30分自動停止。使い終わったら明示停止し、必要なGit変更をpushしてから長期停止・廃止する。
- CodespacesのVMスペック・retentionは実測済みだが、**実課金額・無料枠残高は今回未取得**。料金を断定しない。
- 既存R22クラウド基盤設計ではAWS CodeBuildは**未作成**、AWS実環境のUIテストは**未実施**。IAM権限・料金・リージョン・エンドポイントを実測してから別GO判定。
- SSH接続障害：`gh auth status`→`codespace` scope→Codespace状態→devcontainer SSH Feature→必要時Rebuildの順に確認。接続エラー時にmainや原本は変更しない。
- コード障害：隔離ブランチ内で失敗差分を戻し、リモートrefを照合。未コミット変更を消す`reset --hard`や`clean`は既存dirtyディレクトリで行わない。
- データ保全障害：原本を維持し、ハッシュ・複製先・復元テストの3点が揃うまで削除を禁止する。

## 7. 完了・未完了判定

| ゲート | 状態 |
|---|---|
| Termux→Codespaces対話型SSH | **PASS** |
| R13コード・Nodeテスト・リモートコミット | **PASS** |
| R14 SSH Feature・再構築・実接続 | **PASS** |
| R22環境実測Markdown生成 | **PASS** |
| 約6,000件の必要性判定・最小限push・安全削除 | **未完了** |
| Codespacesの復元・バックアップ検証 | **未完了** |
| AWS構成・費用・実URL確認 | **未完了** |
| AWS上のUI中心の総合受入 | **未実施** |
| システム全体の本番移行 | **未承認・未実施** |

**次の実装工程**：R9監査資料を用い、現行10 worktreeの実体を再照合→ファイル内容別にKEEP/PUSH/DELETE/HOLDを判定→安全なものだけpush→リモート実体検証後に不要物を削除。環境設計書はその結果で更新する。

## 8. R16-R21 実行済み整理（追補 2026-11-18）

次の件数は各実行ログを根拠とする。R16-R1の5,934件は監査基準点であり、現行のmainステータス実測とは区別する。節7の「未完了」判定も、この追補によって部分進捗が生じている。

| 工程 | 結果 | 保護措置 |
|---|---|---|
| R16-R1 | SHA照合5,917/5,934、差異17件（大容量14件はR9ハッシュ欠落、リンク3件は通常ファイル外） | 読取専用 |
| R17 | 引継ぎ文書2件push、重複ログ232件削除 | commit `6b01ef8c09a1c0ce76a3a702124fa5fd625120de`、同内容の残存ファイルから復元可能 |
| R18 | 大容量14件SHA、リンク3件、資料8件確認 | 読取専用 |
| R19 | テスト参照資料5件push、生成リンク3件解除 | commit `afe6ecf469c6980e5b8aaec1250f97660d272a0f` |
| R20 | 空の生成ログ733件削除 | `ledger.json`でパス・権限・日時を保全 |
| R21 | 非空生成ログ849件削除、元データ25,985,615バイト | `recovery.tar.gz`と`plan.json`をTermux Downloadsに保持、849件の復元データを検査済み |

整理総数：**1,817件**。5,934－1,817＝**約4,117件**（台帳差引の理論値）。R16の分類では通常ソース・資料が18件、残りは主に`900.meta`配下。現行件数はR22の再測定結果を正とする。

R21後に報告された空き容量は**1,596MiB**。R20の復元台帳とR21のアーカイブは端末内にあり、**端末故障に耐える独立したバックアップではない**。未確認の設計・SQL・機密・障害証跡を削除しない。公開GitHubには認証情報や非公開履歴をpushしない。独立した暗号化保全先の確定・遠隔復元テストを次のGOゲートとする。

AWS上のUI受入・本番移行は引き続き未完了。
