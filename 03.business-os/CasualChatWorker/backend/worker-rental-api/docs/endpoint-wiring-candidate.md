# WorkerRentalCore Endpoint Wiring Candidate

status: generated

## Runtime Position

This is backend-only wiring candidate.

## Required Backend Dependencies

- HTTP server runtime
- authenticated context provider
- PostgreSQL pool injected from secure backend runtime
- WorkerRentalCore repository
- route handlers

## Not Included

- production server boot
- secret loading
- frontend DB access
- ERP integration

## Real Mode

Frontend real mode remains disabled until endpoint integration tests pass.
