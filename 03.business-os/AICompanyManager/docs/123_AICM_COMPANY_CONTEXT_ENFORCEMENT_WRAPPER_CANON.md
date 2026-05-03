# AICompanyManager Company Context Enforcement Wrapper Canon

## Purpose
Move AICompanyManager compatibility smoke toward company-context-enforced writes.

## Scope
combined rollback-smoke should use context wrappers.

## Expected behavior
- valid token + matching context passes
- mismatched context fails
- combined rollback-smoke remains rollback-only
- entitlement/placement rows do not persist
