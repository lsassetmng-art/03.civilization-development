# ============================================================
# AI EMPLOYEE ACTIVATION REVIEW PACKAGE MANIFEST
# ============================================================

export_run_code: ai_employee_activation_review_export_20260421_101717
generated_at: 20260421_101717
export_root: /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/exports/ai-employee-activation-review/20260421_101717

files:
- 000_manifest.md
- 010_request_summary.tsv
- 020_decision_matrix.tsv
- 030_apply_plan_skeleton.sql
- 040_gate_or_rejected.tsv
- 050_export_summary.json

notes:
- This package is for human review and governed apply planning
- No runtime GRANT or activation apply is executed in this step
- allowed_upper_bound means candidate only, not auto-approved
- requires_gate / rejected must not be auto-applied
