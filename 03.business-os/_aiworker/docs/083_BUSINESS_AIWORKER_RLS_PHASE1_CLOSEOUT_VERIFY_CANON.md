# BusinessOS AIWorker RLS Phase1 Closeout Verify Canon

## Purpose
Close out RLS Phase1 after correcting a verification false negative.

## Background
RLS Phase1 apply succeeded:
- RLS enabled on read/catalog/reference tables
- policies created
- reference reads passed
- write rollback smoke passed
- API combined rollback-smoke passed

The previous FAIL was caused by exact string matching on policy qual:
- expected: status_code = 'active'
- actual PostgreSQL normalized form: status_code = 'active'::text

## Closeout rule
Policy verification should accept PostgreSQL-normalized expressions when:
- policy exists
- command is SELECT
- qual contains status_code
- qual contains active

## No DB changes
This closeout is read-only verification.
