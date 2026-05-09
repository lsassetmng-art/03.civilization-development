# CX dedicated app_surface seed exact plan

## 1. Target

Create runtime control profile for:

- app_surface_code=cx22073jw_e2e_quality_gate
- model_code=byd2_003_asic_leader3

by cloning safe runtime control posture from:

- app_surface_code=ai_company_manager
- model_code=byd2_003_asic_leader3

## 2. Apply policy

Do not apply yet.

Actual apply requires:

- exact base table confirmed
- exact columns confirmed
- exact NOT_EXECUTED SQL generated
- Sato review completed
- Boss explicit GO

## 3. SQL design requirements

Exact apply SQL must:

1. BEGIN/COMMIT transaction.
2. Use lock_timeout and statement_timeout.
3. Precheck source count = 1 or expected exact count.
4. Precheck target count = 0 or idempotent upsert condition.
5. INSERT/UPSERT only the target pair.
6. No DROP.
7. No DELETE.
8. No TRUNCATE.
9. No CASCADE.
10. Keep dangerous flags false.
11. Verify target count = 1.
12. Write clear report after apply.

## 4. Recommended next operation

Create exact NOT_EXECUTED SQL after reviewing:

- /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050548_b6r95r3z_r29g_p2j_r2_sato_exact_review/100_SATO_EXACT_BASE_TABLE_AND_COLUMN_REVIEW.md
- /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050548_b6r95r3z_r29g_p2j_r2_sato_exact_review/050_candidate_base_tables.log
- /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050548_b6r95r3z_r29g_p2j_r2_sato_exact_review/060_candidate_samples.log
