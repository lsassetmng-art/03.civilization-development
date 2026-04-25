# ============================================================
# AI OPERATION DESK EDGE BACKEND README
# ============================================================

status: implementation-stub
app: AIOperationDesk
owner: Boss
prepared_by: Zero

stub_files:
- aiod_handlers_stub.js
- aiod_router_stub.js

purpose:
- provide route-level stub dispatch
- isolate handlers from future runtime wiring
- keep request/response shapes aligned with exact design docs

note:
- current router is a stub dispatcher only
- runtime host / framework binding is not yet implemented
