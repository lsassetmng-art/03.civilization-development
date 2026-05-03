# AICompanyManager Robot Catalog Baseline Reference Addendum

## 0. Status
- status: canonical-reference-addition
- owner: Boss
- prepared_by: Zero
- scope: AICompanyManager robot reference / selector / placement UI

## 1. Purpose
AICompanyManager側でも、BusinessOS AIWorkerが持つ基本ロボット情報を参照できるようにする。
この文書は、AICompanyManagerがロボット選択・配置・説明表示を行う際の基準情報である。

## 2. AICompanyManager usage
AICompanyManagerは、型番や機種名だけで役割を判断しない。
BusinessOS側の role slot / role eligibility を参照して、配置可能ロールを判断する。

UI表示では以下を使う。
- model_code
- model_name
- series
- manufacturer
- role_1 / role_2 / role_3
- public profile
- personality profile
- CX reference keyとしてのrole_code

## 3. Robot catalog summary

### HDシリーズ
| 型番 | 機種名 | AICompanyManagerロール |
|---|---|---|
| HD-R5P | プレジデント | President |
| HD-R5 | マネージャー | ExecutiveManager / Manager |
| HD-R4 | リーダー | Leader |
| HD-R3 | ワーカー | Worker |
| HD-R1 | ヘルパー | Helper |
| HD-R2 | バトラー | Butler / Battler / Security |
| HD-R1C | フレンド | Friend |
| HD-R1A | ラバー | Lover |
| HD-R2S | スナイパー | CombatSpecialist / Security / Battler |
| HD-R2G | ジェネラル | StrategicCommander / TacticalLeader / Battler |
| HD-R2T-0 | オリジン | StrategicCommander / TacticalLeader / Security |

### LoVerSシリーズ
全LoVerSシリーズは Lover として扱う。
12性格 × 女性形/男性形 = 24機。

性格:
- 01 元気系
- 02 清楚系
- 03 おっとり系
- 04 甘え上手系
- 05 しっかり者系
- 06 クール系
- 07 癒やし系
- 08 お姉さん系
- 09 ツンデレ寄り
- 10 無邪気系
- 11 クーデレ
- 12 ビジネスヤンデレ

### Beyondシリーズ
| 型番 | 機種名 | AICompanyManagerロール |
|---|---|---|
| BYD1-001 | ASIC Workers1 | Worker |
| BYD1-002 | ASIC Workers2 | Worker / Helper |
| BYD1-003 | ASIC Workers3 | Worker / Specialist |
| BYD2-001 | ASIC Leader1 | Leader |
| BYD2-002 | ASIC Leader2 | Leader / Manager |
| BYD2-003 | ASIC Leader3 | President / Manager / ExecutiveManager |

### MEGAMIシリーズ
| 型番 | 機種名 | AICompanyManagerロール | 公開プロフィール |
|---|---|---|---|
| MG-NORN-001 | ウルズ | Advisor / Worker / Lover | 188cm / B94 / W62 / H90 |
| MG-NORN-002 | ヴェルザンディ | Advisor / Worker / Lover | 185cm / B92 / W60 / H88 |
| MG-NORN-003 | スクルド | Advisor / Worker / Lover | 186cm / B93 / W63 / H91 |

## 4. Combat role UI rule
AICompanyManagerの通常業務配置では、戦闘系ロールを業務系ロールとして扱わない。

戦闘系:
- Battler
- Security
- CombatSpecialist
- TacticalLeader
- StrategicCommander

これらは以下の説明表示・参照用途に限定する。
- Civilization世界観
- 警備設計
- 防災/危機管理
- フィクション/ゲーム
- 戦術/戦略の高レベル説明

現実の危害実行支援、武器使用手順、標的選定、犯罪・暴力実行支援には使わない。

## 5. Placement selector rule
AICompanyManagerの配置セレクタは、role_codeを指定してBusinessOS側の参照/APIから候補を取得する。

例:
- Manager配置 -> Manager対応ロボット
- Leader配置 -> Leader対応ロボット
- Worker配置 -> Worker対応ロボット
- Lover参照 -> Lover対応ロボット
- CombatSpecialist参照 -> 戦闘系専用表示。通常業務配置には混ぜない。
