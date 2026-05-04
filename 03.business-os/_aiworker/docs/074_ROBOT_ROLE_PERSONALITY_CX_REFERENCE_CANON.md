# Robot Role / Personality / CX Reference Canon

## Purpose
Separate robot placement role, robot personality, and CX22073JW-readable reference data.

## Canonical ownership
- BusinessOS:
  - placement role canon
  - business.robot_placement_role_catalog
- AIWorkerOS:
  - series behavior canon
  - model personality canon
  - aiworker.robot_series_behavior_profile
  - aiworker.robot_model_personality_profile
- CX22073JW:
  - read-only reference/search/explanation views
  - not the canonical owner

## Rule
CX22073JW may expose robot roles and personality descriptions as readable reference data, but it must not become the source of truth for placement decisions, role eligibility, personality safety boundaries, or model catalog ownership.

## Created views
- cx22073jw.vw_robot_role_reference_v1
- cx22073jw.vw_robot_personality_reference_v1
- cx22073jw.vw_robot_model_full_reference_v1

## Safety boundary
Personality labels such as Lover, business-yandere, aggressive, cold, naive, or battler are presentation/character/business-role metadata.
They do not relax safety, consent, privacy, coercion, dependency, surveillance, or abuse boundaries.
