-- ============================================================
-- STREAM STUDIO PHASE1 SEED SQL
-- Reviewer: Sato (DB)
-- ============================================================

INSERT INTO streaming.creator_project (
  creator_project_id,
  workspace_id,
  project_code,
  project_title,
  project_summary,
  project_status,
  owner_creator_ref,
  default_language
) VALUES (
  'prj-demo-001',
  'ws-demo-001',
  'SS-001',
  'Demo Creator Project',
  'Starter seed project for StreamStudio phase1.',
  'draft',
  'creator_demo_owner',
  'en'
)
ON CONFLICT (creator_project_id) DO NOTHING;

INSERT INTO streaming.creator_upload_job (
  creator_upload_job_id,
  creator_project_id,
  resumable_session_ref,
  source_filename,
  file_size_bytes,
  ingest_status
) VALUES (
  'upl-demo-001',
  'prj-demo-001',
  'resumable-demo-001',
  'pilot-episode.mp4',
  104857600,
  'session_created'
)
ON CONFLICT (creator_upload_job_id) DO NOTHING;

INSERT INTO streaming.creator_video_draft (
  creator_video_draft_id,
  creator_project_id,
  asset_ref,
  draft_title,
  draft_summary,
  draft_status
) VALUES (
  'drf-demo-001',
  'prj-demo-001',
  'asset-demo-001',
  'Pilot Episode Draft',
  'Starter draft.',
  'editing'
)
ON CONFLICT (creator_video_draft_id) DO NOTHING;

INSERT INTO streaming.creator_publish_setting (
  creator_publish_setting_id,
  publish_ref,
  creator_project_id,
  visibility_code,
  destination_ref,
  rights_check_status,
  readiness_status
) VALUES (
  'ps-demo-001',
  'pub-demo-001',
  'prj-demo-001',
  'private',
  'streaming_internal',
  'pending',
  'pending'
)
ON CONFLICT (creator_publish_setting_id) DO NOTHING;

INSERT INTO streaming.creator_audit_event (
  creator_audit_event_id,
  actor_ref,
  actor_role_code,
  action_code,
  target_ref,
  result_code,
  event_payload
) VALUES (
  'aud-demo-001',
  'creator_demo_owner',
  'owner',
  'seed_created',
  'prj-demo-001',
  'accepted',
  '{"seed":"phase1"}'::jsonb
)
ON CONFLICT (creator_audit_event_id) DO NOTHING;
