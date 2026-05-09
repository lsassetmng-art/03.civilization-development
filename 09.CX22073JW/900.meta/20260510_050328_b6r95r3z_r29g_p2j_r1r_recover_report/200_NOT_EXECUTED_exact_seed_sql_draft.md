# NOT EXECUTED exact seed SQL draft placeholder

This is intentionally not executable yet.

The previous P2J-R1 failed only because the script referenced an undefined variable:
- wrong: FUNCTION_LOG
- correct: FUNCTION_DEF_LOG

Use these recovered audit files:

- VIEW_DEF_LOG=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050328_b6r95r3z_r29g_p2j_r1r_recover_report/020_view_definition.log
- VIEW_DEP_LOG=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050328_b6r95r3z_r29g_p2j_r1r_recover_report/030_view_dependencies.log
- FUNCTION_DEF_LOG=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050328_b6r95r3z_r29g_p2j_r1r_recover_report/040_function_definition.log
- CANDIDATE_TABLE_LOG=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050328_b6r95r3z_r29g_p2j_r1r_recover_report/050_candidate_base_tables.log
- CANDIDATE_SAMPLE_LOG=/data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/900.meta/20260510_050328_b6r95r3z_r29g_p2j_r1r_recover_report/060_candidate_samples.log

Seed target:

- source app_surface_code: ai_company_manager
- target app_surface_code: cx22073jw_e2e_quality_gate
- model_code: byd2_003_asic_leader3

After Sato identifies the exact writable base table and columns, create an exact SQL file that:

1. Performs read-only precheck counts.
2. Inserts or upserts target pair:
   - app_surface_code = cx22073jw_e2e_quality_gate
   - model_code = byd2_003_asic_leader3
3. Clones safe runtime-control posture from:
   - app_surface_code = ai_company_manager
   - model_code = byd2_003_asic_leader3
4. Keeps all dangerous flags false:
   - external_execution_allowed_flag=false
   - pg_apply_allowed_flag=false
   - destructive_action_allowed_flag=false
5. Uses ON CONFLICT only if the unique key is confirmed.
6. Verifies target pair count = 1.
7. Does not use DROP / DELETE / TRUNCATE / CASCADE.

Actual DB apply requires:

- Sato review
- Boss explicit GO
- PERSONA_DATABASE_URL only
