# ============================================================
# AI EMPLOYEE GRANT EXPORT MANIFEST
# ============================================================

grant_run_code: ai_employee_grant_export_20260421_052043
generated_at: 20260421_052043
export_root: /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/exports/ai-employee-grants/20260421_052043

files:
- 000_manifest.md
- 010_role_actual_view_matrix.tsv
- 020_domain_summary.tsv
- 030_gate_controlled_views.tsv
- 040_export_summary.json
- roles/*.sql
- domains/*.sql

notes:
- GRANT SQL in this package is upper-bound skeleton only
- runtime grants must still intersect rank, app scope, and gate
- gate-controlled views remain gate-controlled even if SELECT skeleton exists
