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
