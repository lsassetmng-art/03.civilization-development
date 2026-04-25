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
