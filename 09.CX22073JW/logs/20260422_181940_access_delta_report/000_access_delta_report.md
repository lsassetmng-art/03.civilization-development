# ============================================================
# ACCESS DELTA REPORT
# ============================================================

generated_at: 2026-04-22 18:19:43

latest_runs:
- baseline_run_code: access_baseline_health_20260422_053009
- legacy_gate_run_code: access_legacy_cutover_gate_20260422_050123
- bundle_run_code: access_current_state_bundle_20260422_054219

artifacts:
- 010_baseline_compare.tsv
- 011_baseline_delta.tsv
- 020_legacy_compare.tsv
- 021_legacy_delta.tsv
- 030_bundle_compare.tsv
- 031_bundle_delta.tsv

note:
Use this report to see how the latest state changed from the immediately previous run.
