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
