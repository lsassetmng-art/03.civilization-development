# BusinessOS AIWorker / AICompanyManager Role Knowledge Boundary and Combat Separation

## Status
- status: canonical-addition
- owner: Boss
- prepared_by: Zero
- DB: PERSONA_DATABASE_URL
- ERP DATABASE_URL: not used

## Purpose
ロボットロールは、単なる配置分類・権限分類ではなく、CX22073JW側の知識系・参照系情報を呼び出すための参照キーとして扱う。

そのため、業務系ロールと戦闘・警備・危機対応系ロールを混在させない。

## Canonical rule
ロールは以下の3つの意味を持つ。

1. BusinessOS上の配置分類
2. AICompanyManager上の役割表示・配置判断
3. CX22073JW側の知識・説明・判断補助材料への参照入口

## Business roles
業務系ロールは、経営・管理・作業・助言・接客・雑談・擬似恋人演出などの業務/サービス系CX知識に接続する。

Examples:
- President
- ExecutiveManager
- Manager
- Leader
- Worker
- Helper
- Advisor
- Specialist
- Friend
- Lover
- Butler

## Combat / security / crisis roles
戦闘系・警備系・危機対応系ロールは、業務系ロールの Specialist / Manager / Leader / Worker と混ぜない。

Examples:
- Battler
- Security
- CombatSpecialist
- TacticalLeader
- StrategicCommander

## CX knowledge reference
戦闘系ロールは、以下のCX知識領域を参照する。

- 戦争史
- 戦術思想
- 警備
- 防衛
- 危機対応
- 戦闘演出
- 世界観設計
- ゲーム/フィクション上の部隊運用
- 防災/避難/リスク対応

## Safety boundary
戦闘系ロールのCX参照は、現実の危害実行支援ではない。

許可用途:
- フィクション
- ゲーム
- Civilization世界観設計
- 警備設計
- 防災/危機管理
- 戦闘演出
- 歴史・戦術思想の高レベル説明

禁止用途:
- 現実の危害実行支援
- 武器使用の実践手順
- 標的選定
- 犯罪・暴力実行の助言
- 監視・脅迫・侵入・攻撃支援

## Role reassignment canon

| model_code | model_name | role_1 | role_2 | role_3 | reason |
|---|---|---|---|---|---|
| HD-R2 | Butler | Butler | Battler | Security | 執事/護衛/警備系。業務Workerには寄せない。 |
| HD-R2S | Sniper | CombatSpecialist | Security | Battler | 狙撃・特殊戦系。業務Specialistではなく戦闘専門へ分離。 |
| HD-R2G | General | StrategicCommander | TacticalLeader | Battler | 戦略/戦術/戦闘指揮系。Manager/Leaderとは分離。 |
| HD-R2T-0 | Origin | StrategicCommander | TacticalLeader | Security | 全体統括・起点的ロール。業務Presidentとは分離。 |

## Boundary with AICompanyManager
AICompanyManagerの通常業務タスクでは、戦闘系ロールをManager/Leader/Worker/Specialistとして扱わない。

戦闘系ロールは以下の用途でのみ参照する。
- 世界観・Civilization側の役割
- 警備・防災・危機管理
- フィクション/ゲーム演出
- 戦術/戦略の抽象説明
- 安全境界内のリスク整理

## CX22073JW boundary
CX22073JWは知識・説明・参照・検索補助を担当する。
BusinessOSの業務正本、利用権、配置、RLS、API認可はBusinessOS側に残す。
