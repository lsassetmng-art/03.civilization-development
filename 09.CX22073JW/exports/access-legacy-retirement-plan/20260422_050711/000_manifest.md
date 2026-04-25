# ============================================================
# ACCESS LEGACY RETIREMENT PLAN MANIFEST
# ============================================================

run_code: access_legacy_retirement_plan_20260422_050711
source_gate_run_code: access_legacy_cutover_gate_20260422_050123
readiness_status_snapshot: ready
generated_at: 20260422_050711
export_root: /data/data/com.termux/files/home/03.civilization-development/09.CX22073JW/exports/access-legacy-retirement-plan/20260422_050711

files:
- 000_manifest.md
- 010_legacy_view_candidates.tsv
- 020_blockers.tsv
- 030_manual_retire_legacy_views.sql
- 040_manual_restore_legacy_views.sql
- 050_summary.json

notes:
- manual execution only
- no retirement executed by this step
- blocked status means keep legacy views for now
