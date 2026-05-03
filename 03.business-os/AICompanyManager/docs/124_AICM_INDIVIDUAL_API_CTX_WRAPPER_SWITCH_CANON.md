# AICompanyManager individual API ctx-wrapper switch canon

## Purpose
Make individual AICompanyManager write APIs follow the same company-context rule as combined rollback-smoke.

## Expected
- grant endpoint uses ctx wrapper
- place endpoint uses ctx wrapper
- update/deactivate endpoints use ctx wrappers
- invalid token is denied
- dry-run smoke creates no persistent entitlement/placement rows
