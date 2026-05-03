import fs from 'node:fs';

const serverPath = process.argv[2];
const patchLog = process.argv[3];

let src = fs.readFileSync(serverPath, 'utf8');
const marker = 'AICM_R8Z_V8C_CONTEXT_REVIEW_WAIT_ITEMS_EXPOSURE';

const log = [];

if (src.includes(marker)) {
  log.push('SKIP: marker already exists');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(0);
}

const helper = `

// ${marker}: helper begin
async function aicmR8zV8cGetPgPool() {
  if (globalThis.__aicmR8zV8cPgPool) return globalThis.__aicmR8zV8cPgPool;

  const connectionString = process.env.PERSONA_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('PERSONA_DATABASE_URL is not set for R8Z-V8C review_wait_items exposure');
  }

  const pgModule = await import('pg');
  const Pool = pgModule.Pool || pgModule.default?.Pool;
  if (!Pool) throw new Error('pg Pool not available');

  globalThis.__aicmR8zV8cPgPool = new Pool({ connectionString });
  return globalThis.__aicmR8zV8cPgPool;
}

function aicmR8zV8cQuoteIdent(value) {
  return '"' + String(value).replace(/"/g, '""') + '"';
}

function aicmR8zV8cPick(row, keys) {
  for (const key of keys) {
    if (row && row[key] !== undefined && row[key] !== null && String(row[key]).length > 0) return row[key];
  }
  return null;
}

function aicmR8zV8cStringifyBrief(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value); } catch { return String(value); }
}

function aicmR8zV8cNormalizeReviewItem(row, sourceRelation) {
  const sourceId = aicmR8zV8cPick(row, [
    'human_review_id',
    'review_id',
    'review_item_id',
    'id',
    'worker_work_unit_id',
    'work_unit_id',
    'deliverable_requirement_id'
  ]);

  const taskName = aicmR8zV8cPick(row, [
    'task_name',
    'work_unit_name',
    'deliverable_name',
    'requirement_title',
    'name'
  ]);

  const explicitTitle = aicmR8zV8cPick(row, [
    'title',
    'review_title',
    'display_title',
    'summary_title'
  ]);

  const fallbackTitle = taskName
    ? '納品サマリー確認: ' + String(taskName)
    : '納品サマリー確認: ' + String(sourceId || sourceRelation || 'review item');

  const title = explicitTitle || fallbackTitle;

  const summaryText = aicmR8zV8cPick(row, [
    'result_summary_text',
    'summary_text',
    'delivery_summary_text',
    'review_summary_text',
    'description',
    'note',
    'memo'
  ]);

  const requestId = aicmR8zV8cPick(row, [
    'request_id',
    'aiworker_request_id',
    'runtime_request_id',
    'external_request_id'
  ]);

  const reviewStatus = aicmR8zV8cPick(row, [
    'review_status_code',
    'approval_status_code',
    'status_code',
    'status'
  ]) || 'waiting';

  const deliverySummary = row.delivery_summary || row.delivery_summary_json || row.delivery_package || null;

  return {
    id: String(sourceId || requestId || title),
    review_item_id: String(sourceId || requestId || title),
    source_id: sourceId,
    source_relation: sourceRelation,
    source_table: sourceRelation,
    request_id: requestId,
    aiworker_request_id: requestId,
    company_id: row.company_id || null,
    owner_id: row.owner_id || null,
    title,
    review_title: title,
    display_title: title,
    summary_title: title,
    task_name: taskName,
    deliverable_name: row.deliverable_name || null,
    status_code: reviewStatus,
    review_status_code: reviewStatus === 'pending' ? 'waiting' : reviewStatus,
    approval_status_code: reviewStatus === 'pending' ? 'waiting' : reviewStatus,
    result_summary_text: summaryText || aicmR8zV8cStringifyBrief(deliverySummary).slice(0, 1200),
    summary_text: summaryText || aicmR8zV8cStringifyBrief(deliverySummary).slice(0, 1200),
    delivery_summary: deliverySummary,
    delivery_package: row.delivery_package || null,
    raw: row
  };
}

function aicmR8zV8cLooksWaiting(row) {
  const statusText = [
    row.review_status_code,
    row.approval_status_code,
    row.status_code,
    row.status,
    row.work_status_code
  ].map(v => String(v || '').toLowerCase()).join(' ');

  if (!statusText.trim()) return true;

  return /waiting|pending|review_waiting|required|requested|in_review|review/.test(statusText);
}

async function aicmR8zV8cLoadReviewWaitItemsDirect(req) {
  const query = req?.query || {};
  const ownerId = query.owner_id || query.ownerId || query.owner || '00000000-0000-4000-8000-000000000001';
  const companyId = query.company_id || query.companyId || query.company || query.selectedCompanyId;

  if (!companyId) return [];

  const pool = await aicmR8zV8cGetPgPool();

  const relResult = await pool.query(
    \`
    select
      t.table_schema,
      t.table_name,
      t.table_type
    from information_schema.tables t
    where t.table_schema = 'business'
      and (
        t.table_name ilike '%review%'
        or t.table_name ilike '%human%'
        or t.table_name ilike '%delivery%'
        or t.table_name ilike '%approval%'
        or t.table_name ilike '%wait%'
        or t.table_name ilike '%pmlw%'
        or t.table_name ilike '%worker%'
        or t.table_name ilike '%work_unit%'
        or t.table_name ilike '%deliverable%'
      )
    order by
      case
        when t.table_name ilike '%review%' then 1
        when t.table_name ilike '%wait%' then 2
        when t.table_name ilike '%delivery%' then 3
        when t.table_name ilike '%pmlw_worker%' then 4
        else 9
      end,
      t.table_name
    limit 80
    \`
  );

  const output = [];
  const seen = new Set();

  for (const rel of relResult.rows) {
    const schema = rel.table_schema;
    const table = rel.table_name;
    const relationName = schema + '.' + table;

    const colResult = await pool.query(
      \`
      select column_name
      from information_schema.columns
      where table_schema = $1
        and table_name = $2
      order by ordinal_position
      \`,
      [schema, table]
    );

    const columns = colResult.rows.map(r => r.column_name);
    const colSet = new Set(columns);

    const hasCompany = colSet.has('company_id');
    const hasOwner = colSet.has('owner_id');

    if (!hasCompany) continue;

    const where = [];
    const params = [];
    params.push(String(companyId));
    where.push(aicmR8zV8cQuoteIdent('company_id') + '::text = $' + params.length);

    if (hasOwner) {
      params.push(String(ownerId));
      where.push(aicmR8zV8cQuoteIdent('owner_id') + '::text = $' + params.length);
    }

    const statusCols = [
      'review_status_code',
      'approval_status_code',
      'status_code',
      'status',
      'work_status_code'
    ].filter(c => colSet.has(c));

    if (statusCols.length > 0) {
      const statusFilter = statusCols.map(c =>
        \`lower(\${aicmR8zV8cQuoteIdent(c)}::text) in ('waiting','pending','review_waiting','required','requested','in_review','review')\`
      ).join(' or ');
      where.push('(' + statusFilter + ')');
    }

    const orderCol = colSet.has('updated_at')
      ? 'updated_at'
      : (colSet.has('created_at') ? 'created_at' : null);

    const orderSql = orderCol
      ? ' order by ' + aicmR8zV8cQuoteIdent(orderCol) + ' desc nulls last'
      : '';

    const sql =
      'select row_to_json(t) as row_data from (select * from ' +
      aicmR8zV8cQuoteIdent(schema) + '.' + aicmR8zV8cQuoteIdent(table) +
      ' where ' + where.join(' and ') +
      orderSql +
      ' limit 50) t';

    let rows = [];
    try {
      const r = await pool.query(sql, params);
      rows = r.rows.map(x => x.row_data).filter(Boolean);
    } catch (error) {
      continue;
    }

    for (const row of rows) {
      if (!aicmR8zV8cLooksWaiting(row)) continue;

      const item = aicmR8zV8cNormalizeReviewItem(row, relationName);
      const key = String(item.source_relation || '') + '|' + String(item.source_id || item.request_id || item.title || '');
      if (seen.has(key)) continue;
      seen.add(key);
      output.push(item);

      if (output.length >= 50) return output;
    }
  }

  return output;
}

function aicmR8zV8cAttachReviewWaitItems(payload, items) {
  if (!payload || typeof payload !== 'object') return payload;
  if (!Array.isArray(items)) return payload;

  payload.review_wait_items = items;

  if (!payload.context || typeof payload.context !== 'object') payload.context = {};
  payload.context.review_wait_items = items;

  if (!payload.data || typeof payload.data !== 'object') payload.data = {};
  payload.data.review_wait_items = items;

  payload.r8z_v8c_review_wait_items_count = items.length;
  payload.r8z_v8c_review_wait_items_source = 'server_context_direct_db_exposure';

  return payload;
}
// ${marker}: helper end
`;

const routeRegex = /(app\.(?:get|all)\(\s*['"]\\/api\\/aicm\\/v2\\/context['"][\\s\\S]{0,600}?=>\s*\\{)/m;
const match = src.match(routeRegex);

if (!match) {
  log.push('ERROR: Express-style /api/aicm/v2/context route pattern not found');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(2);
}

const routeInsert = `
  // ${marker}: route wrapper begin
  {
    const __aicmR8zV8cOriginalJson = res.json.bind(res);
    res.json = async function aicmR8zV8cJsonWithReviewWaitItems(payload) {
      try {
        const __aicmR8zV8cItems = await aicmR8zV8cLoadReviewWaitItemsDirect(req);
        aicmR8zV8cAttachReviewWaitItems(payload, __aicmR8zV8cItems);
      } catch (error) {
        if (payload && typeof payload === 'object') {
          payload.r8z_v8c_review_wait_items_error = String(error && error.message ? error.message : error);
        }
      }
      return __aicmR8zV8cOriginalJson(payload);
    };
  }
  // ${marker}: route wrapper end
`;

const helperInsertPos = match.index;
src = src.slice(0, helperInsertPos) + helper + '\n' + src.slice(helperInsertPos);

const afterHelperRouteIndex = src.indexOf(match[0], helperInsertPos + helper.length);
if (afterHelperRouteIndex < 0) {
  log.push('ERROR: route location lost after helper insert');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(3);
}

const routeOpenEnd = afterHelperRouteIndex + match[0].length;
src = src.slice(0, routeOpenEnd) + routeInsert + src.slice(routeOpenEnd);

fs.writeFileSync(serverPath, src, 'utf8');
log.push('PATCH_APPLIED: inserted helper and context route res.json wrapper');
fs.writeFileSync(patchLog, log.join('\n') + '\n');
