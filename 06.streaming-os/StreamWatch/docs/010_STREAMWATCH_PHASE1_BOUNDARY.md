# ============================================================
# STREAMWATCH PHASE1 BOUNDARY
# ============================================================

status: implementation-boundary
system: StreamingOS
app: StreamWatch
schema: streaming
phase: phase1

in_scope:
- viewer profile separation
- category tree browse
- home feed read starter
- library home starter
- progress upsert
- tv handoff start and claim
- entitlement read starter
- membership join execute starter
- purchase and rental CTA placeholder handling in UI

out_of_scope:
- real billing settlement execution
- real media playback engine
- real cast device discovery
- drm download
- dedicated favorite canonical table
- dedicated watch later canonical table
- party watch and gifting

review_rule:
- SQL must be reviewed by Sato (DB) before production apply
