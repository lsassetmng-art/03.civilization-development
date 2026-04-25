BEGIN;

CREATE OR REPLACE VIEW streaming.v_stream_studio_project_list AS
SELECT
  creator_project_id,
  workspace_id,
  project_code,
  project_title,
  project_summary,
  project_status,
  owner_creator_ref,
  default_language,
  initial_visibility_hint,
  version,
  created_at,
  updated_at
FROM streaming.creator_project;

CREATE OR REPLACE VIEW streaming.v_stream_studio_publish_history AS
SELECT
  r.creator_publish_request_id,
  r.publish_ref,
  r.request_channel,
  r.request_status,
  r.execute_after,
  r.idempotency_key,
  r.created_at,
  s.creator_project_id,
  s.visibility_code,
  s.destination_ref,
  s.rights_check_status,
  s.readiness_status,
  s.scheduled_at
FROM streaming.creator_publish_request r
LEFT JOIN streaming.creator_publish_setting s
  ON s.publish_ref = r.publish_ref;

CREATE OR REPLACE FUNCTION streaming.fn_stream_studio_create_project(
  p_workspace_id text,
  p_project_title text,
  p_project_summary text DEFAULT NULL,
  p_owner_creator_ref text DEFAULT NULL,
  p_default_language text DEFAULT 'en',
  p_initial_visibility_hint text DEFAULT NULL
)
RETURNS TABLE (
  creator_project_id text,
  project_code text,
  project_title text,
  project_status text,
  owner_creator_ref text,
  default_language text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_creator_project_id text;
  v_project_code text;
BEGIN
  IF p_workspace_id IS NULL OR btrim(p_workspace_id) = '' THEN
    RAISE EXCEPTION 'workspace_id is required';
  END IF;

  IF p_project_title IS NULL OR btrim(p_project_title) = '' THEN
    RAISE EXCEPTION 'project_title is required';
  END IF;

  IF length(p_project_title) > 200 THEN
    RAISE EXCEPTION 'project_title max length is 200';
  END IF;

  IF p_default_language IS NULL OR btrim(p_default_language) = '' THEN
    RAISE EXCEPTION 'default_language is required';
  END IF;

  v_creator_project_id := 'prj-' || substr(md5(clock_timestamp()::text || random()::text), 1, 12);
  v_project_code := 'PRJ-' || upper(substr(md5(clock_timestamp()::text || random()::text), 1, 8));

  INSERT INTO streaming.creator_project (
    creator_project_id,
    workspace_id,
    project_code,
    project_title,
    project_summary,
    owner_creator_ref,
    default_language,
    initial_visibility_hint
  )
  VALUES (
    v_creator_project_id,
    p_workspace_id,
    v_project_code,
    p_project_title,
    p_project_summary,
    COALESCE(NULLIF(btrim(p_owner_creator_ref), ''), 'system'),
    p_default_language,
    p_initial_visibility_hint
  );

  RETURN QUERY
  SELECT
    cp.creator_project_id,
    cp.project_code,
    cp.project_title,
    cp.project_status,
    cp.owner_creator_ref,
    cp.default_language,
    cp.created_at,
    cp.updated_at
  FROM streaming.creator_project cp
  WHERE cp.creator_project_id = v_creator_project_id;
END;
$$;

CREATE OR REPLACE FUNCTION streaming.fn_stream_studio_register_publish_request(
  p_publish_ref text,
  p_request_channel text,
  p_execute_after timestamptz DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
)
RETURNS TABLE (
  creator_publish_request_id text,
  publish_ref text,
  request_channel text,
  request_status text,
  execute_after timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_creator_publish_request_id text;
  v_request_status text;
BEGIN
  IF p_publish_ref IS NULL OR btrim(p_publish_ref) = '' THEN
    RAISE EXCEPTION 'publish_ref is required';
  END IF;

  IF p_request_channel NOT IN ('publish_now', 'schedule') THEN
    RAISE EXCEPTION 'request_channel must be publish_now or schedule';
  END IF;

  v_creator_publish_request_id := 'pubreq-' || substr(md5(clock_timestamp()::text || random()::text), 1, 12);
  v_request_status := CASE WHEN p_request_channel = 'schedule' THEN 'scheduled' ELSE 'registered' END;

  INSERT INTO streaming.creator_publish_request (
    creator_publish_request_id,
    publish_ref,
    request_channel,
    request_status,
    execute_after,
    idempotency_key
  )
  VALUES (
    v_creator_publish_request_id,
    p_publish_ref,
    p_request_channel,
    v_request_status,
    p_execute_after,
    p_idempotency_key
  );

  RETURN QUERY
  SELECT
    pr.creator_publish_request_id,
    pr.publish_ref,
    pr.request_channel,
    pr.request_status,
    pr.execute_after,
    pr.created_at
  FROM streaming.creator_publish_request pr
  WHERE pr.creator_publish_request_id = v_creator_publish_request_id;
END;
$$;

COMMIT;
