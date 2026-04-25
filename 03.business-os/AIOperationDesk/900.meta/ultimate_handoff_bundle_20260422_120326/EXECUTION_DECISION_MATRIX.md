# ============================================================
# AI OPERATION DESK EXECUTION DECISION MATRIX
# ============================================================

status: execution-decision-matrix
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the top-level execution choices after master orchestration scripts exist.

execution_paths:
- quick verify only
- master closeout run
- master full execution + evidence collection
- final handoff bundle generation

recommended_now:
- run master full execution
- collect evidence
- generate final master handoff bundle

path_matrix:
- quick verify only:
  - 090.scripts/660_verify_aioperationdesk_master_bundle.sh
- master closeout run:
  - 090.scripts/650_run_aioperationdesk_master_closeout.sh
- master full execution:
  - 090.scripts/670_run_aioperationdesk_master_full_execution.sh
- evidence collection:
  - 090.scripts/680_collect_aioperationdesk_master_evidence_bundle.sh
- final handoff:
  - 090.scripts/690_generate_aioperationdesk_master_handoff_bundle.sh

notes:
- db-dependent steps remain best-effort
- this matrix is for execution selection, not new scaffolding generation
