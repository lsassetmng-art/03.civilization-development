# ============================================================
# AI EMPLOYEE FINAL HANDOFF PACKAGE MANIFEST
# ============================================================

export_run_code: ai_employee_final_handoff_20260421_185630
source_execution_run_code: ai_employee_governed_apply_preflight_refresh_20260421_173612
source_batch_code: ai_employee_governed_apply_batch_refresh_20260421_173612
generated_at: 20260421_185630
export_root: /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/exports/ai-employee-final-handoff/20260421_185630

files:
- 000_manifest.md
- 010_pass_items.tsv
- 020_fail_or_skipped_items.tsv
- 030_final_apply_skeleton.sql
- 040_export_summary.json

notes:
- pass_items are latest preflight pass items only
- fail_or_skipped_items must not be manually applied as-is
- final_apply_skeleton.sql is manual handoff skeleton only
