# ============================================================
# STREAMWATCH IMPLEMENTATION BOUNDARY
# ============================================================

status: implementation-boundary
system: StreamingOS
app: StreamWatch
phase: shell-starter
schema: streaming

fixed_scope_in_this_bundle:
- profile-aware viewer shell
- fixed mobile primary navigation
- library semantics split
- category / home / search / library / following skeleton
- continue watching and entitlement summary placeholders
- tv handoff placeholder

not_done_in_this_bundle:
- real playback runtime
- real entitlement refresh
- real commerce execution
- real cast claim flow
- real restriction enforcement backend
- real profile persistence

reason:
Only the integrated canonical summary is present in this chat context.
This starter implementation keeps the viewer shell additive and safe
until the exact StreamWatch screen / API / runtime design set is loaded.
