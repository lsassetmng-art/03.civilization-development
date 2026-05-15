# 佐藤レビュー観点

## 1. 既存構造確認

確認すること:
- aiworker側に既存profile/capability/task catalogがあるか
- PersonaOS側のschema名が persona か personaos か
- app_commonに共通catalogを置くべきか、OSごとに持つべきか
- task_type_codeを共通コードとして扱えるか
- RLSや参照viewに影響があるか

## 2. AIWorkerOS

確認すること:
- model_codeとrole_codeの既存正本
- HD-R2系の軍事/警備/危機対応プロファイルの分離
- LoVerS generic profileを実機種別に展開するか
- BYD/HD/MEGAMIの既存能力profileと重複しないか

## 3. PersonaOS

確認すること:
- Personaはロボットではないためmodel_codeを使わない
- persona_id / persona_type / parameter_snapshotで扱う
- 性格、特性、状態、経験、成長、記憶を可変パラメータとして扱う
- persona_task_profileは固定正本ではなく現在値またはsnapshot参照にする

## 4. Apply前の必須条件

- read-only監査結果確認
- 既存DB構造との統合案確定
- 佐藤レビュー
- ユーザー明示GO
- DB applyワンブロック分離
