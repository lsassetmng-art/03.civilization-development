# COMMONOS BOUNDARY RULES

status: active
owner: Boss
prepared_by: Zero

commonos_responsibility:
- shared UI foundation
- shared tokens
- shared shell
- shared sync / retry / conflict presentation
- shared locale / copy metadata hooks
- shared accessibility / capability presentation hooks
- app_common starter boundary

not_commonos_responsibility:
- business canon
- pricing canon
- entitlement decision core
- authority decision core
- accounting / inventory / approval canon
- domain source of truth
- API secret / service role key / DB secret
- AI system prompt canon

provider_consumer_model:
- provider side lives under 12.common-os
- consumer side lives under each OS root _commonos
- app-specific usage code stays in each app / feature side
- _commonos is the OS-side reusable connection layer
