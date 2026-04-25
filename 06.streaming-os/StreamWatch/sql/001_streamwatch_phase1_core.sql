-- ============================================================
-- STREAMWATCH PHASE1 CORE SQL
-- schema: streaming
-- db_target: PERSONA_DATABASE_URL
-- review_required: Sato (DB)
-- ============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS streaming;

CREATE TABLE IF NOT EXISTS streaming.viewer_profile_records (
  viewer_profile_id uuid PRIMARY KEY,
  actor_civilization_id uuid NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  preferred_language_code text,
  subtitle_default_code text,
  autoplay_enabled boolean NOT NULL DEFAULT true,
  live_notification_enabled boolean NOT NULL DEFAULT true,
  restriction_mode text NOT NULL,
  age_band text,
  is_default_profile boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_viewer_profile_restriction_mode CHECK (
    restriction_mode IN ('standard','family_safe','teen','restricted')
  )
);

CREATE INDEX IF NOT EXISTS idx_viewer_profile_records_actor
  ON streaming.viewer_profile_records(actor_civilization_id);

CREATE TABLE IF NOT EXISTS streaming.viewer_progress_states (
  progress_state_id uuid PRIMARY KEY,
  actor_civilization_id uuid NOT NULL,
  viewer_profile_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  position_seconds integer NOT NULL DEFAULT 0,
  duration_seconds integer,
  completion_ratio numeric(7,4) NOT NULL DEFAULT 0,
  continuity_state text NOT NULL DEFAULT 'not_started',
  last_device_mode text,
  last_route_context text,
  last_played_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_viewer_progress_states UNIQUE (viewer_profile_id, target_type, target_id),
  CONSTRAINT fk_viewer_progress_states_profile FOREIGN KEY (viewer_profile_id)
    REFERENCES streaming.viewer_profile_records(viewer_profile_id),
  CONSTRAINT chk_viewer_progress_target_type CHECK (
    target_type IN ('video_asset','live_session','archive_asset','clip_asset','series')
  ),
  CONSTRAINT chk_viewer_progress_continuity_state CHECK (
    continuity_state IN ('not_started','in_progress','completed')
  ),
  CONSTRAINT chk_viewer_progress_completion_ratio CHECK (
    completion_ratio >= 0 AND completion_ratio <= 1
  )
);

CREATE INDEX IF NOT EXISTS idx_viewer_progress_states_profile_target
  ON streaming.viewer_progress_states(viewer_profile_id, target_type, target_id);

CREATE TABLE IF NOT EXISTS streaming.category_tree_nodes (
  category_node_id uuid PRIMARY KEY,
  parent_category_node_id uuid,
  root_key text NOT NULL,
  node_key text NOT NULL,
  display_label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_category_tree_parent FOREIGN KEY (parent_category_node_id)
    REFERENCES streaming.category_tree_nodes(category_node_id)
);

CREATE INDEX IF NOT EXISTS idx_category_tree_nodes_parent_sort
  ON streaming.category_tree_nodes(parent_category_node_id, sort_order);

CREATE TABLE IF NOT EXISTS streaming.cast_handoff_sessions (
  handoff_session_id uuid PRIMARY KEY,
  actor_civilization_id uuid NOT NULL,
  viewer_profile_id uuid NOT NULL,
  source_device_mode text NOT NULL,
  target_route_kind text NOT NULL,
  target_route_label text,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  resume_position_seconds integer NOT NULL DEFAULT 0,
  subtitle_default_code text,
  audio_default_code text,
  claim_code text NOT NULL,
  claim_state text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_cast_handoff_sessions_profile FOREIGN KEY (viewer_profile_id)
    REFERENCES streaming.viewer_profile_records(viewer_profile_id),
  CONSTRAINT chk_cast_handoff_claim_state CHECK (
    claim_state IN ('pending','claimed','expired','cancelled')
  )
);

CREATE INDEX IF NOT EXISTS idx_cast_handoff_sessions_claim_code
  ON streaming.cast_handoff_sessions(claim_code);

CREATE OR REPLACE FUNCTION streaming.fn_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_viewer_profile_records_touch_updated_at ON streaming.viewer_profile_records;
CREATE TRIGGER trg_viewer_profile_records_touch_updated_at
BEFORE UPDATE ON streaming.viewer_profile_records
FOR EACH ROW EXECUTE FUNCTION streaming.fn_touch_updated_at();

DROP TRIGGER IF EXISTS trg_viewer_progress_states_touch_updated_at ON streaming.viewer_progress_states;
CREATE TRIGGER trg_viewer_progress_states_touch_updated_at
BEFORE UPDATE ON streaming.viewer_progress_states
FOR EACH ROW EXECUTE FUNCTION streaming.fn_touch_updated_at();

DROP TRIGGER IF EXISTS trg_category_tree_nodes_touch_updated_at ON streaming.category_tree_nodes;
CREATE TRIGGER trg_category_tree_nodes_touch_updated_at
BEFORE UPDATE ON streaming.category_tree_nodes
FOR EACH ROW EXECUTE FUNCTION streaming.fn_touch_updated_at();

DROP TRIGGER IF EXISTS trg_cast_handoff_sessions_touch_updated_at ON streaming.cast_handoff_sessions;
CREATE TRIGGER trg_cast_handoff_sessions_touch_updated_at
BEFORE UPDATE ON streaming.cast_handoff_sessions
FOR EACH ROW EXECUTE FUNCTION streaming.fn_touch_updated_at();

COMMIT;
