-- ============================================================
-- STREAMSTUDIO PHASE1 PROJECTION / RPC
-- additive only
-- review required: 佐藤(DB担当)
-- schema owner intent: streaming
-- ============================================================

create schema if not exists streaming;

create or replace function streaming.fn_relation_exists(
  p_schema_name text,
  p_table_name text
) returns boolean
language sql
stable
as $fn$
  select exists (
    select 1
    from information_schema.tables
    where table_schema = p_schema_name
      and table_name = p_table_name
  );
$fn$;

create or replace function streaming.fn_column_exists(
  p_schema_name text,
  p_table_name text,
  p_column_name text
) returns boolean
language sql
stable
as $fn$
  select exists (
    select 1
    from information_schema.columns
    where table_schema = p_schema_name
      and table_name = p_table_name
      and column_name = p_column_name
  );
$fn$;

create or replace function streaming.fn_streamstudio_dashboard() returns jsonb
language plpgsql
stable
as $fn$
declare
  v_draft_projects integer := 0;
  v_uploads_processing integer := 0;
  v_approval_waiting integer := 0;
  v_scheduled_today integer := 0;
begin
  if streaming.fn_relation_exists('streaming', 'creator_project') then
    execute
      'select count(*) from streaming.creator_project t ' ||
      case
        when streaming.fn_column_exists('streaming', 'creator_project', 'project_status')
          then 'where t.project_status::text = ''project_draft'''
        else ''
      end
    into v_draft_projects;
  end if;

  if streaming.fn_relation_exists('streaming', 'creator_upload_job') then
    execute
      'select count(*) from streaming.creator_upload_job t ' ||
      case
        when streaming.fn_column_exists('streaming', 'creator_upload_job', 'upload_status')
          then 'where t.upload_status::text = ''processing'''
        else ''
      end
    into v_uploads_processing;
  end if;

  if streaming.fn_relation_exists('streaming', 'creator_approval_request') then
    execute
      'select count(*) from streaming.creator_approval_request t ' ||
      case
        when streaming.fn_column_exists('streaming', 'creator_approval_request', 'request_status')
          then 'where t.request_status::text in (''waiting_review'', ''approval_requested'')'
        else ''
      end
    into v_approval_waiting;
  end if;

  if streaming.fn_relation_exists('streaming', 'creator_publish_request') then
    execute
      'select count(*) from streaming.creator_publish_request t ' ||
      case
        when streaming.fn_column_exists('streaming', 'creator_publish_request', 'scheduled_at')
          then 'where t.scheduled_at::date = current_date'
        else ''
      end
    into v_scheduled_today;
  end if;

  return jsonb_build_object(
    'summary',
    jsonb_build_object(
      'draft_projects', v_draft_projects,
      'uploads_processing', v_uploads_processing,
      'approval_waiting', v_approval_waiting,
      'scheduled_today', v_scheduled_today
    )
  );
end;
$fn$;

create or replace function streaming.fn_streamstudio_projects(
  p_limit integer default 20
) returns jsonb
language plpgsql
stable
as $fn$
declare
  v_sql text;
  v_result jsonb;
  v_order_expr text := '1';
  v_id_expr text := quote_literal('cp_001');
  v_title_expr text := quote_literal('Untitled Project');
  v_status_expr text := quote_literal('project_draft');
begin
  if not streaming.fn_relation_exists('streaming', 'creator_project') then
    return jsonb_build_object('items', '[]'::jsonb);
  end if;

  if streaming.fn_column_exists('streaming', 'creator_project', 'updated_at') then
    v_order_expr := 't.updated_at desc nulls last';
  elsif streaming.fn_column_exists('streaming', 'creator_project', 'created_at') then
    v_order_expr := 't.created_at desc nulls last';
  end if;

  if streaming.fn_column_exists('streaming', 'creator_project', 'creator_project_id') then
    v_id_expr := 'coalesce(t.creator_project_id::text, ''cp_001'')';
  end if;

  if streaming.fn_column_exists('streaming', 'creator_project', 'project_title') then
    v_title_expr := 'coalesce(t.project_title::text, ''Untitled Project'')';
  elsif streaming.fn_column_exists('streaming', 'creator_project', 'title') then
    v_title_expr := 'coalesce(t.title::text, ''Untitled Project'')';
  end if;

  if streaming.fn_column_exists('streaming', 'creator_project', 'project_status') then
    v_status_expr := 'coalesce(t.project_status::text, ''project_draft'')';
  end if;

  v_sql :=
    'select jsonb_build_object(' ||
      quote_literal('items') || ', ' ||
      'coalesce(jsonb_agg(jsonb_build_object(' ||
        quote_literal('creator_project_id') || ', ' || v_id_expr || ',' ||
        quote_literal('project_title') || ', ' || v_title_expr || ',' ||
        quote_literal('project_status') || ', ' || v_status_expr ||
      ') order by ' || v_order_expr || '), ''[]''::jsonb)' ||
    ') ' ||
    'from (' ||
      'select * from streaming.creator_project t ' ||
      'order by ' || v_order_expr ||
      ' limit ' || greatest(coalesce(p_limit, 20), 1) ||
    ') t';

  execute v_sql into v_result;

  return coalesce(v_result, jsonb_build_object('items', '[]'::jsonb));
end;
$fn$;

create or replace function streaming.fn_streamstudio_upload_queue(
  p_limit integer default 20
) returns jsonb
language plpgsql
stable
as $fn$
declare
  v_sql text;
  v_result jsonb;
  v_order_expr text := '1';
  v_id_expr text := quote_literal('up_001');
  v_target_expr text := quote_literal('project_asset');
  v_status_expr text := quote_literal('processing');
begin
  if not streaming.fn_relation_exists('streaming', 'creator_upload_job') then
    return jsonb_build_object('items', '[]'::jsonb);
  end if;

  if streaming.fn_column_exists('streaming', 'creator_upload_job', 'updated_at') then
    v_order_expr := 't.updated_at desc nulls last';
  elsif streaming.fn_column_exists('streaming', 'creator_upload_job', 'created_at') then
    v_order_expr := 't.created_at desc nulls last';
  end if;

  if streaming.fn_column_exists('streaming', 'creator_upload_job', 'creator_upload_job_id') then
    v_id_expr := 'coalesce(t.creator_upload_job_id::text, ''up_001'')';
  end if;

  if streaming.fn_column_exists('streaming', 'creator_upload_job', 'upload_target_type') then
    v_target_expr := 'coalesce(t.upload_target_type::text, ''project_asset'')';
  end if;

  if streaming.fn_column_exists('streaming', 'creator_upload_job', 'upload_status') then
    v_status_expr := 'coalesce(t.upload_status::text, ''processing'')';
  end if;

  v_sql :=
    'select jsonb_build_object(' ||
      quote_literal('items') || ', ' ||
      'coalesce(jsonb_agg(jsonb_build_object(' ||
        quote_literal('creator_upload_job_id') || ', ' || v_id_expr || ',' ||
        quote_literal('upload_target_type') || ', ' || v_target_expr || ',' ||
        quote_literal('upload_status') || ', ' || v_status_expr ||
      ') order by ' || v_order_expr || '), ''[]''::jsonb)' ||
    ') ' ||
    'from (' ||
      'select * from streaming.creator_upload_job t ' ||
      'order by ' || v_order_expr ||
      ' limit ' || greatest(coalesce(p_limit, 20), 1) ||
    ') t';

  execute v_sql into v_result;

  return coalesce(v_result, jsonb_build_object('items', '[]'::jsonb));
end;
$fn$;

create or replace function streaming.fn_streamstudio_project_create_stub(
  p_project_title text
) returns jsonb
language sql
volatile
as $fn$
  select jsonb_build_object(
    'accepted', true,
    'project',
    jsonb_build_object(
      'creator_project_id', 'cp_new_001',
      'project_title', coalesce(p_project_title, 'Untitled Project'),
      'project_status', 'project_draft'
    )
  );
$fn$;

create or replace function streaming.fn_streamstudio_upload_create_stub(
  p_upload_target_type text default null
) returns jsonb
language sql
volatile
as $fn$
  select jsonb_build_object(
    'accepted', true,
    'upload_job',
    jsonb_build_object(
      'creator_upload_job_id', 'up_new_001',
      'upload_target_type', coalesce(p_upload_target_type, 'project_asset'),
      'upload_status', 'queued'
    )
  );
$fn$;

create or replace function streaming.fn_streamstudio_approval_request_stub(
  p_creator_project_id text,
  p_approval_type text default null
) returns jsonb
language sql
volatile
as $fn$
  select jsonb_build_object(
    'accepted', true,
    'approval_request',
    jsonb_build_object(
      'creator_project_id', coalesce(p_creator_project_id, 'cp_001'),
      'approval_type', coalesce(p_approval_type, 'publish_gate'),
      'request_status', 'waiting_review'
    )
  );
$fn$;

create or replace function streaming.fn_streamstudio_publish_request_stub(
  p_creator_project_id text,
  p_publish_mode text default null
) returns jsonb
language sql
volatile
as $fn$
  select jsonb_build_object(
    'accepted', true,
    'publish_request',
    jsonb_build_object(
      'creator_project_id', coalesce(p_creator_project_id, 'cp_001'),
      'publish_mode', coalesce(p_publish_mode, 'publish_now'),
      'publish_status', 'requested'
    )
  );
$fn$;
