# B6R96R1H4_R3 task_domain_code → brain_domain_code mapping proposal

## Cause
- H4_R2 failed because task_domain_code was inserted into brain_domain_code.
- brain_domain_code has FK to aiworker.brain_data_domain_catalog.

## Mapping proposal

| task_domain_code | proposed brain_domain_code | score |
|---|---|---:|
| security_crisis_response | MANUAL_REVIEW_REQUIRED | 0 |
| fictional_combat_design | MANUAL_REVIEW_REQUIRED | 0 |
| game_tactical_balance | MANUAL_REVIEW_REQUIRED | 0 |
| defense_planning_non_harmful | MANUAL_REVIEW_REQUIRED | 0 |
| threat_modeling_safe | MANUAL_REVIEW_REQUIRED | 0 |
| combat_lore_reference | MANUAL_REVIEW_REQUIRED | 0 |

## Brain catalog size
- rows: 0

## Existing model policy values
```json
[]
```
