-- ============================================================
-- STREAM STUDIO PHASE1 CORE SQL STARTER
-- Reviewer: Sato (DB)
-- Target: PERSONA_DATABASE_URL
-- Schema: streaming
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS streaming;

CREATE TABLE IF NOT EXISTS streaming.creator_project (
  creator_project_id text PRIMARY KEY,
  workspace_id text NOT NULL,
  project_code text NOT NULL UNIQUE,
  project_title text NOT NULL,
  project_summary text NULL,
  project_status text NOT NULL DEFAULT 'draft',
  owner_creator_ref text NOT NULL,
  default_language text NOT NULL,
  initial_visibility_hint text NULL,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_project_project_status_chk
    CHECK (project_status IN ('draft','ready','blocked','archived')),
  CONSTRAINT creator_project_version_chk
    CHECK (version >= 1)
);

CREATE TABLE IF NOT EXISTS streaming.creator_upload_job (
  creator_upload_job_id text PRIMARY KEY,
  creator_project_id text NOT NULL REFERENCES streaming.creator_project(creator_project_id) ON DELETE CASCADE,
  resumable_session_ref text NOT NULL,
  source_filename text NOT NULL,
  file_size_bytes bigint NOT NULL DEFAULT 0,
  ingest_status text NOT NULL DEFAULT 'session_created',
  retry_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_upload_job_file_size_chk
    CHECK (file_size_bytes >= 0),
  CONSTRAINT creator_upload_job_ingest_status_chk
    CHECK (ingest_status IN ('session_created','uploading','uploaded','ingesting','ready','failed','retry_requested'))
);

CREATE TABLE IF NOT EXISTS streaming.creator_video_draft (
  creator_video_draft_id text PRIMARY KEY,
  creator_project_id text NOT NULL REFERENCES streaming.creator_project(creator_project_id) ON DELETE CASCADE,
  asset_ref text NOT NULL,
  draft_title text NOT NULL,
  draft_summary text NULL,
  thumbnail_asset_ref text NULL,
  draft_status text NOT NULL DEFAULT 'editing',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_video_draft_draft_status_chk
    CHECK (draft_status IN ('editing','review_pending','approved','blocked','published')),
  CONSTRAINT creator_video_draft_version_chk
    CHECK (version >= 1)
);

CREATE TABLE IF NOT EXISTS streaming.creator_subtitle_track (
  creator_subtitle_track_id text PRIMARY KEY,
  creator_video_draft_id text NOT NULL REFERENCES streaming.creator_video_draft(creator_video_draft_id) ON DELETE CASCADE,
  language_code text NOT NULL,
  source_type text NOT NULL DEFAULT 'upload',
  source_ref text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_subtitle_track_source_type_chk
    CHECK (source_type IN ('upload','manual','import'))
);

CREATE TABLE IF NOT EXISTS streaming.creator_edit_marker (
  creator_edit_marker_id text PRIMARY KEY,
  creator_video_draft_id text NOT NULL REFERENCES streaming.creator_video_draft(creator_video_draft_id) ON DELETE CASCADE,
  client_marker_key text NOT NULL,
  marker_label text NOT NULL,
  marker_type text NOT NULL DEFAULT 'chapter',
  start_ms bigint NOT NULL,
  end_ms bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_edit_marker_start_ms_chk CHECK (start_ms >= 0),
  CONSTRAINT creator_edit_marker_end_ms_chk CHECK (end_ms >= start_ms),
  CONSTRAINT creator_edit_marker_marker_type_chk CHECK (marker_type IN ('chapter','highlight','warning')),
  CONSTRAINT creator_edit_marker_draft UNIQUE (creator_video_draft_id, client_marker_key)
);

CREATE TABLE IF NOT EXISTS streaming.creator_publish_setting (
  creator_publish_setting_id text PRIMARY KEY,
  publish_ref text NOT NULL UNIQUE,
  creator_project_id text NOT NULL REFERENCES streaming.creator_project(creator_project_id) ON DELETE CASCADE,
  visibility_code text NOT NULL DEFAULT 'private',
  destination_ref text NOT NULL,
  rights_check_status text NOT NULL DEFAULT 'pending',
  readiness_status text NOT NULL DEFAULT 'pending',
  scheduled_at timestamptz NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_publish_setting_visibility_code_chk
    CHECK (visibility_code IN ('private','unlisted','public')),
  CONSTRAINT creator_publish_setting_rights_check_status_chk
    CHECK (rights_check_status IN ('pending','passed','failed')),
  CONSTRAINT creator_publish_setting_readiness_status_chk
    CHECK (readiness_status IN ('pending','ready','blocked'))
);

CREATE TABLE IF NOT EXISTS streaming.creator_publish_request (
  creator_publish_request_id text PRIMARY KEY,
  publish_ref text NOT NULL,
  request_channel text NOT NULL,
  request_status text NOT NULL DEFAULT 'registered',
  execute_after timestamptz NULL,
  idempotency_key text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_publish_request_request_channel_chk
    CHECK (request_channel IN ('publish_now','schedule')),
  CONSTRAINT creator_publish_request_request_status_chk
    CHECK (request_status IN ('registered','scheduled','running','succeeded','failed'))
);

CREATE TABLE IF NOT EXISTS streaming.creator_runtime_job (
  creator_runtime_job_id text PRIMARY KEY,
  job_type text NOT NULL,
  target_ref text NOT NULL,
  state text NOT NULL DEFAULT 'queued',
  priority_code text NOT NULL DEFAULT 'normal',
  attempt_count integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  next_retry_at timestamptz NULL,
  idempotency_key text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_runtime_job_state_chk
    CHECK (state IN ('queued','running','retry_wait','dead_letter','succeeded')),
  CONSTRAINT creator_runtime_job_priority_code_chk
    CHECK (priority_code IN ('low','normal','high')),
  CONSTRAINT creator_runtime_job_attempt_count_chk
    CHECK (attempt_count >= 0),
  CONSTRAINT creator_runtime_job_max_attempts_chk
    CHECK (max_attempts >= 1)
);

CREATE TABLE IF NOT EXISTS streaming.creator_dead_letter_entry (
  creator_dead_letter_entry_id text PRIMARY KEY,
  job_type text NOT NULL,
  target_ref text NOT NULL,
  operator_action text NOT NULL DEFAULT 'unreviewed',
  attempt_count integer NOT NULL DEFAULT 0,
  error_summary text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_dead_letter_entry_attempt_count_chk CHECK (attempt_count >= 0),
  CONSTRAINT creator_dead_letter_entry_operator_action_chk
    CHECK (operator_action IN ('unreviewed','retry_requested','dismissed'))
);

CREATE TABLE IF NOT EXISTS streaming.creator_audit_event (
  creator_audit_event_id text PRIMARY KEY,
  actor_ref text NOT NULL,
  actor_role_code text NOT NULL,
  action_code text NOT NULL,
  target_ref text NOT NULL,
  result_code text NOT NULL,
  event_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_audit_event_role_code_chk
    CHECK (actor_role_code IN ('owner','editor','reviewer','system')),
  CONSTRAINT creator_audit_event_result_code_chk
    CHECK (result_code IN ('accepted','rejected','error','queued'))
);

CREATE INDEX IF NOT EXISTS idx_creator_project_workspace_updated
  ON streaming.creator_project (workspace_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_creator_upload_job_project_updated
  ON streaming.creator_upload_job (creator_project_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_creator_video_draft_project_updated
  ON streaming.creator_video_draft (creator_project_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_creator_publish_request_publish_ref_created
  ON streaming.creator_publish_request (publish_ref, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_creator_runtime_job_state_next_retry
  ON streaming.creator_runtime_job (state, next_retry_at);

CREATE INDEX IF NOT EXISTS idx_creator_audit_event_target_ref_created
  ON streaming.creator_audit_event (target_ref, created_at DESC);
