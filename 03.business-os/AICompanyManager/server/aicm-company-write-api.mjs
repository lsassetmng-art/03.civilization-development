/* AICM_COMPANY_WRITE_API_V1 */
import http from "node:http";
import { spawnSync } from "node:child_process";

const PORT = Number(process.env.AICM_COMPANY_WRITE_API_PORT || "8796");
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
  const json = JSON.stringify(payload || {});
  const tag = "$aicm_company_payload_" + Date.now() + "_" + Math.random().toString(16).slice(2) + "$";

  if (json.includes(tag)) throw new Error("payload_delimiter_collision");

  return `
\\set ON_ERROR_STOP on
begin;

create temp table aicm_company_payload(j jsonb) on commit drop;
insert into aicm_company_payload(j) values (${tag}${json}${tag}::jsonb);

do $$
declare
  p jsonb;

  v_company_id_input text;
  v_company_id uuid;
  v_company_name text;
  v_business_domain text;
  v_operation text;

  v_table text;
  v_id_col text;
  v_name_col text;
  v_domain_col text;
  v_status_col text;

  r record;
  v_cols text[] := array[]::text[];
  v_exprs text[] := array[]::text[];
  v_sets text[] := array[]::text[];
  v_exists boolean := false;
  v_sql text;
  v_inserted int := 0;
  v_updated int := 0;
begin
  select j into p from aicm_company_payload limit 1;

  v_operation := trim(coalesce(p->>'operation', 'company.save'));
  v_company_id_input := trim(coalesce(p->>'company_id', p->>'company_id_input', ''));
  v_company_name := trim(coalesce(p->>'company_name', p->>'name', p->>'display_name', ''));
  v_business_domain := trim(coalesce(p->>'business_domain', p->>'business_area', p->>'business_description', p->>'description', ''));

  if v_company_name = '' then
    raise exception 'company_name_required';
  end if;

  if v_company_id_input ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    v_company_id := v_company_id_input::uuid;
  else
    v_company_id := ('00000000-0000-4000-8000-' || substr(md5(clock_timestamp()::text || random()::text || v_company_name), 1, 12))::uuid;
  end if;

  with table_candidates as (
    select
      c.table_name,
      max(case when c.column_name in ('company_id','business_company_id','ai_company_id','id') then c.column_name end) as id_col,
      max(case when c.column_name in ('company_name','name','display_name','legal_name','title') then c.column_name end) as name_col,
      max(case when c.column_name in ('business_domain','business_area','business_description','description','industry','domain','business_field') then c.column_name end) as domain_col,
      max(case when c.column_name in ('status_code','status') then c.column_name end) as status_col
    from information_schema.columns c
    where c.table_schema = 'business'
      and (
        c.table_name in ('company','companies','ai_company','ai_companies','business_company','company_master','aicm_company')
        or c.table_name ilike '%company%'
      )
    group by c.table_name
  )
  select table_name, id_col, name_col, domain_col, status_col
    into v_table, v_id_col, v_name_col, v_domain_col, v_status_col
  from table_candidates
  where id_col is not null
    and name_col is not null
  order by
    case table_name
      when 'company' then 1
      when 'business_company' then 2
      when 'ai_company' then 3
      when 'company_master' then 4
      else 9
    end,
    table_name
  limit 1;

  if v_table is null then
    raise exception 'business_company_table_not_found';
  end if;

  v_sql := format('select exists(select 1 from business.%I where %I = $1)', v_table, v_id_col);
  execute v_sql using v_company_id into v_exists;

  for r in
    select column_name, udt_name, data_type, column_default, is_nullable
    from information_schema.columns
    where table_schema = 'business'
      and table_name = v_table
    order by ordinal_position
  loop
    if r.column_name = v_id_col then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      if r.udt_name = 'uuid' then
        v_exprs := array_append(v_exprs, '$1');
      else
        v_exprs := array_append(v_exprs, '$1::text');
      end if;

    elsif r.column_name = v_name_col then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      v_exprs := array_append(v_exprs, '$2');
      v_sets := array_append(v_sets, quote_ident(r.column_name) || ' = $2');

    elsif v_domain_col is not null and r.column_name = v_domain_col then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      v_exprs := array_append(v_exprs, '$3');
      v_sets := array_append(v_sets, quote_ident(r.column_name) || ' = $3');

    elsif v_status_col is not null and r.column_name = v_status_col then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      v_exprs := array_append(v_exprs, '''active''');
      v_sets := array_append(v_sets, quote_ident(r.column_name) || ' = ''active''');

    elsif r.column_name in ('created_at','created_on','registered_at') then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      v_exprs := array_append(v_exprs, 'now()');

    elsif r.column_name in ('updated_at','updated_on','modified_at') then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      v_exprs := array_append(v_exprs, 'now()');
      v_sets := array_append(v_sets, quote_ident(r.column_name) || ' = now()');

    elsif r.column_name in ('created_by_app','updated_by_app','source_app') then
      v_cols := array_append(v_cols, quote_ident(r.column_name));
      v_exprs := array_append(v_exprs, '''AICompanyManager company save route''');
      v_sets := array_append(v_sets, quote_ident(r.column_name) || ' = ''AICompanyManager company save route''');

    elsif r.is_nullable = 'NO' and r.column_default is null then
      if r.udt_name = 'uuid' then
        v_cols := array_append(v_cols, quote_ident(r.column_name));
        v_exprs := array_append(v_exprs, '(''00000000-0000-4000-8000-'' || substr(md5(clock_timestamp()::text || random()::text || ' || quote_literal(r.column_name) || '), 1, 12))::uuid');
      elsif r.udt_name in ('text','varchar','bpchar') or r.data_type ilike '%char%' then
        v_cols := array_append(v_cols, quote_ident(r.column_name));
        v_exprs := array_append(v_exprs, '''''');
      elsif r.udt_name = 'bool' then
        v_cols := array_append(v_cols, quote_ident(r.column_name));
        v_exprs := array_append(v_exprs, 'true');
      elsif r.udt_name in ('int2','int4','int8','numeric','float4','float8') then
        v_cols := array_append(v_cols, quote_ident(r.column_name));
        v_exprs := array_append(v_exprs, '0');
      elsif r.udt_name in ('json','jsonb') then
        v_cols := array_append(v_cols, quote_ident(r.column_name));
        v_exprs := array_append(v_exprs, '''{}''::' || r.udt_name);
      elsif r.data_type ilike '%timestamp%' or r.data_type = 'date' then
        v_cols := array_append(v_cols, quote_ident(r.column_name));
        v_exprs := array_append(v_exprs, 'now()');
      else
        raise exception 'unsupported_required_company_column: %.%', v_table, r.column_name;
      end if;
    end if;
  end loop;

  if v_exists then
    if array_length(v_sets, 1) is null then
      raise exception 'no_update_columns_for_company_table: %', v_table;
    end if;

    v_sql := format(
      'update business.%I set %s where %I = $1',
      v_table,
      array_to_string(v_sets, ', '),
      v_id_col
    );

    execute v_sql using v_company_id, v_company_name, v_business_domain;
    get diagnostics v_updated = row_count;
  else
    v_sql := format(
      'insert into business.%I (%s) values (%s)',
      v_table,
      array_to_string(v_cols, ', '),
      array_to_string(v_exprs, ', ')
    );

    execute v_sql using v_company_id, v_company_name, v_business_domain;
    get diagnostics v_inserted = row_count;
  end if;

  if v_inserted = 0 and v_updated = 0 then
    raise exception 'company_save_no_row_changed';
  end if;

  create temp table aicm_company_save_result(result jsonb) on commit drop;
  insert into aicm_company_save_result(result)
  values (
    jsonb_build_object(
      'result', 'OK',
      'operation', v_operation,
      'rollback_only', ${rollbackOnly ? "true" : "false"},
      'company_table', v_table,
      'company_id_column', v_id_col,
      'company_name_column', v_name_col,
      'business_domain_column', coalesce(v_domain_col, ''),
      'company_id', v_company_id::text,
      'company_name', v_company_name,
      'business_domain', v_business_domain,
      'inserted', v_inserted,
      'updated', v_updated
    )
  );

  raise notice 'AICM_COMPANY_SAVE_RESULT table=% company_id=% inserted=% updated=%',
    v_table, v_company_id, v_inserted, v_updated;
end $$;

select jsonb_pretty(result) as aicm_company_save_result
from aicm_company_save_result;

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

    if (req.method === "GET" && req.url === "/api/aicm/company/health") {
      return sendJson(res, 200, {
        ok: true,
        service: "AICM_COMPANY_WRITE_API_V1",
        database_url_present: !!DATABASE_URL,
        port: PORT
      });
    }

    if (req.method === "POST" && req.url && req.url.startsWith("/api/aicm/company/save")) {
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
  console.log("AICM company write API listening on http://127.0.0.1:" + PORT);
});
