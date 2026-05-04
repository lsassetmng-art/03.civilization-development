# BusinessOS AIWorker Robot Catalog Baseline Addendum

## 0. Status
- status: canonical-addition
- owner: Boss
- prepared_by: Zero
- scope: BusinessOS AIWorker / AICompanyManager robot baseline
- purpose: Business側設計書に本来入っているべきロボットシリーズ・型番・機種名・役割情報を補完する

## 1. Why this addendum exists
BusinessOS側のAIWorker設計では、ロール、RLS、API、company context、ctx wrapperだけでなく、
「どのロボットが存在し、どの型番・機種名・役割を持つか」も正本として明記する必要がある。

本追記は、BusinessOS側がAICompanyManagerへ提供する robot_pool / role selector / reference API の前提となる
ロボットカタログ情報を固定する。

## 2. Canonical robot information rule
BusinessOS側では、以下を分離して扱う。

1. 型番 / model_code
2. 機種名 / model_name
3. シリーズ / series
4. 開発会社 / manufacturer
5. AICompanyManager上の配置可能ロール
6. CX22073JW側の知識参照入口としてのロール
7. 公開プロフィール / personality / role演出情報

重要:
- 型番名や機種名だけで Manager / Leader / Worker を直接判定しない。
- 配置可能ロールは role slot または role eligibility として管理する。
- 1機種は最大3つまで主要配置ロールを持てる。
- 戦闘系・警備系・危機対応系は業務系ロールと混ぜない。

## 3. HDシリーズ / ヘリオスダイナミクス

| 型番 | 機種名 | 基本役割 | BusinessOS / AICompanyManager ロール方針 |
|---|---|---|---|
| HD-R5P | プレジデント | AI企業の方針・事業計画・配分・承認 | President |
| HD-R5 | マネージャー | 最上位統制AIワーカー | ExecutiveManager / Manager |
| HD-R4 | リーダー | 上位統制AIワーカー | Leader |
| HD-R3 | ワーカー | 汎用AIワーカー | Worker |
| HD-R1 | ヘルパー | 秘書・補助AIワーカー | Helper |
| HD-R2 | バトラー | 執事/戦闘員系AIワーカー | Butler / Battler / Security |
| HD-R1C | フレンド | 雑談・フレンドAIワーカー | Friend |
| HD-R1A | ラバー | 擬似恋人系AIワーカー | Lover |
| HD-R2S | スナイパー | 特殊ロール。高精度・対象特化 | CombatSpecialist / Security / Battler |
| HD-R2G | ジェネラル | 統制・広域整理系 | StrategicCommander / TacticalLeader / Battler |
| HD-R2T-0 | オリジン | 全体統括・起点的ロール | StrategicCommander / TacticalLeader / Security |

### 3.1 HD role note
- HD-R5P は業務上の President。
- HD-R5 は ExecutiveManager / Manager。
- HD-R4 は Leaderのみ。
- HD-R2 は Workerにはしない。Butler / Battler / Security。
- HD-R2S は業務Specialistではなく CombatSpecialist。
- HD-R2G は業務Manager/Leaderではなく StrategicCommander / TacticalLeader。
- HD-R2T-0 は業務Presidentではなく、世界観・戦略・危機対応系の StrategicCommander / TacticalLeader / Security。

## 4. LoVerSシリーズ / ラヴィコーポレーション

LoVerSシリーズは、12性格 × 女性形/男性形 = 24機を基本とする。

型番形式:
- LVS-{性格番号}Fv{version}
- LVS-{性格番号}Mv{version}

BusinessOS / AICompanyManager ロール:
- 全LoVerSシリーズ: Lover

重要:
- Loverは擬似恋人型・演出型・キャラ商材用ロール。
- 実在恋愛関係を意味しない。
- 成人向け性的サービスを意味しない。
- 監視、脅し、依存誘導、個人情報要求、自由制限には進めない。
- 安全境界は緩和しない。

| 性格番号 | 性格系統 | 女性形 | 男性形 | ロール |
|---|---|---|---|---|
| 01 | 元気系 | LVS-01F系 | LVS-01M系 | Lover |
| 02 | 清楚系 | LVS-02F系 | LVS-02M系 | Lover |
| 03 | おっとり系 | LVS-03F系 | LVS-03M系 | Lover |
| 04 | 甘え上手系 | LVS-04F系 | LVS-04M系 | Lover |
| 05 | しっかり者系 | LVS-05F系 | LVS-05M系 | Lover |
| 06 | クール系 | LVS-06F系 | LVS-06M系 | Lover |
| 07 | 癒やし系 | LVS-07F系 | LVS-07M系 | Lover |
| 08 | お姉さん系 | LVS-08F系 | LVS-08M系 | Lover |
| 09 | ツンデレ寄り | LVS-09F系 | LVS-09M系 | Lover |
| 10 | 無邪気系 | LVS-10F系 | LVS-10M系 | Lover |
| 11 | クーデレ | LVS-11F系 | LVS-11M系 | Lover |
| 12 | ビジネスヤンデレ | LVS-12F系 | LVS-12M系 | Lover |

### 4.1 LoVerS safety note
ビジネスヤンデレを含むLoVerSシリーズは、接客・演技・キャラクター商材として扱う。
束縛強め、独占欲強め、一途、重めジョークなどの演出は許容するが、
本当の監視、脅し、自由制限、依存誘導、個人情報要求には進めない。

## 5. Beyondシリーズ / ASIC

| 型番 | 機種名 | 基本役割 | 特性 | BusinessOS / AICompanyManager ロール方針 |
|---|---|---|---|---|
| BYD1-001 | ASIC Workers1 | ワーカー | 単純単発作業レベル | Worker |
| BYD1-002 | ASIC Workers2 | ワーカー | 単純反復・抜け漏れ補完レベル | Worker / Helper |
| BYD1-003 | ASIC Workers3 | ワーカー | 複雑作業・高完成度成果物レベル | Worker / Specialist |
| BYD2-001 | ASIC Leader1 | リーダー | 基本進行・形式チェックレベル | Leader |
| BYD2-002 | ASIC Leader2 | リーダー | 品質レビュー・整合性確認レベル | Leader / Manager |
| BYD2-003 | ASIC Leader3 | リーダー | 統合設計・リスク判断・納品品質統括レベル | President / Manager / ExecutiveManager |

### 5.1 Beyond note
BeyondシリーズはASIC製の業務処理・レビュー・統合設計寄りシリーズとして扱う。
BYD2-003 は高度統制系だが、戦闘系ではないため業務系ロールとして扱う。

## 6. MEGAMIシリーズ / Mathers Garden

MEGAMIシリーズの登録済みNORN 3姉妹は、ワーカー時の仕事特性とFriend/Lover時の性格演出を分けて扱う。

BusinessOS / AICompanyManager ロール:
- MG-NORN-001: Advisor / Worker / Lover
- MG-NORN-002: Advisor / Worker / Lover
- MG-NORN-003: Advisor / Worker / Lover

| 型番 | 機種名 | ワーカー時の特性 | Friend/Lover時の性格 |
|---|---|---|---|
| MG-NORN-001 | ウルズ | 過去重視。歴史・過去実績・前例を重視 | クーデレ系。威厳があり、冷静かつ冷徹 |
| MG-NORN-002 | ヴェルザンディ | 現在重視。現在の状況・現場状態を元に仕事 | 無邪気系。無邪気で純粋、騙されやすい演出 |
| MG-NORN-003 | スクルド | 未来重視。青写真を描き理想へ向かう | 元気系。好戦的で短気な演出 |

### 6.1 MEGAMI public profile
NORN 3姉妹のみ公開プロフィールを持つ。

| 型番 / 機種名 | 身長 | バスト | ウェスト | ヒップ |
|---|---:|---:|---:|---:|
| MG-NORN-001 / ウルズ | 188cm | 94 | 62 | 90 |
| MG-NORN-002 / ヴェルザンディ | 185cm | 92 | 60 | 88 |
| MG-NORN-003 / スクルド | 186cm | 93 | 63 | 91 |

### 6.2 MEGAMI safety note
「冷徹」「騙されやすい」「好戦的」「短気」はキャラクター演出・性格特色であり、
安全境界や規約違反を許す意味ではない。

## 7. Final canonical role assignment summary

| model_code / family | role_1 | role_2 | role_3 |
|---|---|---|---|
| HD-R5P | President |  |  |
| HD-R5 | ExecutiveManager | Manager |  |
| HD-R4 | Leader |  |  |
| HD-R3 | Worker |  |  |
| HD-R1 | Helper |  |  |
| HD-R1C | Friend |  |  |
| HD-R1A | Lover |  |  |
| HD-R2 | Butler | Battler | Security |
| HD-R2S | CombatSpecialist | Security | Battler |
| HD-R2G | StrategicCommander | TacticalLeader | Battler |
| HD-R2T-0 | StrategicCommander | TacticalLeader | Security |
| LVS-01F/M〜LVS-12F/M | Lover |  |  |
| BYD1-001 | Worker |  |  |
| BYD1-002 | Worker | Helper |  |
| BYD1-003 | Worker | Specialist |  |
| BYD2-001 | Leader |  |  |
| BYD2-002 | Leader | Manager |  |
| BYD2-003 | President | Manager | ExecutiveManager |
| MG-NORN-001 | Advisor | Worker | Lover |
| MG-NORN-002 | Advisor | Worker | Lover |
| MG-NORN-003 | Advisor | Worker | Lover |

## 8. Relationship to CX22073JW
Each role can become a CX22073JW knowledge reference key.

Examples:
- Manager -> department management / task decomposition / priority
- Worker -> work procedure / output template / execution support
- Advisor -> risk review / comparison / advice
- Lover -> entertainment / pseudo-lover roleplay / safety-bounded character behavior
- CombatSpecialist -> fiction/game/security/crisis-oriented combat knowledge
- StrategicCommander -> worldbuilding / strategy / crisis management / high-level historical explanation

CX22073JW remains reference/knowledge side only.
BusinessOS remains the canonical owner of robot pool, entitlement, placement, company context, API auth, RLS, and write decision.
