# 12.common-os implementation bundle

status: corrected-structure
system: CommonOS
owner: Boss
prepared_by: Zero

## Correct placement rule
Create the OS root first under:
`~/03.civilization-development/12.common-os`

Then create app folders underneath it and place implementation artifacts inside each app folder.

## Included app folders
- `CommonUIRuntime`
- `CommonShell`
- `CommonSyncPresentation`
- `AppCommonStarter`
- `CommonOSPlayground`

## Notes
- CommonOS keeps shared UI foundation and shared presentation only.
- pricing / entitlement / business canon / secrets remain outside CommonOS.
- `AppCommonStarter` SQL is additive-only and must be reviewed by 佐藤（DB担当） before apply.
