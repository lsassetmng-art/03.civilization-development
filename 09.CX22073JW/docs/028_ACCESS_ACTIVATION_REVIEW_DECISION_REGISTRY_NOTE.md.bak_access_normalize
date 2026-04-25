# ============================================================
# ACCESS ACTIVATION REVIEW DECISION REGISTRY NOTE
# ============================================================

status: implementation-prep
target_db_env: PERSONA_DATABASE_URL
target_schema: cx22073jw
reviewer: Sato (DB)

purpose:
- persist latest activation review export into DB-side review decision tables
- classify exported items into approved candidate / gate hold / scope hold / rank hold / rejected hold
- prepare human review registry before governed apply

policy:
- additive only
- no schema drop
- no runtime grant apply in this step
- approved candidate is not final approval
- gate hold / scope hold / rank hold / rejected hold remain non-applicable until reviewed
