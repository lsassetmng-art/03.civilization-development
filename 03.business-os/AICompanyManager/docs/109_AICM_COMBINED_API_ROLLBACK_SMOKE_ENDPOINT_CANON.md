# AICompanyManager Combined API Rollback-Smoke Endpoint Canon

## Purpose
Allow AICompanyManager integration tests to verify grant/place/update/deactivate in one API request.

## User-facing impact
None.

## Developer-facing use
Use only for compatibility smoke tests.

## Safety
The endpoint is smoke-only and always rolls back.
It is not a production write endpoint.
