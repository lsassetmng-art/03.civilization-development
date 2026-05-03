# AICompanyManager Combined Context Repair Canon

## Purpose
Ensure combined rollback-smoke verifies company context before future entitlement/placement RLS.

## Expected after repair
- company-context rollback-smoke passes
- combined rollback-smoke passes
- combined response includes company context fields
- no persistent entitlement/placement/audit rows are created
