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
