# BusinessOS AIWorker API Place Endpoint Repair V3 Canon

## Purpose
Repair API v3 placeRobot runtime SQL interpolation.

## Confirmed failure
The previous API file emitted literal text like:
- ${uuidSql(companyId)}

inside SQL sent to psql.

## Fix
Regenerate placeRobot() so that the API source file contains actual JavaScript template interpolation:
- ${uuidSql(companyId)}
- ${sqlLit(modelCode)}
- ${jsonSql(metadata)}

and not escaped / literal placeholders.

## Safety
- No persistent DB write in smoke.
- API smoke uses dry_run rollback.
- Existing API v2 is not modified.
- No delete.
