# Runtime Brain Context Contract

## Contract
AIWorker runtime / prompt builder は、ロボットの仕事目的に応じて以下を取得する。

- modelCode
- purposeCode
- allowed domains
- compact brain sources
- safety boundaries

## Purpose filtering
current task purpose は use_purpose_code として渡す。

例:
- HD-R1C: smalltalk
- HD-R5: business_planning / review
- HD-R2: risk_check / design_reference / safety_training / review
- BYD2-003: review / risk_check / design_reference

## Safety
このproviderは「読取可能な参照情報」を返すだけ。
外部実行、DB更新、承認、契約、会計確定などは別レイヤー。
