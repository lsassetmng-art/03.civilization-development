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
