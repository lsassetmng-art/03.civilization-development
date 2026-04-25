# ============================================================
# CX22073JW EXACT PAYLOAD CHECK FUNCTIONS ADDITIVE NOTE
# target_db_env: PERSONA_DATABASE_URL
# reviewer: Sato (DB)
# ============================================================

This package adds:
- payload validation issue log
- required-key exact check helper
- area-level payload validation function
- generic exact upsert function
- applied-area wrapper upsert function generation

Policy:
- additive only
- no schema drop
- wrapper functions are generated only for applied skeleton tables
