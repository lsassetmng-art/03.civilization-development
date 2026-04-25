# CasualChatWorker Phase O STOP Gate

status: STOP
generated_at: 20260425_204352

## 1. Gate

Frontend real mode switch must not start yet.

## 2. Reason

Phase N is not fully passed.

Pending:

- non-production rollback dry-run
- live payload gap check
- live confirm decision
- final approved backend endpoint
- Boss approval for real mode

## 3. Forbidden Now

- setting frontend apiMode to real
- setting allowRealApi to true
- using production confirm without approval
- putting DB secrets in frontend
- using ERP DATABASE_URL for WorkerRentalCore
- weakening Lover safety boundary

## 4. Safe State

Frontend remains:

- apiMode: mock
- allowRealApi: false
- apiBaseUrl: empty or non-secret only

## 5. Unlock Conditions

Phase O can unlock only when:

- Phase N PASS or explicit defer decision is documented
- Boss approves real mode
- endpoint payload gap passes
- auth/session policy passes
- 150-minute quote is rejected
- rollback plan is documented

