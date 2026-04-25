# ============================================================
# AI OPERATION DESK MASTER ORCHESTRATION RUNBOOK
# ============================================================

status: master-orchestration
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the top-level orchestration layer that runs the already-generated
local / hardening / production-track / production-proof bundles in a unified way.

master_passes:
- verify pass
- local pass
- hardening pass
- production-track pass
- production-proof pass
- closeout pass

recommended_order:
1. 090.scripts/600_run_aioperationdesk_master_verify.sh
2. 090.scripts/610_run_aioperationdesk_master_local_pass.sh
3. 090.scripts/620_run_aioperationdesk_master_hardening_pass.sh
4. 090.scripts/630_run_aioperationdesk_master_production_track_pass.sh
5. 090.scripts/640_run_aioperationdesk_master_production_proof_pass.sh
6. 090.scripts/650_run_aioperationdesk_master_closeout.sh

notes:
- each pass writes evidence under 900.meta
- db-dependent steps are best-effort and may skip if environment is missing
- this layer does not replace lower-level scripts; it orchestrates them
