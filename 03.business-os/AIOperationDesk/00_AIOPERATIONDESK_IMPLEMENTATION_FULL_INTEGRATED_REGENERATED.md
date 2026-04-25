# ============================================================
# AI OPERATION DESK IMPLEMENTATION FULL INTEGRATED REGENERATED
# ============================================================

status: regenerated
app: AIOperationDesk
category: 03.business-app
owner: Boss
prepared_by: Zero
generated_at: 20260423_183027
source_root: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk
output_file: /data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/00_AIOPERATIONDESK_IMPLEMENTATION_FULL_INTEGRATED_REGENERATED.md
file_count: 70

purpose:
Regenerated implementation integrated markdown placed directly under
the AIOperationDesk app root.

# ============================================================
# SOURCE FILE INDEX
# ============================================================

-      1	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/ACTUAL_HARDENING_EDIT_LANE_1.md
-      2	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/ACTUAL_HARDENING_EDIT_LANE_1_RUNBOOK.md
-      3	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/ACTUAL_HARDENING_EDIT_LANE_2.md
-      4	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/ACTUAL_HARDENING_EDIT_LANE_2_RUNBOOK.md
-      5	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/ACTUAL_HARDENING_EDIT_LANE_3.md
-      6	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/ACTUAL_HARDENING_EDIT_LANE_3_RUNBOOK.md
-      7	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/ACTUAL_IMPLEMENTATION_START_POLICY.md
-      8	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/AUTH_PERMISSION_PROVIDER_EXACT.md
-      9	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/CLEANUP_EXECUTOR_EXACT.md
-     10	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/EVIDENCE_REVIEW_AND_NEXT_ACTION_POLICY.md
-     11	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/EXECUTION_DECISION_MATRIX.md
-     12	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/FINAL_CLOSEOUT_TO_END.md
-     13	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/FINAL_CLOSEOUT_TO_END_RUNBOOK.md
-     14	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/HARDENED_DB_POST_WRITE_FLOW.md
-     15	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/HARDENED_POST_WRITE_FLOW.md
-     16	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/HARDENED_RUNTIME_ENTRY.md
-     17	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/HARDENING_ENTRY_CHECKLIST.md
-     18	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/HARDENING_ROADMAP.md
-     19	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/HARDENING_RUNBOOK.md
-     20	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/IMPLEMENTATION_SOURCE_MAP.md
-     21	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/LINE_B_PASS_FOLLOWUP_IMPLEMENTATION.md
-     22	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/LINE_B_PASS_FOLLOWUP_LANE_2.md
-     23	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/LINE_B_PASS_FOLLOWUP_LANE_2_RUNBOOK.md
-     24	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/LINE_B_PASS_FOLLOWUP_RUNBOOK.md
-     25	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/LOCAL_RUNBOOK.md
-     26	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/MASTER_EXECUTION_CLOSEOUT_RUNBOOK.md
-     27	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/MASTER_ORCHESTRATION_RUNBOOK.md
-     28	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/ONE_COMMAND_FINAL_RUNBOOK.md
-     29	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/OPERATIONS_HANDOFF_CHECKLIST.md
-     30	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/POST_LINE_B_NEXT_ACTION_POLICY.md
-     31	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PRODUCTION_IMPLEMENTATION_LANE_1.md
-     32	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PRODUCTION_IMPLEMENTATION_LANE_1_RUNBOOK.md
-     33	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PRODUCTION_IMPLEMENTATION_LANE_2.md
-     34	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PRODUCTION_IMPLEMENTATION_LANE_2_RUNBOOK.md
-     35	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PRODUCTION_IMPLEMENTATION_LANE_3.md
-     36	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PRODUCTION_IMPLEMENTATION_LANE_3_RUNBOOK.md
-     37	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PRODUCTION_IMPLEMENTATION_LANE_4.md
-     38	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PRODUCTION_IMPLEMENTATION_LANE_4_RUNBOOK.md
-     39	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PRODUCTION_IMPLEMENTATION_LINE_B_CLOSEOUT.md
-     40	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PRODUCTION_IMPLEMENTATION_LINE_B_RUNBOOK.md
-     41	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PRODUCTION_LIVE_PROOF_POLICY.md
-     42	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PRODUCTION_PROOF_CLOSEOUT_RUNBOOK.md
-     43	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PRODUCTION_PROOF_HANDOFF_CHECKLIST.md
-     44	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PRODUCTION_PROOF_POLICY.md
-     45	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PRODUCTION_PROOF_RUNBOOK.md
-     46	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PRODUCTION_SECRET_ENV_POLICY.md
-     47	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PRODUCTION_TRACK_CLOSEOUT_RUNBOOK.md
-     48	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PRODUCTION_TRACK_ROADMAP.md
-     49	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PRODUCTION_TRACK_RUNBOOK.md
-     50	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PROJECT_TERMINAL_EXECUTION_AND_DECISION.md
-     51	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PROJECT_TERMINAL_EXECUTION_AND_DECISION_RUNBOOK.md
-     52	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PROVIDER_DELIVERY_RESULT_FLOW.md
-     53	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/PROVIDER_HTTP_EXECUTION_POLICY.md
-     54	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/README.md
-     55	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/REPLAY_EXECUTOR_EXACT.md
-     56	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/RETENTION_CLEANUP_REPLAY_POLICY.md
-     57	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/000.docs/RUNTIME_ENV_EXACT.md
-     58	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/010.database/README.md
-     59	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/020.backend/README.md
-     60	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/020.backend/edge/README.md
-     61	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/020.backend/edge/README_RUNTIME.md
-     62	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/030.frontend/README.md
-     63	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/040.integrations/README.md
-     64	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/040.integrations/line/LINE_PROVIDER_CONTRACT_EXACT.md
-     65	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/040.integrations/line/README.md
-     66	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/050.resident-surfaces/builders/README.md
-     67	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/050.resident-surfaces/erp/README.md
-     68	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/060.console/README.md
-     69	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/070.jobs/README.md
-     70	/data/data/com.termux/files/home/03.civilization-development/03.business-os/AIOperationDesk/080.notifications/README.md

# ============================================================
# INTEGRATED BODY
# ============================================================


# ------------------------------------------------------------
# SOURCE: 000.docs/ACTUAL_HARDENING_EDIT_LANE_1.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK ACTUAL HARDENING EDIT LANE 1
# ============================================================

status: actual-hardening-edit-lane-1
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Shift from wrapper generation into implementation strengthening by
persisting provider/replay runtime evidence as real JSON artifacts.

lane_targets:
- runtime evidence writer
- provider live / dry-run evidence file output
- replay live evidence file output
- hardened runtime write permission support

principles:
- additive only
- evidence-first
- no raw secret output
- no canonical business mutation replay


# ------------------------------------------------------------
# SOURCE: 000.docs/ACTUAL_HARDENING_EDIT_LANE_1_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK ACTUAL HARDENING EDIT LANE 1 RUNBOOK
# ============================================================

status: actual-hardening-edit-lane-1
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify bundle
   - 090.scripts/985_verify_aioperationdesk_actual_hardening_edit_lane_1.sh
2. run precheck
   - 090.scripts/984_run_aioperationdesk_actual_hardening_edit_lane_1_precheck.sh
3. enable runtime evidence when needed:
   - export AIOD_WRITE_RUNTIME_EVIDENCE=true
4. run controlled live hardening pass or replay live probe
5. inspect:
   - 900.meta/runtime_evidence

notes:
- runtime evidence is JSON artifact output only
- this lane strengthens the current implementation path without adding another wrapper layer


# ------------------------------------------------------------
# SOURCE: 000.docs/ACTUAL_HARDENING_EDIT_LANE_2.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK ACTUAL HARDENING EDIT LANE 2
# ============================================================

status: actual-hardening-edit-lane-2
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Use the file-based runtime evidence path in controlled live hardening runs
and convert those artifacts into reviewable output.

lane_targets:
- enable runtime evidence in controlled live hardening pass
- enable runtime evidence in replay live probe
- summarize runtime evidence artifacts
- refresh handoff bundle with runtime evidence review

principles:
- additive only
- evidence-first
- no raw secret output
- bounded controlled live execution
- next decisions must come from evidence, not more wrappers


# ------------------------------------------------------------
# SOURCE: 000.docs/ACTUAL_HARDENING_EDIT_LANE_2_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK ACTUAL HARDENING EDIT LANE 2 RUNBOOK
# ============================================================

status: actual-hardening-edit-lane-2
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify bundle
   - 090.scripts/995_verify_aioperationdesk_actual_hardening_edit_lane_2.sh
2. run precheck
   - 090.scripts/994_run_aioperationdesk_actual_hardening_edit_lane_2_precheck.sh
3. run controlled live hardening with runtime evidence
   - 090.scripts/990_run_aioperationdesk_controlled_live_hardening_with_runtime_evidence.sh
4. review runtime evidence
   - 090.scripts/991_review_aioperationdesk_runtime_evidence.sh
5. generate refreshed runtime evidence handoff
   - 090.scripts/992_generate_aioperationdesk_runtime_evidence_handoff_bundle.sh

notes:
- export AIOD_WRITE_RUNTIME_EVIDENCE=true is handled by the runner
- runtime evidence files are stored under 900.meta/runtime_evidence
- this lane is intended to produce reviewable evidence for real hardening edits


# ------------------------------------------------------------
# SOURCE: 000.docs/ACTUAL_HARDENING_EDIT_LANE_3.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK ACTUAL HARDENING EDIT LANE 3
# ============================================================

status: actual-hardening-edit-lane-3
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Connect runtime evidence into the active response/review path and produce
a terminal hardening handoff set for the current pass.

lane_targets:
- recommended strict auth default reflected in request context
- provider runtime evidence surfaced in hardened response payload
- runtime evidence digest generation
- actual hardening terminal handoff bundle

principles:
- additive only
- evidence-first
- fail closed
- no raw secret output
- no new wrapper-only layer beyond this lane


# ------------------------------------------------------------
# SOURCE: 000.docs/ACTUAL_HARDENING_EDIT_LANE_3_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK ACTUAL HARDENING EDIT LANE 3 RUNBOOK
# ============================================================

status: actual-hardening-edit-lane-3
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify bundle
   - 090.scripts/999_verify_aioperationdesk_actual_hardening_edit_lane_3.sh
2. run precheck
   - 090.scripts/998_run_aioperationdesk_actual_hardening_edit_lane_3_precheck.sh
3. run controlled live hardening with runtime evidence
   - 090.scripts/990_run_aioperationdesk_controlled_live_hardening_with_runtime_evidence.sh
4. review runtime evidence
   - 090.scripts/991_review_aioperationdesk_runtime_evidence.sh
5. generate runtime evidence digest
   - 090.scripts/996_run_aioperationdesk_runtime_evidence_digest.sh
6. generate terminal hardening handoff
   - 090.scripts/997_generate_aioperationdesk_actual_hardening_terminal_handoff.sh

finish_rule:
After this lane, next work should be direct implementation edits from evidence,
not another orchestration wrapper.


# ------------------------------------------------------------
# SOURCE: 000.docs/ACTUAL_IMPLEMENTATION_START_POLICY.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK ACTUAL IMPLEMENTATION START POLICY
# ============================================================

status: actual-implementation-start
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Move from scaffolding / orchestration / proof layers into the actual next implementation lane.

branching_rule:
1. run one-command final
2. run evidence review
3. read NEXT_CLASS
4. branch to one of:
   - fix_failures
   - resolve_skips
   - fix_one_command
   - fix_master_full
   - fix_proof
   - production_implementation

production_implementation_lane:
- begin real provider http implementation tightening
- begin trusted auth adapter integration tightening
- begin replay / cleanup implementation tightening

fix lanes:
- produce focused repair bundle from latest fail / skip evidence
- do not create more wrapper layers before repair


# ------------------------------------------------------------
# SOURCE: 000.docs/AUTH_PERMISSION_PROVIDER_EXACT.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK AUTH PERMISSION PROVIDER EXACT
# ============================================================

status: hardening-exact
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the exact hardening contracts for auth, permission, and LINE-like provider delivery.

auth_contract:
- actor resolution happens before write-side mutation logic
- unauthenticated actor must be rejected outside stub mode
- actor identity must be attached to audit-capable flows
- review / approval decisions must carry actor identity
- auth mode switching must not change business semantics

permission_contract:
- permission evaluation happens after actor resolution
- permission evaluation must consider:
  - actor
  - supported_app_code
  - lane_type
  - work_type_code
  - risk_class
  - source_surface_type
- permission denial must be explicit
- permission result may escalate review / approval requirement
- permission result must not silently bypass gates

provider_contract:
- notification provider dispatch must be isolated from business mutation
- provider failure must not duplicate canonical business actions
- provider payload must avoid privileged raw detail by default
- provider delivery result must be normalizable into:
  - sent
  - failed
  - cancelled

current_phase:
- auth = stub skeleton
- permission = stub skeleton
- provider = stub skeleton
- exact contracts fixed here for future replacement


# ------------------------------------------------------------
# SOURCE: 000.docs/CLEANUP_EXECUTOR_EXACT.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK CLEANUP EXECUTOR EXACT
# ============================================================

status: production-track-entry
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the cleanup executor skeleton for production-track follow-on work.

scope:
- notification_event cleanup candidates
- audit_trace cleanup candidates
- summary_batch cleanup candidates

non_scope:
- canonical business truth deletion
- work_order deletion
- approval / review deletion
- destructive cleanup without explicit policy gate

modes:
- dry_run
- guarded_live

dry_run:
- load cleanup candidates
- summarize counts
- do not delete anything

guarded_live:
- load cleanup candidates
- still no destructive delete in current phase
- return guarded-no-delete result until explicit cleanup execution is approved

rules:
- cleanup executor must remain additive in current phase
- destructive cleanup is intentionally disabled here
- retention review remains primary, executor is follow-on preparation


# ------------------------------------------------------------
# SOURCE: 000.docs/EVIDENCE_REVIEW_AND_NEXT_ACTION_POLICY.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK EVIDENCE REVIEW AND NEXT ACTION POLICY
# ============================================================

status: evidence-review
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Read the latest execution evidence and turn it into a practical next-action decision.

decision_order:
1. if verify layer failed:
   - fix missing files / broken scripts first
2. if env / provider proof failed:
   - fix env / secret readiness next
3. if hardened / provider / replay / cleanup proof failed:
   - fix proof path next
4. if everything passed:
   - move to real production implementation hardening

recommended output:
- latest result summary
- detected fail points
- detected skip points
- next action classification
- recommended next command


# ------------------------------------------------------------
# SOURCE: 000.docs/EXECUTION_DECISION_MATRIX.md
# ------------------------------------------------------------

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


# ------------------------------------------------------------
# SOURCE: 000.docs/FINAL_CLOSEOUT_TO_END.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK FINAL CLOSEOUT TO END
# ============================================================

status: final-closeout-to-end
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Close the current project pass from the latest followup lane to the final
terminal handoff in one consolidated flow.

final_scope:
- verify latest followup bundle
- run controlled live hardening pass
- review followup evidence
- generate refreshed followup handoff
- generate final closeout review
- generate terminal handoff bundle

terminal_goal:
At the end of this flow, the project should not need another wrapper layer.
The remaining work after this should be evidence-based implementation edits only.


# ------------------------------------------------------------
# SOURCE: 000.docs/FINAL_CLOSEOUT_TO_END_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK FINAL CLOSEOUT TO END RUNBOOK
# ============================================================

status: final-closeout-to-end
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify final closeout bundle
   - 090.scripts/983_verify_aioperationdesk_final_closeout_bundle.sh
2. run final closeout to end
   - 090.scripts/980_run_aioperationdesk_final_closeout_to_end.sh
3. review final closeout result
   - 090.scripts/981_review_aioperationdesk_final_closeout_to_end.sh
4. generate terminal handoff bundle
   - 090.scripts/982_generate_aioperationdesk_final_terminal_handoff_bundle.sh

terminal_rule:
After this runbook, next work should be chosen from the final reviewed evidence,
not from creating more orchestration layers.


# ------------------------------------------------------------
# SOURCE: 000.docs/HARDENED_DB_POST_WRITE_FLOW.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK HARDENED DB POST WRITE FLOW
# ============================================================

status: hardening-exact
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the next hardening step where post-write results may also be
persisted into notification-event and runtime-audit-oriented DB surfaces.

flow:
1. hardened route accepts write request
2. actor / permission checks pass
3. canonical business write executes
4. post-write notification type is resolved
5. notification event candidate may be persisted
6. runtime audit candidate may be persisted
7. provider dispatch may run after persistence
8. enriched response is returned

current_scope:
- canonical business write remains primary
- notification event persistence is additive
- runtime audit persistence is additive
- provider dispatch remains mode-controlled
- db persistence is best-effort follow-on in current phase

rules:
- follow-on persistence must not re-run canonical write
- follow-on persistence failure must not duplicate business mutation
- provider dispatch failure must not remove already-persisted business results
- notification event persistence is not a replacement for canonical audit_trace


# ------------------------------------------------------------
# SOURCE: 000.docs/HARDENED_POST_WRITE_FLOW.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK HARDENED POST WRITE FLOW
# ============================================================

status: hardening-exact
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define what happens after a write route passes auth / permission checks
under hardened runtime.

flow:
1. request enters hardened route
2. actor resolution
3. permission evaluation
4. core write route execution
5. post-write hook evaluation
6. runtime audit event stub creation
7. provider dispatch stub decision
8. enriched response returned

current_runtime_scope:
- runtime audit is stub-normalized
- provider dispatch is stub-normalized
- post-write hook is additive and does not replace canonical business writes

candidate_notification_mapping:
- execution request:
  - review_required -> review_pending
  - approval_required -> approval_pending
- retry schedule:
  - retry_scheduled
- other writes:
  - optional later mapping

rules:
- post-write hook must not duplicate canonical business mutation
- provider failure must not re-run business write
- runtime audit enrichment is not yet canonical DB audit replacement


# ------------------------------------------------------------
# SOURCE: 000.docs/HARDENED_RUNTIME_ENTRY.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK HARDENED RUNTIME ENTRY
# ============================================================

status: hardening-exact
app: AIOperationDesk
owner: Boss
prepared_by: Zero

entrypoints:
- normal stub entry:
  - 020.backend/edge/index.ts
- hardened entry:
  - 020.backend/edge/index_hardened.ts

hardening_switches:
- AIOD_HARDENING_MODE:
  - off
  - enforced
- AIOD_AUTH_MODE:
  - stub
  - header_trusted
- AIOD_PERMISSION_MODE:
  - stub
  - policy_check

current_behavior:
- hardened entry mainly guards write paths
- read paths remain available through existing read route stack
- when hardening is enforced, write paths require authenticated actor and allowed permission result

recommended_use_now:
- local hardening smoke checks
- route-level auth / permission insertion testing
- future replacement point for stronger auth / permission layers


# ------------------------------------------------------------
# SOURCE: 000.docs/HARDENING_ENTRY_CHECKLIST.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK HARDENING ENTRY CHECKLIST
# ============================================================

status: hardening-entry
app: AIOperationDesk
owner: Boss
prepared_by: Zero

check_items:
- runtime config helper exists
- auth stub exists
- permission stub exists
- line integration readme exists
- line provider stub exists
- retention job stub exists
- hardening roadmap exists
- hardening precheck runner exists

next_step_checks:
- auth mode can be switched from stub later
- permission mode can be switched from stub later
- line provider mode can be switched from stub later
- retention jobs can be replaced by real job runners later


# ------------------------------------------------------------
# SOURCE: 000.docs/HARDENING_ROADMAP.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK HARDENING ROADMAP
# ============================================================

status: follow-on-roadmap
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the next track after local-development completion candidate.

hardening_tracks:
- auth and actor identity wiring
- permission and approval authority wiring
- supported-app explain db backing
- notification bridge provider hardening
- retention / cleanup / archival jobs
- production runtime packaging
- observability and audit strengthening

recommended_order:
1. env contract hardening
2. auth / permission skeleton
3. provider bridge contract hardening
4. cleanup / retention jobs
5. explain path db backing
6. production packaging review
7. operational hardening audit

current_bundle_position:
This bundle creates the hardening-entry skeleton only.


# ------------------------------------------------------------
# SOURCE: 000.docs/HARDENING_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK HARDENING RUNBOOK
# ============================================================

status: hardening-runbook
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the recommended run order for the hardening track.

recommended_order_mock_hardened:
1. verify hardening bundle files
   - 090.scripts/390_verify_aioperationdesk_hardening_all.sh
2. run hardening precheck all
   - 090.scripts/400_run_aioperationdesk_hardening_precheck_all.sh
3. start hardened mock stack
   - 090.scripts/300_run_aioperationdesk_hardened_mock_stack.sh
4. test hardened write guard
   - 090.scripts/280_test_aioperationdesk_hardened_write_guard.sh
5. test hardened post-write flow
   - 090.scripts/320_test_aioperationdesk_hardened_post_write_flow.sh
6. stop hardened mock stack
   - 090.scripts/301_stop_aioperationdesk_hardened_mock_stack.sh

recommended_order_db_hardened:
1. verify hardening bundle files
2. run hardening precheck all
3. start hardened db stack
   - 090.scripts/302_run_aioperationdesk_hardened_db_stack.sh
4. test hardened db post-write flow
   - 090.scripts/321_test_aioperationdesk_hardened_db_post_write_flow.sh
5. inspect follow-on db state
   - 090.scripts/322_query_aioperationdesk_hardened_follow_on_state.sh
6. inspect retention review state
   - 090.scripts/370_query_aioperationdesk_retention_review_state.sh
7. run replay review candidate export
   - 090.scripts/371_run_aioperationdesk_notification_replay_review.sh
8. stop hardened db stack
   - 090.scripts/303_stop_aioperationdesk_hardened_db_stack.sh

handoff_path:
- 090.scripts/410_generate_aioperationdesk_hardening_handoff_bundle.sh


# ------------------------------------------------------------
# SOURCE: 000.docs/IMPLEMENTATION_SOURCE_MAP.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK IMPLEMENTATION SOURCE MAP
# ============================================================

status: implementation-prep
app: AIOperationDesk
owner: Boss
prepared_by: Zero

design_to_implementation_map:
- design root:
  - ~/01.civilization-system/07.applications/03.business-app/AIOperationDesk
- implementation root:
  - ~/03.civilization-development/03.business-os/AIOperationDesk

source_docs_for_db:
- 110.infrastructure/110020_AIOPERATIONDESK_DDL_EXACT.sql
- 110.infrastructure/110010_AIOPERATIONDESK_DB_DDL_FREEZE_DESIGN.md

source_docs_for_api:
- 040.api/040010_AIOPERATIONDESK_API_REQUEST_RESPONSE_EXACT.md
- 040.api/040020_AIOPERATIONDESK_API_DB_MAPPING_EXACT.md
- 040.api/040030_AIOPERATIONDESK_LINE_NOTIFICATION_BRIDGE_CONTRACT_EXACT.md

source_docs_for_resident_surfaces:
- 050.flow/050020_AIOPERATIONDESK_ERP_RESIDENT_SURFACE_EXACT_STATEFLOW.md
- 050040_AIOPERATIONDESK_ERP_RESIDENT_UI_MODULE_EXACT.md
- 050030_AIOPERATIONDESK_BUILDER_RESIDENT_SURFACE_EXACT_STATEFLOW.md
- 050050_AIOPERATIONDESK_BUILDER_RESIDENT_UI_MODULE_EXACT.md

source_docs_for_console:
- 050060_AIOPERATIONDESK_MAIN_CONSOLE_SCREEN_MODULE_EXACT.md
- 050070_AIOPERATIONDESK_MAIN_CONSOLE_EXACT_STATEFLOW.md

source_docs_for_ops:
- 070020_AIOPERATIONDESK_REVIEW_APPROVAL_DECISION_RULES_EXACT.md
- 070030_AIOPERATIONDESK_NOTIFICATION_AND_BATCH_SUMMARY_PAYLOAD_EXACT.md
- 070040_AIOPERATIONDESK_REVIEW_REASON_AND_APPROVAL_REASON_DICTIONARY_EXACT.md
- 070050_AIOPERATIONDESK_QUEUE_BUCKET_AND_SLA_EXACT.md

source_docs_for_policy:
- 080020_AIOPERATIONDESK_MULTILINGUAL_AND_FALLBACK_POLICY_EXACT.md
- 080030_AIOPERATIONDESK_REVIEW_APPROVAL_RISK_UI_WORDING_DICTIONARY_EXACT.md


# ------------------------------------------------------------
# SOURCE: 000.docs/LINE_B_PASS_FOLLOWUP_IMPLEMENTATION.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK LINE B PASS FOLLOWUP IMPLEMENTATION
# ============================================================

status: line-b-pass-followup
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Start the real implementation follow-up that should happen after a successful
Line B pass.

followup_targets:
- strengthen strict auth default candidate path
- strengthen provider live result evidence
- strengthen replay live result evidence
- keep provider / replay flow additive and auditable

principles:
- additive only
- fail closed
- no raw secret logging
- no canonical business write replay
- evidence first


# ------------------------------------------------------------
# SOURCE: 000.docs/LINE_B_PASS_FOLLOWUP_LANE_2.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK LINE B PASS FOLLOWUP LANE 2
# ============================================================

status: line-b-pass-followup-lane-2
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Use the strengthened provider/replay evidence path in a controlled
live hardening pass and convert the outputs into practical review artifacts.

lane_2_targets:
- controlled live provider proof pass
- controlled replay live probe
- followup evidence review
- refreshed handoff bundle

principles:
- additive only
- safe-first
- provider live remains explicit
- replay live remains controlled and bounded
- evidence must be collected before next implementation decisions


# ------------------------------------------------------------
# SOURCE: 000.docs/LINE_B_PASS_FOLLOWUP_LANE_2_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK LINE B PASS FOLLOWUP LANE 2 RUNBOOK
# ============================================================

status: line-b-pass-followup-lane-2
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify bundle
   - 090.scripts/970_verify_aioperationdesk_line_b_pass_followup_bundle_2.sh
2. run precheck
   - 090.scripts/960_run_aioperationdesk_line_b_pass_followup_precheck_2.sh
3. run controlled live hardening pass
   - 090.scripts/940_run_aioperationdesk_controlled_live_hardening_pass.sh
4. review followup evidence
   - 090.scripts/950_review_aioperationdesk_followup_evidence.sh
5. generate refreshed handoff bundle
   - 090.scripts/955_generate_aioperationdesk_followup_handoff_bundle.sh

notes:
- controlled live provider proof assumes secret-ready environment
- controlled replay live probe is bounded and explicit
- next step after this lane is evidence-based production hardening edits


# ------------------------------------------------------------
# SOURCE: 000.docs/LINE_B_PASS_FOLLOWUP_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK LINE B PASS FOLLOWUP RUNBOOK
# ============================================================

status: line-b-pass-followup
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify followup bundle
   - 090.scripts/930_verify_aioperationdesk_line_b_pass_followup_bundle.sh
2. run followup precheck
   - 090.scripts/920_run_aioperationdesk_line_b_pass_followup_precheck.sh
3. review strict auth default policy
4. review provider live evidence helper
5. review replay live evidence helper

next_after_followup:
- bind strict auth default where intended
- bind provider live evidence capture into controlled live runs
- bind replay live evidence capture into controlled replay proof


# ------------------------------------------------------------
# SOURCE: 000.docs/LOCAL_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK LOCAL RUNBOOK
# ============================================================

status: implementation-stub
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the local run sequence for the current implementation stub stack.

stack_components:
- edge api server
- static web preview server

runtime_modes:
- mock
- db_psql

ports_default:
- edge:
  - 8787
- web:
  - 8087

mock_mode_start:
- 090.scripts/100_run_aioperationdesk_local_mock_stack.sh

db_mode_start:
- 090.scripts/110_run_aioperationdesk_local_db_stack.sh

stop_stack:
- 090.scripts/120_stop_aioperationdesk_local_stack.sh

smoke_test:
- 090.scripts/130_smoke_test_aioperationdesk_local_stack.sh

rules:
- db_psql mode requires PERSONA_DATABASE_URL and psql
- db_psql mode currently supports read routes and current db-backed write routes already added
- unsupported write paths still remain stub-routed where not yet migrated


# ------------------------------------------------------------
# SOURCE: 000.docs/MASTER_EXECUTION_CLOSEOUT_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK MASTER EXECUTION CLOSEOUT RUNBOOK
# ============================================================

status: master-execution-closeout
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify master execution bundle
   - 090.scripts/700_verify_aioperationdesk_master_execution_bundle.sh
2. run master full execution
   - 090.scripts/670_run_aioperationdesk_master_full_execution.sh
3. collect master evidence bundle
   - 090.scripts/680_collect_aioperationdesk_master_evidence_bundle.sh
4. generate master final handoff bundle
   - 090.scripts/690_generate_aioperationdesk_master_handoff_bundle.sh

notes:
- evidence is collected from the most recent master/local/hardening/production/proof output dirs
- final handoff bundle is intended for the next execution chat or review pass


# ------------------------------------------------------------
# SOURCE: 000.docs/MASTER_ORCHESTRATION_RUNBOOK.md
# ------------------------------------------------------------

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


# ------------------------------------------------------------
# SOURCE: 000.docs/ONE_COMMAND_FINAL_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK ONE COMMAND FINAL RUNBOOK
# ============================================================

status: one-command-closeout
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Provide the final top-level one-command entry for the current project pass.

recommended_order:
1. verify one-command bundle
   - 090.scripts/740_verify_aioperationdesk_one_command_bundle.sh
2. run one-command full pass
   - 090.scripts/710_run_aioperationdesk_one_command_final.sh
3. inspect latest summary
   - 090.scripts/720_show_aioperationdesk_latest_master_summary.sh
4. generate ultimate handoff bundle
   - 090.scripts/730_generate_aioperationdesk_ultimate_handoff_bundle.sh

intent:
This runbook is the top-most wrapper.
No higher orchestration layer is intended after this in the current pass.


# ------------------------------------------------------------
# SOURCE: 000.docs/OPERATIONS_HANDOFF_CHECKLIST.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK OPERATIONS HANDOFF CHECKLIST
# ============================================================

status: handoff-checklist
app: AIOperationDesk
owner: Boss
prepared_by: Zero

handoff_check_items:
- design verification runner exists
- implementation verification runner exists
- db bootstrap runner exists
- local mock walkthrough runner exists
- local db walkthrough runner exists
- local stop runner exists
- smoke test runner exists
- final precheck runner exists
- implementation integrated doc exists
- final handoff note exists
- completion candidate summary exists

recommended_handoff_sequence:
1. run final precheck
2. run mock walkthrough
3. optionally run db walkthrough
4. collect local run artifacts
5. generate handoff bundle
6. archive audit output directory path
7. pass handoff bundle directory to next execution chat

notes:
- db walkthrough depends on PERSONA_DATABASE_URL and local psql availability
- current package is local-development / staged-follow-on ready
- this checklist is for handoff discipline, not production signoff


# ------------------------------------------------------------
# SOURCE: 000.docs/POST_LINE_B_NEXT_ACTION_POLICY.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK POST LINE B NEXT ACTION POLICY
# ============================================================

status: post-line-b
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Run Line B, collect evidence, and branch into the correct next work lane.

branching_rule:
1. if line B final result is PASS:
   - move to evidence-based production hardening follow-up
2. if line B final result is FAIL:
   - inspect failing line B step first
3. if line B result is missing:
   - rerun line B actual execute first

expected_outputs:
- line B actual execute report
- line B evidence bundle
- post-line-b next action summary
- post-line-b handoff bundle


# ------------------------------------------------------------
# SOURCE: 000.docs/PRODUCTION_IMPLEMENTATION_LANE_1.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LANE 1
# ============================================================

status: production-implementation-lane-1
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Start real implementation-side tightening after the scaffolding / proof layers.

lane_1_targets:
- strict trusted-header actor validation
- provider http payload builder separation
- provider http response normalization separation
- replay live guard separation

principles:
- additive only
- fail closed
- no raw secret logging
- no canonical business write replay
- provider result normalization stays explicit

current_scope:
- create real implementation anchors
- do not yet replace all old skeleton entrypoints
- prepare next lane for actual route binding replacement


# ------------------------------------------------------------
# SOURCE: 000.docs/PRODUCTION_IMPLEMENTATION_LANE_1_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LANE 1 RUNBOOK
# ============================================================

status: production-implementation-lane-1
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify bundle
   - 090.scripts/810_verify_aioperationdesk_production_implementation_bundle_1.sh
2. run precheck
   - 090.scripts/800_run_aioperationdesk_production_implementation_precheck.sh
3. review strict auth file
   - 020.backend/lib/aiod_header_auth_strict.js
4. review provider http impl files
   - 080.notifications/line_provider_http_payload_builder.js
   - 080.notifications/line_provider_http_response_normalizer.js
   - 080.notifications/line_provider_http_impl.js
5. review replay live guard
   - 070.jobs/aiod_replay_live_guard.js

next_after_lane_1:
- bind strict auth into route context
- swap provider contract from skeleton adapter to impl file
- bind replay executor live path to replay live guard


# ------------------------------------------------------------
# SOURCE: 000.docs/PRODUCTION_IMPLEMENTATION_LANE_2.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LANE 2
# ============================================================

status: production-implementation-lane-2
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Bind the lane 1 implementation anchors into the existing runtime path.

lane_2_targets:
- request context uses strict trusted-header auth when enabled
- hardened write flow supports strict auth switch
- provider contract prefers real http impl for line_http mode
- replay executor live path uses replay live guard
- existing additive structure is preserved

principles:
- additive only
- fail closed when strict auth is selected
- provider impl remains env-gated
- replay live remains notification-follow-on only


# ------------------------------------------------------------
# SOURCE: 000.docs/PRODUCTION_IMPLEMENTATION_LANE_2_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LANE 2 RUNBOOK
# ============================================================

status: production-implementation-lane-2
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify bundle
   - 090.scripts/830_verify_aioperationdesk_production_implementation_bundle_2.sh
2. run precheck
   - 090.scripts/820_run_aioperationdesk_production_implementation_precheck_2.sh
3. review runtime bindings
   - 020.backend/lib/aiod_request_context.js
   - 020.backend/edge/routes/write_routes_hardened.js
   - 080.notifications/line_provider_contract.js
   - 070.jobs/aiod_replay_executor.js

next_after_lane_2:
- replace current hardened auth mode uses with strict mode where intended
- run hardened stack with strict auth and line_http env in a controlled proof pass
- move to lane 3 for real execution proof binding


# ------------------------------------------------------------
# SOURCE: 000.docs/PRODUCTION_IMPLEMENTATION_LANE_3.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LANE 3
# ============================================================

status: production-implementation-lane-3
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Run controlled proof on the newly bound implementation path:
strict auth + provider http mode in safe dry-run first.

lane_3_targets:
- strict hardened stack runner
- provider http execution mode split:
  - dry_run
  - live
- strict auth request proof
- provider dry-run proof
- safe-first proof without real outbound send by default

principles:
- additive only
- fail closed for strict auth
- provider http defaults to safe proof path
- live outbound requires explicit env switch
- dry_run must not send real provider traffic


# ------------------------------------------------------------
# SOURCE: 000.docs/PRODUCTION_IMPLEMENTATION_LANE_3_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LANE 3 RUNBOOK
# ============================================================

status: production-implementation-lane-3
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify bundle
   - 090.scripts/844_verify_aioperationdesk_production_implementation_bundle_3.sh
2. run precheck
   - 090.scripts/843_run_aioperationdesk_production_implementation_precheck_3.sh
3. start strict hardened mock stack
   - 090.scripts/840_run_aioperationdesk_strict_hardened_mock_stack.sh
4. run strict auth + provider dry-run proof
   - 090.scripts/842_test_aioperationdesk_strict_auth_provider_dry_run.sh
5. stop strict hardened mock stack
   - 090.scripts/841_stop_aioperationdesk_strict_hardened_mock_stack.sh

next_after_lane_3:
- switch provider http execution mode to live only in controlled env
- run strict auth + provider live proof only after endpoint/secret readiness is confirmed


# ------------------------------------------------------------
# SOURCE: 000.docs/PRODUCTION_IMPLEMENTATION_LANE_4.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LANE 4
# ============================================================

status: production-implementation-lane-4
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Move from strict auth + provider dry-run proof into controlled live proof
only in secret-ready environments.

lane_4_targets:
- strict hardened live stack runner
- provider live readiness probe
- strict auth + provider live proof script
- live proof precheck and verification

principles:
- additive only
- fail closed when required provider env is missing
- no raw secret output
- live proof must be explicit
- live proof is controlled validation, not broad rollout

required_live_env_candidates:
- AIOD_LINE_PROVIDER_MODE=line_http
- AIOD_LINE_HTTP_EXECUTION_MODE=live
- AIOD_LINE_PUSH_ENDPOINT
- AIOD_LINE_CHANNEL_ACCESS_TOKEN


# ------------------------------------------------------------
# SOURCE: 000.docs/PRODUCTION_IMPLEMENTATION_LANE_4_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LANE 4 RUNBOOK
# ============================================================

status: production-implementation-lane-4
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify bundle
   - 090.scripts/855_verify_aioperationdesk_production_implementation_bundle_4.sh
2. run precheck
   - 090.scripts/854_run_aioperationdesk_production_implementation_precheck_4.sh
3. run provider live readiness probe
   - 090.scripts/852_run_aioperationdesk_provider_live_readiness_probe.sh
4. start strict hardened live stack
   - 090.scripts/850_run_aioperationdesk_strict_hardened_live_stack.sh
5. run strict auth + provider live proof
   - 090.scripts/853_test_aioperationdesk_strict_auth_provider_live_proof.sh
6. stop strict hardened live stack
   - 090.scripts/851_stop_aioperationdesk_strict_hardened_live_stack.sh

notes:
- lane 4 assumes secret-ready environment
- lane 4 is controlled live proof only
- lane 4 does not itself authorize broad rollout


# ------------------------------------------------------------
# SOURCE: 000.docs/PRODUCTION_IMPLEMENTATION_LINE_B_CLOSEOUT.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LINE B CLOSEOUT
# ============================================================

status: line-b-closeout
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Close the project at the practical "Line B" level:
controlled live proof, evidence review, and final handoff refresh.

line_b_scope:
- verify lane 4 bundle
- run provider live readiness probe
- run strict hardened live stack
- run strict auth + provider live proof
- stop stack safely
- review result logs and latest evidence
- generate line B handoff bundle

not_claimed:
- broad rollout approval
- unlimited live execution
- destructive cleanup authorization


# ------------------------------------------------------------
# SOURCE: 000.docs/PRODUCTION_IMPLEMENTATION_LINE_B_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PRODUCTION IMPLEMENTATION LINE B RUNBOOK
# ============================================================

status: line-b-closeout
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify line B bundle
   - 090.scripts/890_verify_aioperationdesk_line_b_bundle.sh
2. run line B live proof
   - 090.scripts/860_run_aioperationdesk_line_b_live_proof.sh
3. review line B results
   - 090.scripts/870_review_aioperationdesk_line_b_results.sh
4. generate line B handoff bundle
   - 090.scripts/880_generate_aioperationdesk_line_b_handoff_bundle.sh

notes:
- line B assumes secret-ready environment
- line B is the practical finish line for the current pass
- after line B, next work is evidence-based production hardening, not more scaffolding


# ------------------------------------------------------------
# SOURCE: 000.docs/PRODUCTION_LIVE_PROOF_POLICY.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PRODUCTION LIVE PROOF POLICY
# ============================================================

status: production-live-proof
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the boundary for controlled live provider proof.

allowed_in_live_proof:
- explicit strict auth header usage
- explicit provider line_http live mode
- bounded proof requests
- provider result normalization review

not_allowed_in_live_proof:
- raw secret output
- uncontrolled batch replay
- destructive cleanup
- rollout claim without evidence review

success_signals:
- readiness probe passes
- strict auth request succeeds only with required headers
- provider result is normalized cleanly
- logs stay secret-safe


# ------------------------------------------------------------
# SOURCE: 000.docs/PRODUCTION_PROOF_CLOSEOUT_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PRODUCTION PROOF CLOSEOUT RUNBOOK
# ============================================================

status: production-proof-closeout
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify production proof bundle files
   - 090.scripts/550_verify_aioperationdesk_production_proof_bundle_1.sh
   - 090.scripts/590_verify_aioperationdesk_production_proof_closeout_bundle.sh
2. run production proof precheck
   - 090.scripts/560_run_aioperationdesk_production_proof_precheck.sh
3. optionally run header auth proof against hardened stack
   - 090.scripts/520_run_aioperationdesk_header_auth_proof.sh
4. optionally run replay guarded probe
   - 090.scripts/530_run_aioperationdesk_replay_executor_guarded_probe.sh
5. optionally run cleanup guarded probe
   - 090.scripts/540_run_aioperationdesk_cleanup_executor_guarded_probe.sh
6. run production proof audit
   - 090.scripts/570_run_aioperationdesk_production_proof_audit.sh
7. collect proof artifacts
   - 090.scripts/575_collect_aioperationdesk_production_proof_artifacts.sh
8. generate handoff bundle
   - 090.scripts/580_generate_aioperationdesk_production_proof_handoff_bundle.sh

notes:
- this runbook closes the current proof-oriented pass
- this runbook does not authorize production release by itself
- output directories under 900.meta should be preserved as evidence


# ------------------------------------------------------------
# SOURCE: 000.docs/PRODUCTION_PROOF_HANDOFF_CHECKLIST.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PRODUCTION PROOF HANDOFF CHECKLIST
# ============================================================

status: production-proof-handoff
app: AIOperationDesk
owner: Boss
prepared_by: Zero

handoff_check_items:
- production proof runbook exists
- production proof policy exists
- production proof integrated exists
- production proof closeout integrated exists
- provider env probe exists
- header auth proof exists
- replay guarded probe exists
- cleanup guarded probe exists
- production proof precheck exists
- production proof audit exists
- proof artifact collection exists
- proof handoff bundle generator exists
- production proof final manifest exists

recommended_handoff_sequence:
1. run production proof precheck
2. run production proof audit
3. collect proof artifacts
4. generate proof handoff bundle
5. pass handoff bundle directory to next execution chat


# ------------------------------------------------------------
# SOURCE: 000.docs/PRODUCTION_PROOF_POLICY.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PRODUCTION PROOF POLICY
# ============================================================

status: production-proof
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the proof-phase constraints after production-track skeleton completion.

proof_targets:
- env readiness
- auth header path readiness
- provider mode readiness
- replay executor readiness
- cleanup executor guarded readiness

prohibited_in_this_phase:
- hardcoded secret output
- destructive cleanup
- canonical business rewrite replay
- ungated production rollout claim

success_signals:
- provider env presence can be checked safely
- header-trusted actor path can be validated
- replay executor can run in guarded mode
- cleanup executor can run in guarded mode
- proof reports can be collected into 900.meta


# ------------------------------------------------------------
# SOURCE: 000.docs/PRODUCTION_PROOF_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PRODUCTION PROOF RUNBOOK
# ============================================================

status: production-proof
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the next step after production-track skeleton closeout:
operational proof without jumping directly to full production packaging.

recommended_order:
1. verify production proof bundle files
   - 090.scripts/550_verify_aioperationdesk_production_proof_bundle_1.sh
2. run provider env probe
   - 090.scripts/510_run_aioperationdesk_provider_env_probe.sh
3. run header trusted auth proof
   - 090.scripts/520_run_aioperationdesk_header_auth_proof.sh
4. run replay guarded probe
   - 090.scripts/530_run_aioperationdesk_replay_executor_guarded_probe.sh
5. run cleanup guarded probe
   - 090.scripts/540_run_aioperationdesk_cleanup_executor_guarded_probe.sh
6. run production proof precheck
   - 090.scripts/560_run_aioperationdesk_production_proof_precheck.sh

rules:
- provider env probe must not dump raw secret values
- replay guarded probe is proof-oriented, not full production replay
- cleanup guarded probe must not perform destructive cleanup
- this phase is operational proof, not final release approval


# ------------------------------------------------------------
# SOURCE: 000.docs/PRODUCTION_SECRET_ENV_POLICY.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PRODUCTION SECRET ENV POLICY
# ============================================================

status: production-track-entry
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the secret and environment handling policy for production-track work.

rules:
- secrets must be loaded only from environment variables
- secrets must not be hardcoded into source files
- logs must not dump provider tokens
- debug output must avoid raw secret values
- provider credential presence must be checked explicitly
- missing secret must fail closed for provider http mode

provider_secret_candidates:
- AIOD_LINE_CHANNEL_ACCESS_TOKEN
- AIOD_LINE_CHANNEL_SECRET
- AIOD_NOTIFICATION_SIGNING_KEY

auth_secret_candidates:
- future session verification secret
- future trusted header signing secret

database_secret_rule:
- PERSONA_DATABASE_URL remains environment-only
- DATABASE_URL remains environment-only

current_phase:
- this document fixes the production-track discipline
- actual provider secret usage is still skeleton-level in this bundle


# ------------------------------------------------------------
# SOURCE: 000.docs/PRODUCTION_TRACK_CLOSEOUT_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PRODUCTION TRACK CLOSEOUT RUNBOOK
# ============================================================

status: production-track-entry
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify production-track bundle files
   - 090.scripts/430_verify_aioperationdesk_production_track_bundle.sh
   - 090.scripts/460_verify_aioperationdesk_production_track_bundle_2.sh
   - 090.scripts/500_verify_aioperationdesk_production_track_bundle_3.sh
2. run production-track precheck all
   - 090.scripts/480_run_aioperationdesk_production_track_precheck_all.sh
3. review provider http policy and adapter
4. review replay executor dry-run result
5. review cleanup executor dry-run result
6. generate production-track handoff bundle
   - 090.scripts/490_generate_aioperationdesk_production_track_handoff_bundle.sh

position:
- this runbook closes the current production-track packaging pass
- next work is production implementation hardening, not production-track skeleton generation


# ------------------------------------------------------------
# SOURCE: 000.docs/PRODUCTION_TRACK_ROADMAP.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PRODUCTION TRACK ROADMAP
# ============================================================

status: production-track-entry
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the next implementation track after local-development and hardening
skeleton completion.

production_track_axes:
- secret / env discipline
- trusted auth adapter tightening
- provider http implementation path
- cleanup executor path
- replay executor path
- operational proof and release discipline

recommended_order:
1. secret and env policy finalization
2. auth adapter tightening
3. provider http implementation skeleton
4. cleanup / replay executor skeleton
5. operational proof script strengthening
6. release discipline refinement

current_bundle_position:
This bundle creates the production-track entry skeleton only.


# ------------------------------------------------------------
# SOURCE: 000.docs/PRODUCTION_TRACK_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PRODUCTION TRACK RUNBOOK
# ============================================================

status: production-track-entry
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the run and review order for the production-track entry bundle.

recommended_order:
1. verify production-track bundle files
   - 090.scripts/430_verify_aioperationdesk_production_track_bundle.sh
2. run production-track precheck
   - 090.scripts/420_run_aioperationdesk_production_track_precheck.sh
3. review secret presence policy
   - 000.docs/PRODUCTION_SECRET_ENV_POLICY.md
4. review provider http skeleton
   - 080.notifications/line_provider_http_skeleton.js
5. review cleanup executor skeleton
   - 070.jobs/aiod_cleanup_executor_stub.js

notes:
- this bundle does not activate provider http mode automatically
- this bundle does not introduce destructive cleanup
- this bundle prepares the next implementation pass only


# ------------------------------------------------------------
# SOURCE: 000.docs/PROJECT_TERMINAL_EXECUTION_AND_DECISION.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PROJECT TERMINAL EXECUTION AND DECISION
# ============================================================

status: terminal-execution-and-decision
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Finish the current pass by executing the strengthened implementation path,
reviewing evidence, and generating the terminal handoff bundle.

terminal_scope:
- final implementation verify
- keyed auth live proof
- controlled live hardening with runtime evidence
- final implementation digest
- final implementation handoff
- terminal review and decision
- terminal project bundle

finish_rule:
After this pass, next work should be direct bug fixes / behavior tightening
based on reviewed evidence only.


# ------------------------------------------------------------
# SOURCE: 000.docs/PROJECT_TERMINAL_EXECUTION_AND_DECISION_RUNBOOK.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PROJECT TERMINAL EXECUTION AND DECISION RUNBOOK
# ============================================================

status: terminal-execution-and-decision
app: AIOperationDesk
owner: Boss
prepared_by: Zero

recommended_order:
1. verify terminal bundle
   - 090.scripts/1080_verify_aioperationdesk_project_terminal_bundle.sh
2. run final behavior proof
   - 090.scripts/1050_run_aioperationdesk_final_behavior_proof.sh
3. review terminal result
   - 090.scripts/1060_review_aioperationdesk_final_behavior_proof.sh
4. generate terminal project bundle
   - 090.scripts/1070_generate_aioperationdesk_project_terminal_bundle.sh

terminal_rule:
No further orchestration wrapper should be added after this.


# ------------------------------------------------------------
# SOURCE: 000.docs/PROVIDER_DELIVERY_RESULT_FLOW.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PROVIDER DELIVERY RESULT FLOW
# ============================================================

status: hardening-exact
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the provider-result back-write and retry/backoff flow after
notification_event persistence and provider dispatch decision.

flow:
1. notification_event is created or identified
2. provider dispatch runs
3. provider returns normalized result
4. normalized result is written back to notification_event
5. dispatch journal record is created
6. retry/backoff recommendation is computed
7. response or job context is enriched

normalized_delivery_status:
- pending
- sent
- failed
- cancelled

backwrite_rules:
- provider result back-write is additive follow-on
- provider result must not re-run canonical business mutation
- provider failure may recommend retry, but must not duplicate business write
- journal is operational evidence, not canonical business truth replacement

retry_backoff_rules:
- sent:
  - no retry
- failed:
  - retry candidate depending on provider error class
- cancelled:
  - no retry
- pending:
  - operational follow-up may re-check later


# ------------------------------------------------------------
# SOURCE: 000.docs/PROVIDER_HTTP_EXECUTION_POLICY.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK PROVIDER HTTP EXECUTION POLICY
# ============================================================

status: production-track-entry
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the outbound HTTP provider execution policy for the LINE-like provider path.

rules:
- provider http mode must fail closed when required env or secrets are missing
- provider http mode must not print raw secret values
- provider http mode must normalize result into:
  - sent
  - failed
  - cancelled
- provider http mode must not duplicate canonical business mutation
- provider http failure may lead to replay / retry review, not canonical business rewrite

required_env_candidates:
- AIOD_LINE_PUSH_ENDPOINT
- AIOD_LINE_CHANNEL_ACCESS_TOKEN

recommended_behavior:
- use explicit endpoint env
- use bearer token auth from env
- keep request payload compact
- normalize non-2xx responses to failed
- avoid provider-specific secret leakage in logs


# ------------------------------------------------------------
# SOURCE: 000.docs/README.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK IMPLEMENTATION README
# ============================================================

status: implementation-prep
app: AIOperationDesk
category: 03.business-app
owner: Boss
prepared_by: Zero

purpose:
Implementation-side working root for AI Operation Desk.

design_source:
- ~/01.civilization-system/07.applications/03.business-app/AIOperationDesk

fixed_runtime_scope_v1:
- supported app explanation
- supported app operation QA
- ERP resident surface
- Builder resident surfaces
- governed execution request flow
- review / approval / retry / queue
- LINE-like notification bridge
- batch summary
- business schema tables for AIOperationDesk

major_folders:
- 000.docs
- 010.database
- 020.backend
- 030.frontend
- 040.integrations
- 050.resident-surfaces
- 060.console
- 070.jobs
- 080.notifications
- 090.scripts
- 900.meta


# ------------------------------------------------------------
# SOURCE: 000.docs/REPLAY_EXECUTOR_EXACT.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK REPLAY EXECUTOR EXACT
# ============================================================

status: production-track-entry
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the replay executor skeleton for provider follow-on only.

replay_scope:
- notification_event replay candidates only
- no canonical business write replay
- no work order recreation
- no approval / review bypass

modes:
- dry_run
- live

dry_run:
- load replay candidates
- summarize candidate count
- do not send provider requests

live:
- load replay candidates
- dispatch provider requests through provider contract
- collect normalized results
- do not recreate canonical business mutation

current_phase:
- candidate selection already exists
- this bundle adds executor skeleton
- destructive or business-truth replay remains out of scope


# ------------------------------------------------------------
# SOURCE: 000.docs/RETENTION_CLEANUP_REPLAY_POLICY.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK RETENTION CLEANUP REPLAY POLICY
# ============================================================

status: hardening-exact
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the retention, cleanup, and replay policy skeleton for notification
and runtime follow-on artifacts.

policy_domains:
- notification_event
- runtime audit follow-on evidence
- summary batch cleanup candidates
- retry / replay candidate review

retention_principles:
- canonical business truth is not deleted by this policy
- cleanup targets operational follow-on surfaces first
- retention review must happen before destructive cleanup implementation
- replay must target notification/provider follow-on, not canonical business write replay

notification_event_policy:
- sent:
  - review for archival / cleanup candidate later
- failed:
  - candidate for retry/backoff review
- cancelled:
  - candidate for archival / cleanup review
- pending:
  - candidate for status refresh / replay review

runtime_audit_policy:
- operational runtime audit evidence may be archived later
- canonical audit_trace remains the stronger source than runtime-only transient notes

replay_policy:
- replay target is provider dispatch / notification follow-on only
- replay must not recreate canonical business mutation
- replay candidate requires identifiable notification_event_id
- replay candidate requires delivery_status in:
  - failed
  - pending

cleanup_policy:
- current phase provides review / candidate scripts only
- destructive cleanup is not enabled in current phase


# ------------------------------------------------------------
# SOURCE: 000.docs/RUNTIME_ENV_EXACT.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK RUNTIME ENV EXACT
# ============================================================

status: hardening-exact
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define runtime environment variables and their meaning for the current hardening phase.

required_in_db_mode:
- PERSONA_DATABASE_URL

required_in_all_modes:
- AIOD_PORT
- AIOD_WEB_PORT
- AIOD_DATA_MODE
- AIOD_AUTH_MODE
- AIOD_PERMISSION_MODE
- AIOD_LINE_PROVIDER_MODE

future_provider_candidates:
- AIOD_LINE_CHANNEL_SECRET
- AIOD_LINE_CHANNEL_ACCESS_TOKEN
- AIOD_NOTIFICATION_SIGNING_KEY

mode_values:
- AIOD_DATA_MODE:
  - mock
  - db_psql
- AIOD_AUTH_MODE:
  - stub
  - header_trusted
  - future_session
- AIOD_PERMISSION_MODE:
  - stub
  - policy_check
  - future_role_scope
- AIOD_LINE_PROVIDER_MODE:
  - stub
  - line_http
  - future_worker_bridge

rules:
- env values control runtime mode only
- canonical business rules still come from design and DB state
- privileged provider secrets must not be hardcoded into source files


# ------------------------------------------------------------
# SOURCE: 010.database/README.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK DATABASE README
# ============================================================

status: implementation-prep
app: AIOperationDesk
owner: Boss
prepared_by: Zero

db_scope:
- schema: business
- source env: PERSONA_DATABASE_URL
- ERP env only when ERP-side work is explicitly needed: DATABASE_URL

apply_order:
1. review exact DDL
2. apply DDL to business schema
3. apply supported app seed rows
4. verify core tables exist
5. verify supported app seed results


# ------------------------------------------------------------
# SOURCE: 020.backend/README.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK BACKEND README
# ============================================================

status: implementation-prep
app: AIOperationDesk
owner: Boss
prepared_by: Zero

planned_modules:
- request intake API
- supported app explanation API
- operation QA API
- execution request API
- review API
- approval API
- queue / failure / retry API
- notification settings API


# ------------------------------------------------------------
# SOURCE: 020.backend/edge/README.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK EDGE BACKEND README
# ============================================================

status: implementation-stub
app: AIOperationDesk
owner: Boss
prepared_by: Zero

stub_files:
- aiod_handlers_stub.js
- aiod_router_stub.js

purpose:
- provide route-level stub dispatch
- isolate handlers from future runtime wiring
- keep request/response shapes aligned with exact design docs

note:
- current router is a stub dispatcher only
- runtime host / framework binding is not yet implemented


# ------------------------------------------------------------
# SOURCE: 020.backend/edge/README_RUNTIME.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK EDGE RUNTIME README
# ============================================================

status: implementation-stub
app: AIOperationDesk
owner: Boss
prepared_by: Zero

entrypoint:
- 020.backend/edge/index.ts

current_runtime_modes:
- mock
- db_psql

env_candidates:
- AIOD_PORT
- AIOD_DATA_MODE
- PERSONA_DATABASE_URL

rules:
- mock is default
- db_psql is read-only gateway mode for current phase
- writes remain stub routed
- db_psql mode requires psql to be installed and available in PATH
- db_psql mode requires Deno allow-run permission

notes:
- current db-backed mode covers read routes only
- write routes remain stub until next phase


# ------------------------------------------------------------
# SOURCE: 030.frontend/README.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK FRONTEND README
# ============================================================

status: implementation-prep
app: AIOperationDesk
owner: Boss
prepared_by: Zero

planned_surfaces:
- main console
- app help surface
- supported app explanation surface
- operation QA surface
- request creation surface


# ------------------------------------------------------------
# SOURCE: 040.integrations/README.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK INTEGRATIONS README
# ============================================================

status: implementation-prep
app: AIOperationDesk
owner: Boss
prepared_by: Zero

planned_integrations:
- supported app controlled write surfaces
- LINE-like notification bridge
- cx22073jw AI-worker read-view expectation coordination
- ERP resident support bridge
- Builder resident support bridge


# ------------------------------------------------------------
# SOURCE: 040.integrations/line/LINE_PROVIDER_CONTRACT_EXACT.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK LINE PROVIDER CONTRACT EXACT
# ============================================================

status: hardening-exact
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Define the provider-facing exact contract for LINE-like delivery.

provider_modes:
- stub
- line_http

dispatch_input:
- notification_event_id
- notification_type
- destination_type
- destination_ref
- title
- body
- payload

dispatch_output:
- provider_mode
- delivery_status
- provider_message_ref
- provider_error_code
- provider_error_summary
- processed_at

rules:
- destination_type must be line for LINE provider mode
- provider payload must be compact and action-oriented
- provider dispatch is post-business-action and must not mutate canonical business truth
- provider failure can create retryable notification events later, but not duplicate business writes


# ------------------------------------------------------------
# SOURCE: 040.integrations/line/README.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK LINE INTEGRATION README
# ============================================================

status: hardening-entry
app: AIOperationDesk
owner: Boss
prepared_by: Zero

purpose:
Provider-facing integration area for LINE-like notification delivery.

current_state:
- internal bridge contract already exists on design side
- local implementation currently keeps provider mode as stub
- final provider credentials and delivery runtime are not yet wired

next_targets:
- provider credential contract
- provider request signing
- retry / backoff policy
- delivery receipt mapping
- provider error normalization


# ------------------------------------------------------------
# SOURCE: 050.resident-surfaces/builders/README.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK BUILDER RESIDENT SURFACES README
# ============================================================

status: implementation-prep
app: AIOperationDesk
owner: Boss
prepared_by: Zero

scope:
- builder screen explanation
- field explanation
- builder operation QA
- draft assist
- execution request creation
- open main console

rules:
- builder-family only
- supported scope only
- no unrestricted cross-builder control


# ------------------------------------------------------------
# SOURCE: 050.resident-surfaces/erp/README.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK ERP RESIDENT SURFACE README
# ============================================================

status: implementation-prep
app: AIOperationDesk
owner: Boss
prepared_by: Zero

scope:
- explain current screen
- explain current field
- operation QA
- failure response QA
- provisional voucher draft request
- execution request creation
- open main console

rules:
- lightweight only
- no ungated final posting
- no unrestricted direct internal write


# ------------------------------------------------------------
# SOURCE: 060.console/README.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK MAIN CONSOLE README
# ============================================================

status: implementation-prep
app: AIOperationDesk
owner: Boss
prepared_by: Zero

pc_first_surfaces:
- dashboard
- queue board
- review inbox
- approval inbox
- failure retry center
- audit timeline
- summary center
- supported app registry manager
- notification settings
- resident surface monitor


# ------------------------------------------------------------
# SOURCE: 070.jobs/README.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK JOBS README
# ============================================================

status: implementation-prep
app: AIOperationDesk
owner: Boss
prepared_by: Zero

planned_jobs:
- work order background execution
- retry scheduling
- notification dispatch handoff
- batch summary generation
- verification helper jobs


# ------------------------------------------------------------
# SOURCE: 080.notifications/README.md
# ------------------------------------------------------------

# ============================================================
# AI OPERATION DESK NOTIFICATIONS README
# ============================================================

status: implementation-prep
app: AIOperationDesk
owner: Boss
prepared_by: Zero

events:
- review pending
- approval pending
- confirmation required
- execution failed
- retry scheduled
- completed with warning
- completed summary available

delivery:
- LINE-like bridge first
- other bridges may be added later

