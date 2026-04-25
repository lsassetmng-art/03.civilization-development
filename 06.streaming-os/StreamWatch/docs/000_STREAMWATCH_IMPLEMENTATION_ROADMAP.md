# ============================================================
# STREAMWATCH IMPLEMENTATION ROADMAP
# ============================================================

status: phase1-bootstrap-generated
system: StreamingOS
app: StreamWatch
owner: Boss
prepared_by: Zero
schema: streaming
db_target: PERSONA_DATABASE_URL

source_of_truth:
- updated integrated file loaded in this chat
- phase1 additive scope freeze
- api exact contract
- request response examples

phase_1_scope:
  database:
    - streaming.viewer_profile_records
    - streaming.viewer_progress_states
    - streaming.category_tree_nodes
    - streaming.cast_handoff_sessions
  screens:
    - profile_picker
    - viewer_home
    - viewer_library_home
    - viewer_series_detail
    - tv_connect_sheet
    - restriction_gate
  api:
    - /streamwatch/profile/list
    - /streamwatch/profile/select
    - /streamwatch/home-feed/read
    - /streamwatch/category-tree/read
    - /streamwatch/library/read
    - /streamwatch/progress/upsert
    - /streamwatch/tv-handoff/start
    - /streamwatch/tv-handoff/claim
    - /streamwatch/entitlement/read
    - /streamwatch/membership/join/execute

deferred:
- dedicated favorites tables
- dedicated watch-later tables
- offline download ownership
- drm download behavior
- guardian override pin model
- gifting and party-watch

fixed_rules:
- profile context is explicit when continuity matters
- progress truth is separate from history truth
- entitlement read is authoritative for CTA resolution
- tv handoff is distinct from same-device large-screen mode
- favorites and watch later remain interpreted lists in phase1
