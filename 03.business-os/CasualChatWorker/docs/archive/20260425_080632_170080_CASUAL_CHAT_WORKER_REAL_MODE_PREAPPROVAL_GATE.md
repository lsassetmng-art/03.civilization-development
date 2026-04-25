# CasualChatWorker Real Mode Pre-Approval Gate

status: real-mode-disabled
phase: Phase T
app_name: CasualChatWorker
display_name: 雑談ワーカー

## 1. Current State

Frontend real mode remains disabled.

## 2. Required Before Boss Real Mode Approval

- local endpoint integration PASS
- backend runtime config PASS
- non-production rollback dry-run PASS
- live payload gap check PASS
- auth/session policy PASS
- no frontend DB secrets
- no frontend psql
- no ERP DB path
- 150 minute quote rejected
- Lover safety boundary retained

## 3. Real Mode Switch Values

Only after approval:

- apiMode = real
- allowRealApi = true
- apiBaseUrl = approved backend endpoint

## 4. Rollback

If real mode fails:

- apiMode = mock
- allowRealApi = false
- preserve logs
- do not manually mutate DB
