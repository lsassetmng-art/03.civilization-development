# ============================================================
# AI OPERATION DESK PRODUCTION PROOF AUDIT REPORT
# ============================================================

status: generated
app: AIOperationDesk
owner: Boss
prepared_by: Zero
generated_at: 20260422_120316

summary:
- pass_count: 3
- fail_count: 2
- final_result: FAIL

scope:
- proof bundle verify
- proof precheck
- provider env probe
- replay guarded probe
- cleanup guarded probe

notes:
- this audit is proof-phase oriented
- this audit does not itself authorize release
