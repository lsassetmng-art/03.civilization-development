/* AICM_COMPANY_ROBOT_PLACEMENT_WRITE_API_V1 */
import http from "node:http";
import { spawnSync } from "node:child_process";

const PORT = Number(process.env.AICM_WRITE_API_PORT || "8795");
const DATABASE_URL = process.env.PERSONA_DATABASE_URL || "";

function sendJson(res, status, body) {
  const text = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store"
  });
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("request_body_too_large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function makeSql(payload, rollbackOnly) {
  const json = JSON.stringify(payload);
  const tag = "$aicm_payload_" + Date.now() + "_" + Math.random().toString(16).slice(2) + "$";
  if (json.includes(tag)) throw new Error("payload_delimiter_collision");

  return `
\\set ON_ERROR_STOP on
begin;

create temp table aicm_ui_payload(j jsonb) on commit drop;
insert into aicm_ui_payload(j) values (${tag}${json}${tag}::jsonb);

do $$
declare
  p jsonb;

  v_company_id_text text;
  v_company_id uuid;
  v_target_level text;
  v_target_id_text text;
  v_target_id uuid;
  v_role_code text;
  v_robot_pool_id_text text;
  v_robot_pool_id uuid;
  v_payload_model_code text;
  v_payload_display_name text;
  v_payload_nickname text;

  v_robot_row jsonb;
  v_exact_model_code text;
  v_display_name text;
  v_series_code text;
  v_role_1 text;
  v_role_2 text;
  v_role_3 text;

  r record;
  v_company_col text := '';
  v_target_level_col text := '';
  v_target_id_col text := '';
  v_role_col text := '';
  v_cols text[] := array[]::text[];
  v_exprs text[] := array[]::text[];
  v_sets text[] := array[]::text[];
  v_where text;
  v_update_sql text;
  v_insert_sql text;
  v_updated int := 0;
  v_inserted int := 0;
begin
  select j into p from aicm_ui_payload limit 1;

  v_company_id_text := trim(coalesce(p->>'company_id', ''));
  v_target_level := trim(coalesce(p->>'target_scope', p->>'target_level_code', ''));
  v_target_id_text := trim(coalesce(p->>'target_id', ''));
  v_role_code := trim(coalesce(p->>'placement_role_code', p->>'role_code', p->>'role', ''));
  v_robot_pool_id_text := trim(coalesce(p->>'robot_pool_id', ''));
  v_payload_model_code := trim(coalesce(p->>'aiworker_model_code', p->>'model_code', ''));
  v_payload_display_name := trim(coalesce(p->>'robot_display_name', p->>'display_name', ''));
  v_payload_nickname := trim(coalesce(p->>'internal_nickname', p->>'nickname', ''));

  if v_company_id_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    raise exception 'company_id_required_or_invalid: %', v_company_id_text;
  end if;
  v_company_id := v_company_id_text::uuid;

  if v_role_code not in ('President', 'Manager', 'Leader', 'Worker') then
    raise exception 'unsupported_role_code: %', v_role_code;
  end if;

  if v_target_level not in ('company', 'department', 'section', 'organization') then
    raise exception 'unsupported_target_level: %', v_target_level;
  end if;

  if v_target_level <> 'company' then
    if v_target_id_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'target_id_required_or_invalid: %', v_target_id_text;
    end if;
    v_target_id := v_target_id_text::uuid;
  else
    v_target_id := null;
  end if;

  if v_robot_pool_id_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    raise exception 'robot_pool_id_required_or_invalid: %', v_robot_pool_id_text;
  end if;
  v_robot_pool_id := v_robot_pool_id_text::uuid;

  select to_jsonb(rp)
    into v_robot_row
  from business.robot_pool rp
  where coalesce(
    to_jsonb(rp)->>'robot_pool_id',
    to_jsonb(rp)->>'business_robot_pool_id',
    to_jsonb(rp)->>'pool_id',
    to_jsonb(rp)->>'id',
    ''
  ) = v_robot_pool_id_text
  limit 1;

  if v_robot_row is null then
    raise exception 'robot_pool_row_not_found: %', v_robot_pool_id_text;
  end if;

  v_exact_model_code := trim(coalesce(
    v_robot_row->>'aiworker_model_code',
    v_robot_row->>'ai_worker_model_code',
    v_robot_row->>'model_code',
    v_robot_row->>'robot_model_code',
    v_robot_row->>'model_no',
    v_payload_model_code,
    ''
  ));

  v_display_name := trim(coalesce(
    v_robot_row->>'display_name',
    v_robot_row->>'robot_display_name',
    v_robot_row->>'model_name_en',
    v_robot_row->>'model_name_ja',
    v_robot_row->>'name',
    v_payload_display_name,
    v_exact_model_code,
    ''
  ));

  v_series_code := trim(coalesce(v_robot_row->>'aiworker_series_code', v_robot_row->>'series_code', ''));
  v_role_1 := trim(coalesce(v_robot_row->>'placement_role_code_1', ''));
  v_role_2 := trim(coalesce(v_robot_row->>'placement_role_code_2', ''));
  v_role_3 := trim(coalesce(v_robot_row->>'placement_role_code_3', ''));

  if v_exact_model_code = '' then
    raise exception 'exact_model_code_missing';
  end if;

  if not (v_role_code in (v_role_1, v_role_2, v_role_3)) then
    raise exception 'robot_not_eligible_for_role: role=% model=% roles=%/%/%',
      v_role_code, v_exact_model_code, v_role_1, v_role_2, v_role_3;
  end if;

  if v_role_code = 'Worker' and (
    v_exact_model_code like 'LVS-%'
    or v_series_code = 'LoVerS'
    or v_display_name ilike 'LoVerS%'
    or v_display_name ilike '%Lover%'
  ) then
    raise exception 'lovers_candidate_for_worker_is_forbidden: % / %', v_exact_model_code, v_display_name;
  end if;

  if v_role_code = 'Worker'
     and v_exact_model_code not in ('BYD1-003','BYD1-002','BYD1-001','HD-R3','MG-NORN-001','MG-NORN-002','MG-NORN-003') then
    raise exception 'worker_requires_exact_worker_model: %', v_exact_model_code;
  end if;

  select column_name into v_company_col
  from information_schema.columns
  where table_schema = 'business'
    and table_name = 'company_robot_placement'
    and column_name = 'company_id'
  limit 1;

  select column_name into v_target_level_col
  from information_schema.columns
  where table_schema = 'business'
    and table_name = 'company_robot_placement'
    and column_name in ('target_level_code', 'target_scope', 'scope', 'placement_scope', 'target_type', 'target_kind')
  order by case column_name when 'target_level_code' then 1 when 'target_scope' then 2 else 9 end
  limit 1;

  select column_name into v_target_id_col
  from information_schema.columns
  where table_schema = 'business'
    and table_name = 'company_robot_placement'
    and column_name = 'target_id'
  limit 1;

  select column_name into v_role_col
  from information_schema.columns
  where table_schema = 'business'
    and table_name = 'company_robot_placement'
    and column_name in ('placement_role_code', 'role_code', 'assigned_role_code', 'role')
  order by case column_name when 'placement_role_code' then 1 when 'role_code' then 2 else 9 end
  limit 1;

  if coalesce(v_company_col, '') = '' or coalesce(v_target_level_col, '') = '' or coalesce(v_target_id_col, '') = '' or coalesce(v_role_col, '') = '' then
    raise exception 'required_company_robot_placement_columns_missing company=% target_level=% target_id=% role=%',
      v_company_col, v_target_level_col, v_target_id_col, v_role_col;
  end if;

  for r in
    select column_name, udt_name, column_default, is_nullable
    from information_schema.columns
    where table_schema = 'business'
      and table_name = 'company_robot_placement'
    order by ordinal_position
  loop
    if r.column_name in ('company_robot_placement_id', 'placement_id', 'id') then
      if r.column_default is null then
        v_cols := array_append(v_cols, quote_ident(r.column_name));
        if r.udt_name = 'uuid' then
          v_exprs := array_append(v_exprs, '(''00000000-0000-4000-8000-'' || substr(md5(clock_timestamp()::text || random()::text || v_role_code), 1, 12))::uuid');
        else
          v_exprs := array_append(v_exprs, '''aicm-placement-'' || md5(clock_timestamp()::text || random()::text || ' || quote_literal(v_role_code) || ')');
        end if;
      end if;

    elsif r.column_name = 'company_id' then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      if r.udt_name = 'uuid' then
        v_exprs := array_append(v_exprs, '$1');
      else
        v_exprs := array_append(v_exprs, '$1::text');
      end if;

    elsif r.column_name in ('target_level_code', 'target_scope', 'scope', 'placement_scope', 'target_type', 'target_kind') then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      v_exprs := array_append(v_exprs, '$2');

    elsif r.column_name = 'target_id' then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      if r.udt_name = 'uuid' then
        v_exprs := array_append(v_exprs, 'case when $2 = ''company'' then null::uuid else $3 end');
      else
        v_exprs := array_append(v_exprs, 'case when $2 = ''company'' then '''' else $3::text end');
      end if;

    elsif r.column_name in ('placement_role_code', 'role_code', 'assigned_role_code', 'role') then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      v_exprs := array_append(v_exprs, '$4');

    elsif r.column_name in ('robot_pool_id', 'business_robot_pool_id', 'pool_id') then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      if r.udt_name = 'uuid' then
        v_exprs := array_append(v_exprs, '$5');
        v_sets := array_append(v_sets, quote_ident(r.column_name) || ' = $5');
      else
        v_exprs := array_append(v_exprs, '$5::text');
        v_sets := array_append(v_sets, quote_ident(r.column_name) || ' = $5::text');
      end if;

    elsif r.column_name in ('model_code', 'robot_model_code', 'robot_model_no', 'model_no') then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      v_exprs := array_append(v_exprs, '$6');
      v_sets := array_append(v_sets, quote_ident(r.column_name) || ' = $6');

    elsif r.column_name in ('aiworker_model_code', 'ai_worker_model_code') then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      v_exprs := array_append(v_exprs, '$6');
      v_sets := array_append(v_sets, quote_ident(r.column_name) || ' = $6');

    elsif r.column_name in ('robot_display_name', 'display_name', 'robot_name', 'model_name') then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      v_exprs := array_append(v_exprs, '$7');
      v_sets := array_append(v_sets, quote_ident(r.column_name) || ' = $7');

    elsif r.column_name in ('internal_nickname', 'nickname', 'display_nickname') then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      v_exprs := array_append(v_exprs, '$8');
      v_sets := array_append(v_sets, quote_ident(r.column_name) || ' = $8');

    elsif r.column_name = 'assignment_policy' then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      v_exprs := array_append(v_exprs, '''unlimited_system_use''');
      v_sets := array_append(v_sets, quote_ident(r.column_name) || ' = ''unlimited_system_use''');

    elsif r.column_name in ('quantity_consumption', 'quantity_consumption_flag', 'quantity_consumed_flag') then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      if r.udt_name = 'bool' then
        v_exprs := array_append(v_exprs, 'false');
        v_sets := array_append(v_sets, quote_ident(r.column_name) || ' = false');
      else
        v_exprs := array_append(v_exprs, '''false''');
        v_sets := array_append(v_sets, quote_ident(r.column_name) || ' = ''false''');
      end if;

    elsif r.column_name in ('status_code', 'status') then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      v_exprs := array_append(v_exprs, '''active''');
      v_sets := array_append(v_sets, quote_ident(r.column_name) || ' = ''active''');

    elsif r.column_name in ('is_active', 'active_flag') then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      if r.udt_name = 'bool' then
        v_exprs := array_append(v_exprs, 'true');
        v_sets := array_append(v_sets, quote_ident(r.column_name) || ' = true');
      else
        v_exprs := array_append(v_exprs, '''true''');
        v_sets := array_append(v_sets, quote_ident(r.column_name) || ' = ''true''');
      end if;

    elsif r.column_name in ('created_at', 'created_on') then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      v_exprs := array_append(v_exprs, 'now()');

    elsif r.column_name in ('updated_at', 'updated_on') then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      v_exprs := array_append(v_exprs, 'now()');
      v_sets := array_append(v_sets, quote_ident(r.column_name) || ' = now()');

    elsif r.column_name in ('created_by_app', 'updated_by_app', 'source_app') then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      v_exprs := array_append(v_exprs, '''AICompanyManager UI save route''');
      v_sets := array_append(v_sets, quote_ident(r.column_name) || ' = ''AICompanyManager UI save route''');

    elsif r.is_nullable = 'NO' and r.column_default is null then
      raise exception 'unsupported_required_column_for_ui_save_route: %', r.column_name;
    end if;
  end loop;

  if array_length(v_sets, 1) is null then
    raise exception 'no_update_columns_for_company_robot_placement';
  end if;

  v_where := format('%I = $1 and %I = $2 and %I = $4 and case when $2 = ''company'' then true else %I = $3 end',
    v_company_col, v_target_level_col, v_role_col, v_target_id_col
  );

  v_update_sql := 'update business.company_robot_placement set ' || array_to_string(v_sets, ', ') || ' where ' || v_where;

  execute v_update_sql
    using v_company_id, v_target_level, v_target_id, v_role_code, v_robot_pool_id, v_exact_model_code, v_display_name, coalesce(nullif(v_payload_nickname, ''), v_display_name);

  get diagnostics v_updated = row_count;

  if v_updated = 0 then
    v_insert_sql :=
      'insert into business.company_robot_placement (' || array_to_string(v_cols, ', ') || ') values (' || array_to_string(v_exprs, ', ') || ')';

    execute v_insert_sql
      using v_company_id, v_target_level, v_target_id, v_role_code, v_robot_pool_id, v_exact_model_code, v_display_name, coalesce(nullif(v_payload_nickname, ''), v_display_name);

    get diagnostics v_inserted = row_count;
  end if;

  if v_updated = 0 and v_inserted = 0 then
    raise exception 'save_route_no_row_changed';
  end if;

  raise notice 'AICM_UI_SAVE_ROUTE_CHANGED updated=% inserted=% role=% model=% display=%',
    v_updated, v_inserted, v_role_code, v_exact_model_code, v_display_name;
end $$;

select jsonb_pretty(jsonb_build_object(
  'result', 'OK',
  'rollback_only', ${rollbackOnly ? "true" : "false"},
  'message', 'company_robot_placement save route executed'
)) as result;

${rollbackOnly ? "rollback;" : "commit;"}
`;
}

function runPsql(payload, rollbackOnly) {
  if (!DATABASE_URL) {
    return {
      ok: false,
      code: 99,
      stdout: "",
      stderr: "PERSONA_DATABASE_URL is not set"
    };
  }

  const sql = makeSql(payload, rollbackOnly);
  const result = spawnSync("psql", [DATABASE_URL, "-X", "-v", "ON_ERROR_STOP=1"], {
    input: sql,
    encoding: "utf8",
    timeout: 20000,
    maxBuffer: 1024 * 1024 * 4
  });

  return {
    ok: result.status === 0,
    code: result.status,
    stdout: result.stdout || "",
    stderr: result.stderr || ""
  };
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "GET" && req.url === "/api/aicm/company-robot-placement/health") {
      return sendJson(res, 200, {
        ok: true,
        service: "AICM_COMPANY_ROBOT_PLACEMENT_WRITE_API_V1",
        database_url_present: !!DATABASE_URL,
        port: PORT
      });
    }

    if (req.method === "POST" && req.url && req.url.startsWith("/api/aicm/company-robot-placement/save")) {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      const rollbackOnly = !!body.rollback_only || req.url.includes("rollback_only=1");
      const payload = body.payload || body;

      const psqlResult = runPsql(payload, rollbackOnly);

      return sendJson(res, psqlResult.ok ? 200 : 400, {
        ok: psqlResult.ok,
        rollback_only: rollbackOnly,
        psql_code: psqlResult.code,
        stdout: psqlResult.stdout,
        stderr: psqlResult.stderr
      });
    }

    return sendJson(res, 404, {
      ok: false,
      error: "not_found",
      path: req.url
    });
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      error: String(error && error.message ? error.message : error)
    });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("AICM company robot placement write API listening on http://127.0.0.1:" + PORT);
});
