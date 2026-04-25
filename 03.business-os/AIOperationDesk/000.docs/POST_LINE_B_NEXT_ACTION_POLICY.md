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
