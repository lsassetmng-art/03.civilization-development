# BusinessOS AIWorker CX Reference API Canon

## Purpose
Expose robot role/personality/public-profile reference data to AICompanyManager through API v3.

## Source views
CX22073JW read-only reference views:
- cx22073jw.vw_robot_role_reference_v1
- cx22073jw.vw_robot_personality_reference_v1
- cx22073jw.vw_robot_public_profile_reference_v1
- cx22073jw.vw_robot_model_full_reference_v2

## API endpoints
- GET /api/v1/business/aiworker/reference/roles
- GET /api/v1/business/aiworker/reference/personalities
- GET /api/v1/business/aiworker/reference/public-profiles
- GET /api/v1/business/aiworker/reference/model-full

## Ownership boundary
- BusinessOS owns placement role canon.
- AIWorkerOS owns personality and public profile canon.
- CX22073JW exposes read-only reference/search/explanation views.
- API only reads reference views.

## Safety
- No DB write.
- No RLS change.
- No role placement decision is made from CX reference views.
- Public profile is display metadata only.
