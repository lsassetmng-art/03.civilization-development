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
