# AICompanyManager / BusinessOS AIWorker Role Knowledge Boundary and Combat Separation

## Status
- status: canonical-addition
- owner: Boss
- prepared_by: Zero

## Purpose
AICompanyManagerで利用するロボットロールは、BusinessOS上の配置分類であると同時に、CX22073JW側の知識参照キーでもある。

そのため、戦闘系ロボットを業務系ロールへ混ぜず、戦闘・警備・危機対応系ロールとして扱う。

## AICompanyManager usage rule
AICompanyManagerの通常業務タスクでは、以下を業務系として使う。

- President
- ExecutiveManager
- Manager
- Leader
- Worker
- Helper
- Advisor
- Specialist

ただし、Specialistは業務専門担当であり、Sniperなどの戦闘専門とは分離する。

## Combat role usage rule
以下は戦闘・警備・危機対応系として扱う。

- Battler
- Security
- CombatSpecialist
- TacticalLeader
- StrategicCommander

これらは通常の業務タスク台帳・Manager/Leader/Worker割当に混ぜない。

## CX reference behavior
AICompanyManagerがロボット参照パネルや説明表示で戦闘系ロールを表示する場合、CX22073JW側の参照知識は以下へ接続する。

- 戦争史
- 戦術思想
- 警備
- 防衛
- 危機対応
- 戦闘演出
- 世界観設計
- ゲーム/フィクション

## Safety
現実の危害実行支援には使わない。
警備設計、防災、危機対応、ゲーム/フィクション、世界観説明、抽象的な戦略・戦術思想に限定する。

## Verification rule
ロール割当の検証は以下で行う。

- business.robot_placement_role_catalog に戦闘系ロールが存在する
- cx22073jw.vw_robot_role_reference_v1 で戦闘系ロールが読める
- business.robot_pool の HD-R2 / HD-R2S / HD-R2G / HD-R2T-0 が戦闘系ロールへ再割当済み
- API reference/model-full で CombatSpecialist / StrategicCommander が参照できる
