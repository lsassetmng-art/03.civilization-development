# ============================================================
# ACCESS TIMELINE REPORT
# ============================================================

generated_at: 2026-04-22 11:19:46
latest_core_status: blocked
latest_legacy_status: ready
latest_operations_status: unknown

included_counts:
- baseline_runs: 2
- legacy_gate_runs: 3
- retirement_plan_runs: 1
- bundle_export_runs: 1
- db_blocker_patch_runs: 1

artifacts:
- 010_baseline_runs.tsv
- 020_legacy_gate_runs.tsv
- 030_retirement_plan_runs.tsv
- 040_bundle_export_runs.tsv
- 050_db_blocker_patch_runs.tsv
- 060_latest_status_snapshot.tsv

note:
Use this report for trend review, handoff, and recent-run tracing.
