-- ============================================================
-- STREAMWATCH PHASE1 PROJECTION / RPC
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

create or replace function streaming.fn_streamwatch_profile_bootstrap(
  p_viewer_profile_id text default null
) returns jsonb
language plpgsql
stable
as $fn$
declare
  v_sql text;
  v_result jsonb;
  v_order_expr text := '1';
begin
  if not streaming.fn_relation_exists('streaming', 'viewer_profile_records') then
    return jsonb_build_object(
      'viewer_profile',
      jsonb_build_object(
        'viewer_profile_id', coalesce(p_viewer_profile_id, 'vp_demo_primary'),
        'display_name', 'Primary Viewer',
        'restriction_level', 'standard'
      )
    );
  end if;

  if streaming.fn_column_exists('streaming', 'viewer_profile_records', 'updated_at') then
    v_order_expr := 't.updated_at desc nulls last';
  elsif streaming.fn_column_exists('streaming', 'viewer_profile_records', 'created_at') then
    v_order_expr := 't.created_at desc nulls last';
  end if;

  v_sql :=
    'select jsonb_build_object(' ||
    quote_literal('viewer_profile') || ', jsonb_build_object(' ||
      quote_literal('viewer_profile_id') || ', ' ||
        case
          when streaming.fn_column_exists('streaming', 'viewer_profile_records', 'viewer_profile_id')
            then 'coalesce(t.viewer_profile_id::text, coalesce($1, ''vp_demo_primary''))'
          else 'coalesce($1, ''vp_demo_primary'')'
        end || ',' ||
      quote_literal('display_name') || ', ' ||
        case
          when streaming.fn_column_exists('streaming', 'viewer_profile_records', 'display_name')
            then 'coalesce(t.display_name::text, ''Primary Viewer'')'
          else quote_literal('Primary Viewer')
        end || ',' ||
      quote_literal('restriction_level') || ', ' ||
        case
          when streaming.fn_column_exists('streaming', 'viewer_profile_records', 'restriction_level')
            then 'coalesce(t.restriction_level::text, ''standard'')'
          else quote_literal('standard')
        end ||
    ')) ' ||
    'from streaming.viewer_profile_records t ' ||
    case
      when streaming.fn_column_exists('streaming', 'viewer_profile_records', 'viewer_profile_id')
        then 'where ($1 is null or t.viewer_profile_id::text = $1) '
      else ''
    end ||
    'order by ' || v_order_expr || ' limit 1';

  execute v_sql using p_viewer_profile_id into v_result;

  return coalesce(
    v_result,
    jsonb_build_object(
      'viewer_profile',
      jsonb_build_object(
        'viewer_profile_id', coalesce(p_viewer_profile_id, 'vp_demo_primary'),
        'display_name', 'Primary Viewer',
        'restriction_level', 'standard'
      )
    )
  );
end;
$fn$;

create or replace function streaming.fn_streamwatch_home(
  p_viewer_profile_id text default null,
  p_limit integer default 12
) returns jsonb
language plpgsql
stable
as $fn$
declare
  v_sql text;
  v_result jsonb;
  v_order_expr text := '1';
  v_where text := '';
  v_content_expr text := quote_literal('cw_001');
  v_title_expr text := quote_literal('Unknown Title');
  v_ratio_expr text := '0::numeric';
begin
  if not streaming.fn_relation_exists('streaming', 'viewer_progress_states') then
    return jsonb_build_object(
      'continue_watching', '[]'::jsonb,
      'featured', '[]'::jsonb
    );
  end if;

  if streaming.fn_column_exists('streaming', 'viewer_progress_states', 'updated_at') then
    v_order_expr := 't.updated_at desc nulls last';
  elsif streaming.fn_column_exists('streaming', 'viewer_progress_states', 'created_at') then
    v_order_expr := 't.created_at desc nulls last';
  elsif streaming.fn_column_exists('streaming', 'viewer_progress_states', 'last_viewed_at') then
    v_order_expr := 't.last_viewed_at desc nulls last';
  end if;

  if streaming.fn_column_exists('streaming', 'viewer_progress_states', 'viewer_profile_id') then
    v_where := 'where ($1 is null or t.viewer_profile_id::text = $1) ';
  end if;

  if streaming.fn_column_exists('streaming', 'viewer_progress_states', 'content_id') then
    v_content_expr := 'coalesce(t.content_id::text, ''cw_001'')';
  end if;

  if streaming.fn_column_exists('streaming', 'viewer_progress_states', 'title') then
    v_title_expr := 'coalesce(t.title::text, ' || v_content_expr || ')';
  else
    v_title_expr := v_content_expr;
  end if;

  if streaming.fn_column_exists('streaming', 'viewer_progress_states', 'progress_ratio') then
    v_ratio_expr := 'coalesce(t.progress_ratio, 0::numeric)';
  elsif streaming.fn_column_exists('streaming', 'viewer_progress_states', 'progress_percent') then
    v_ratio_expr := 'coalesce(t.progress_percent / 100.0, 0::numeric)';
  end if;

  v_sql :=
    'select jsonb_build_object(' ||
      quote_literal('continue_watching') || ', ' ||
      'coalesce(jsonb_agg(jsonb_build_object(' ||
        quote_literal('content_id') || ', ' || v_content_expr || ',' ||
        quote_literal('title') || ', ' || v_title_expr || ',' ||
        quote_literal('resume_ratio') || ', ' || v_ratio_expr ||
      ') order by ' || v_order_expr || '), ''[]''::jsonb),' ||
      quote_literal('featured') || ', ''[]''::jsonb' ||
    ') ' ||
    'from (' ||
      'select * from streaming.viewer_progress_states t ' ||
      v_where ||
      'order by ' || v_order_expr ||
      ' limit ' || greatest(coalesce(p_limit, 12), 1) ||
    ') t';

  execute v_sql using p_viewer_profile_id into v_result;

  return coalesce(
    v_result,
    jsonb_build_object(
      'continue_watching', '[]'::jsonb,
      'featured', '[]'::jsonb
    )
  );
end;
$fn$;

create or replace function streaming.fn_streamwatch_category_tree(
  p_limit integer default 100
) returns jsonb
language plpgsql
stable
as $fn$
declare
  v_sql text;
  v_result jsonb;
  v_order_expr text := '1';
  v_id_expr text := quote_literal('cat_demo');
  v_name_expr text := quote_literal('Category');
  v_depth_expr text := '0';
begin
  if not streaming.fn_relation_exists('streaming', 'category_tree_nodes') then
    return jsonb_build_object('nodes', '[]'::jsonb);
  end if;

  if streaming.fn_column_exists('streaming', 'category_tree_nodes', 'sort_order') then
    v_order_expr := 't.sort_order asc nulls last';
  elsif streaming.fn_column_exists('streaming', 'category_tree_nodes', 'display_order') then
    v_order_expr := 't.display_order asc nulls last';
  elsif streaming.fn_column_exists('streaming', 'category_tree_nodes', 'category_name') then
    v_order_expr := 't.category_name asc nulls last';
  end if;

  if streaming.fn_column_exists('streaming', 'category_tree_nodes', 'category_node_id') then
    v_id_expr := 'coalesce(t.category_node_id::text, ''cat_demo'')';
  end if;

  if streaming.fn_column_exists('streaming', 'category_tree_nodes', 'category_name') then
    v_name_expr := 'coalesce(t.category_name::text, ''Category'')';
  elsif streaming.fn_column_exists('streaming', 'category_tree_nodes', 'node_name') then
    v_name_expr := 'coalesce(t.node_name::text, ''Category'')';
  end if;

  if streaming.fn_column_exists('streaming', 'category_tree_nodes', 'depth') then
    v_depth_expr := 'coalesce(t.depth, 0)';
  end if;

  v_sql :=
    'select jsonb_build_object(' ||
      quote_literal('nodes') || ', ' ||
      'coalesce(jsonb_agg(jsonb_build_object(' ||
        quote_literal('category_node_id') || ', ' || v_id_expr || ',' ||
        quote_literal('category_name') || ', ' || v_name_expr || ',' ||
        quote_literal('depth') || ', ' || v_depth_expr ||
      ') order by ' || v_order_expr || '), ''[]''::jsonb)' ||
    ') ' ||
    'from (' ||
      'select * from streaming.category_tree_nodes t ' ||
      'order by ' || v_order_expr ||
      ' limit ' || greatest(coalesce(p_limit, 100), 1) ||
    ') t';

  execute v_sql into v_result;

  return coalesce(v_result, jsonb_build_object('nodes', '[]'::jsonb));
end;
$fn$;

create or replace function streaming.fn_streamwatch_library(
  p_viewer_profile_id text default null,
  p_limit integer default 24
) returns jsonb
language plpgsql
stable
as $fn$
declare
  v_sql text;
  v_result jsonb;
  v_order_expr text := '1';
  v_where text := '';
  v_content_expr text := quote_literal('hist_001');
  v_title_expr text := quote_literal('Unknown Title');
  v_position_expr text := '0';
begin
  if not streaming.fn_relation_exists('streaming', 'viewer_progress_states') then
    return jsonb_build_object(
      'history_preview', '[]'::jsonb,
      'playlists', '[]'::jsonb,
      'favorites', '[]'::jsonb,
      'watch_later', '[]'::jsonb
    );
  end if;

  if streaming.fn_column_exists('streaming', 'viewer_progress_states', 'updated_at') then
    v_order_expr := 't.updated_at desc nulls last';
  elsif streaming.fn_column_exists('streaming', 'viewer_progress_states', 'created_at') then
    v_order_expr := 't.created_at desc nulls last';
  elsif streaming.fn_column_exists('streaming', 'viewer_progress_states', 'last_viewed_at') then
    v_order_expr := 't.last_viewed_at desc nulls last';
  end if;

  if streaming.fn_column_exists('streaming', 'viewer_progress_states', 'viewer_profile_id') then
    v_where := 'where ($1 is null or t.viewer_profile_id::text = $1) ';
  end if;

  if streaming.fn_column_exists('streaming', 'viewer_progress_states', 'content_id') then
    v_content_expr := 'coalesce(t.content_id::text, ''hist_001'')';
  end if;

  if streaming.fn_column_exists('streaming', 'viewer_progress_states', 'title') then
    v_title_expr := 'coalesce(t.title::text, ' || v_content_expr || ')';
  else
    v_title_expr := v_content_expr;
  end if;

  if streaming.fn_column_exists('streaming', 'viewer_progress_states', 'last_position_seconds') then
    v_position_expr := 'coalesce(t.last_position_seconds, 0)';
  end if;

  v_sql :=
    'select jsonb_build_object(' ||
      quote_literal('history_preview') || ', ' ||
      'coalesce(jsonb_agg(jsonb_build_object(' ||
        quote_literal('content_id') || ', ' || v_content_expr || ',' ||
        quote_literal('title') || ', ' || v_title_expr || ',' ||
        quote_literal('last_position_seconds') || ', ' || v_position_expr ||
      ') order by ' || v_order_expr || '), ''[]''::jsonb),' ||
      quote_literal('playlists') || ', ''[]''::jsonb,' ||
      quote_literal('favorites') || ', ''[]''::jsonb,' ||
      quote_literal('watch_later') || ', ''[]''::jsonb' ||
    ') ' ||
    'from (' ||
      'select * from streaming.viewer_progress_states t ' ||
      v_where ||
      'order by ' || v_order_expr ||
      ' limit ' || greatest(coalesce(p_limit, 24), 1) ||
    ') t';

  execute v_sql using p_viewer_profile_id into v_result;

  return coalesce(
    v_result,
    jsonb_build_object(
      'history_preview', '[]'::jsonb,
      'playlists', '[]'::jsonb,
      'favorites', '[]'::jsonb,
      'watch_later', '[]'::jsonb
    )
  );
end;
$fn$;

create or replace function streaming.fn_streamwatch_progress_upsert_stub(
  p_viewer_profile_id text,
  p_content_id text,
  p_progress_ratio numeric default 0
) returns jsonb
language sql
volatile
as $fn$
  select jsonb_build_object(
    'accepted', true,
    'saved_progress',
    jsonb_build_object(
      'viewer_profile_id', coalesce(p_viewer_profile_id, 'vp_demo_primary'),
      'content_id', coalesce(p_content_id, 'cw_001'),
      'progress_ratio', coalesce(p_progress_ratio, 0)
    )
  );
$fn$;

create or replace function streaming.fn_streamwatch_tv_handoff_start_stub(
  p_viewer_profile_id text,
  p_content_id text,
  p_target_device_route text
) returns jsonb
language sql
volatile
as $fn$
  select jsonb_build_object(
    'accepted', true,
    'handoff_session',
    jsonb_build_object(
      'handoff_session_id', 'handoff_demo_001',
      'viewer_profile_id', coalesce(p_viewer_profile_id, 'vp_demo_primary'),
      'content_id', coalesce(p_content_id, 'cw_001'),
      'target_device_route', coalesce(p_target_device_route, 'living_room_tv'),
      'handoff_status', 'pending'
    )
  );
$fn$;

create or replace function streaming.fn_streamwatch_membership_join_stub(
  p_membership_id text default null
) returns jsonb
language sql
volatile
as $fn$
  select jsonb_build_object(
    'accepted', true,
    'membership_join_result',
    jsonb_build_object(
      'membership_id', coalesce(p_membership_id, 'membership_demo_001'),
      'result_status', 'join_requested'
    )
  );
$fn$;
