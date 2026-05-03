import fs from 'node:fs';

const serverPath = process.argv[2];
const patchLog = process.argv[3];

const marker = 'AICM_R8Z_V8E_SAFE_CUSTOM_HTTP_CONTEXT_REVIEW_WAIT_ITEMS_EXPOSURE';
const log = [];

let src = fs.readFileSync(serverPath, 'utf8');

if (src.includes(marker)) {
  log.push('SKIP: marker already exists');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(0);
}

function lineStartOf(text, pos) {
  const p = text.lastIndexOf('\n', pos);
  return p < 0 ? 0 : p + 1;
}

function lineEndOf(text, pos) {
  const p = text.indexOf('\n', pos);
  return p < 0 ? text.length : p;
}

function safeHelperInsertPosition(text) {
  const createServerMatch = text.match(/\b(?:createServer|http\.createServer)\s*\(/m);
  if (createServerMatch && createServerMatch.index !== undefined) {
    return lineStartOf(text, createServerMatch.index);
  }

  const lines = text.split(/\r?\n/);
  let offset = 0;
  let lastImportEnd = 0;

  for (const line of lines) {
    const nextOffset = offset + line.length + 1;
    if (/^\s*import\s+/.test(line)) {
      lastImportEnd = nextOffset;
    }
    offset = nextOffset;
  }

  if (lastImportEnd > 0) return lastImportEnd;

  return 0;
}

function inferReqRes(text, literalPos) {
  const before = text.slice(Math.max(0, literalPos - 5000), literalPos + 1000);

  const createServerArgs =
    before.match(/\b(?:createServer|http\.createServer)\s*\(\s*(?:async\s*)?\(?\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)/m);

  if (createServerArgs) {
    return { reqName: createServerArgs[1], resName: createServerArgs[2] };
  }

  if (/\breq\b/.test(before) && /\bres\b/.test(before)) {
    return { reqName: 'req', resName: 'res' };
  }

  if (/\brequest\b/.test(before) && /\bresponse\b/.test(before)) {
    return { reqName: 'request', resName: 'response' };
  }

  return { reqName: 'req', resName: 'res' };
}

function findContextLiteral(text) {
  for (const literal of [
    '/api/aicm/v2/context',
    'api/aicm/v2/context',
    'v2/context'
  ]) {
    const pos = text.indexOf(literal);
    if (pos >= 0) return { literal, pos };
  }

  return { literal: '', pos: -1 };
}

function findRouteInstallPosition(text, literalPos) {
  const lineStart = lineStartOf(text, literalPos);
  const lineEnd = lineEndOf(text, literalPos);
  const line = text.slice(lineStart, lineEnd);

  if (/^\s*case\s+/.test(line)) {
    return {
      pos: lineEnd + 1,
      mode: 'case_next_line',
      indent: (line.match(/^\s*/) || [''])[0] + '  '
    };
  }

  const openSearchEnd = Math.min(text.length, lineEnd + 900);
  const openBrace = text.indexOf('{', literalPos);

  if (openBrace >= 0 && openBrace < openSearchEnd) {
    const branchLineStart = lineStartOf(text, openBrace);
    const branchLine = text.slice(branchLineStart, lineEndOf(text, openBrace));
    return {
      pos: openBrace + 1,
      mode: 'after_open_brace',
      indent: (branchLine.match(/^\s*/) || [''])[0] + '  '
    };
  }

  return {
    pos: lineEnd + 1,
    mode: 'after_literal_line_fallback',
    indent: (line.match(/^\s*/) || [''])[0] + '  '
  };
}

const helper = `

// ${marker}: helper begin
async function aicmR8zV8eGetPgPool() {
  if (globalThis.__aicmR8zV8ePgPool) return globalThis.__aicmR8zV8ePgPool;

  const connectionString = process.env.PERSONA_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error('PERSONA_DATABASE_URL is not set');

  const pgModule = await import('pg');
  const Pool = pgModule.Pool || (pgModule.default && pgModule.default.Pool);
  if (!Pool) throw new Error('pg Pool not available');

  globalThis.__aicmR8zV8ePgPool = new Pool({ connectionString });
  return globalThis.__aicmR8zV8ePgPool;
}

function aicmR8zV8eQuoteIdent(value) {
  return '"' + String(value).replace(/"/g, '""') + '"';
}

function aicmR8zV8ePick(row, keys) {
  for (const key of keys) {
    if (row && row[key] !== undefined && row[key] !== null && String(row[key]).length > 0) return row[key];
  }
  return null;
}

function aicmR8zV8eText(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value); } catch { return String(value); }
}

function aicmR8zV8eGetContextQuery(req) {
  try {
    const u = new URL(req.url || '', 'http://127.0.0.1');
    return {
      ownerId: u.searchParams.get('owner_id') || u.searchParams.get('ownerId') || u.searchParams.get('owner') || '00000000-0000-4000-8000-000000000001',
      companyId: u.searchParams.get('company_id') || u.searchParams.get('companyId') || u.searchParams.get('company') || u.searchParams.get('selectedCompanyId')
    };
  } catch {
    return {
      ownerId: '00000000-0000-4000-8000-000000000001',
      companyId: null
    };
  }
}

function aicmR8zV8eIsNonTerminal(row) {
  const values = [
    row.review_status_code,
    row.approval_status_code,
    row.status_code,
    row.status,
    row.work_status_code
  ].filter(v => v !== undefined && v !== null).map(v => String(v).toLowerCase());

  if (values.length === 0) return true;

  const terminal = new Set([
    'approved',
    'accepted',
    'rejected',
    'declined',
    'done',
    'completed',
    'complete',
    'cancelled',
    'canceled',
    'archived',
    'closed'
  ]);

  return values.every(v => !terminal.has(v));
}

function aicmR8zV8eIsReviewRelated(row, relationName) {
  const text = relationName + ' ' + aicmR8zV8eText(row);
  return /review|human|delivery|summary|result_summary|delivery_package|delivery_summary|review_waiting|waiting|pending|納品|サマリー|承認|レビュー|AI企業|Manager大項目|request_id|aiworker_request_id/i.test(text);
}

function aicmR8zV8eNormalizeReviewItem(row, sourceRelation) {
  const sourceId = aicmR8zV8ePick(row, [
    'human_review_id',
    'review_id',
    'review_item_id',
    'id',
    'worker_work_unit_id',
    'work_unit_id',
    'pmlw_worker_work_unit_id',
    'deliverable_requirement_id'
  ]);

  const requestId = aicmR8zV8ePick(row, [
    'request_id',
    'aiworker_request_id',
    'runtime_request_id',
    'external_request_id'
  ]);

  const taskName = aicmR8zV8ePick(row, [
    'task_name',
    'worker_task_name',
    'work_unit_name',
    'work_name',
    'deliverable_name',
    'requirement_title',
    'name'
  ]);

  const explicitTitle = aicmR8zV8ePick(row, [
    'title',
    'review_title',
    'display_title',
    'summary_title'
  ]);

  const title = explicitTitle || (
    taskName
      ? '納品サマリー確認: ' + String(taskName)
      : '納品サマリー確認: ' + String(sourceId || requestId || sourceRelation || 'review item')
  );

  const summaryText = aicmR8zV8ePick(row, [
    'result_summary_text',
    'summary_text',
    'delivery_summary_text',
    'review_summary_text',
    'description',
    'note',
    'memo'
  ]);

  const deliverySummary = row.delivery_summary || row.delivery_summary_json || null;
  const deliveryPackage = row.delivery_package || row.delivery_package_json || null;

  const statusRaw = aicmR8zV8ePick(row, [
    'review_status_code',
    'approval_status_code',
    'status_code',
    'status'
  ]) || 'waiting';

  const normalizedStatus = String(statusRaw).toLowerCase() === 'pending'
    ? 'waiting'
    : String(statusRaw || 'waiting');

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
    status_code: normalizedStatus,
    review_status_code: normalizedStatus,
    approval_status_code: normalizedStatus,
    result_summary_text: summaryText || aicmR8zV8eText(deliverySummary || deliveryPackage).slice(0, 1200),
    summary_text: summaryText || aicmR8zV8eText(deliverySummary || deliveryPackage).slice(0, 1200),
    delivery_summary: deliverySummary,
    delivery_package: deliveryPackage,
    raw: row
  };
}

async function aicmR8zV8eCandidateRelations(pool) {
  const sql =
    "select table_schema, table_name " +
    "from information_schema.tables " +
    "where table_schema = 'business' " +
    "and (" +
    "table_name ilike '%review%' or " +
    "table_name ilike '%human%' or " +
    "table_name ilike '%delivery%' or " +
    "table_name ilike '%approval%' or " +
    "table_name ilike '%wait%' or " +
    "table_name ilike '%pmlw%' or " +
    "table_name ilike '%worker%' or " +
    "table_name ilike '%work_unit%' or " +
    "table_name ilike '%deliverable%'" +
    ") " +
    "order by " +
    "case " +
    "when table_name ilike '%review%' then 1 " +
    "when table_name ilike '%wait%' then 2 " +
    "when table_name ilike '%delivery%' then 3 " +
    "when table_name ilike '%pmlw_worker%' then 4 " +
    "else 9 end, table_name " +
    "limit 120";

  const r = await pool.query(sql);
  return r.rows.map(x => ({ schema: x.table_schema, table: x.table_name, relation: x.table_schema + '.' + x.table_name }));
}

async function aicmR8zV8eLoadReviewWaitItems(req) {
  const q = aicmR8zV8eGetContextQuery(req);
  if (!q.companyId) return [];

  const pool = await aicmR8zV8eGetPgPool();
  const rels = await aicmR8zV8eCandidateRelations(pool);
  const output = [];
  const seen = new Set();

  for (const rel of rels) {
    const colResult = await pool.query(
      "select column_name from information_schema.columns where table_schema = $1 and table_name = $2 order by ordinal_position",
      [rel.schema, rel.table]
    );

    const columns = colResult.rows.map(r => r.column_name);
    const colSet = new Set(columns);

    if (!colSet.has('company_id')) continue;

    const where = [];
    const params = [];

    params.push(String(q.companyId));
    where.push(aicmR8zV8eQuoteIdent('company_id') + '::text = $' + params.length);

    if (colSet.has('owner_id')) {
      params.push(String(q.ownerId));
      where.push(aicmR8zV8eQuoteIdent('owner_id') + '::text = $' + params.length);
    }

    const statusCols = [
      'review_status_code',
      'approval_status_code',
      'status_code',
      'status',
      'work_status_code'
    ].filter(c => colSet.has(c));

    for (const col of statusCols) {
      where.push(
        "coalesce(lower(" + aicmR8zV8eQuoteIdent(col) + "::text), '') not in ('approved','accepted','rejected','declined','done','completed','complete','cancelled','canceled','archived','closed')"
      );
    }

    const orderCol = colSet.has('updated_at') ? 'updated_at' : (colSet.has('created_at') ? 'created_at' : null);
    const orderSql = orderCol ? ' order by ' + aicmR8zV8eQuoteIdent(orderCol) + ' desc nulls last' : '';

    const sql =
      'select row_to_json(t) as row_data from (select * from ' +
      aicmR8zV8eQuoteIdent(rel.schema) + '.' + aicmR8zV8eQuoteIdent(rel.table) +
      ' where ' + where.join(' and ') +
      orderSql +
      ' limit 80) t';

    let rows = [];
    try {
      const r = await pool.query(sql, params);
      rows = r.rows.map(x => x.row_data).filter(Boolean);
    } catch {
      continue;
    }

    for (const row of rows) {
      if (!aicmR8zV8eIsNonTerminal(row)) continue;
      if (!aicmR8zV8eIsReviewRelated(row, rel.relation)) continue;

      const item = aicmR8zV8eNormalizeReviewItem(row, rel.relation);
      const key = String(item.source_relation || '') + '|' + String(item.source_id || item.request_id || item.title || '');
      if (seen.has(key)) continue;

      seen.add(key);
      output.push(item);

      if (output.length >= 50) return output;
    }
  }

  return output;
}

function aicmR8zV8eAttachReviewWaitItems(payload, items) {
  if (!payload || typeof payload !== 'object') return payload;

  const list = Array.isArray(items) ? items : [];

  payload.review_wait_items = list;

  if (!payload.context || typeof payload.context !== 'object') payload.context = {};
  payload.context.review_wait_items = list;

  if (!payload.data || typeof payload.data !== 'object') payload.data = {};
  payload.data.review_wait_items = list;

  payload.r8z_v8e_review_wait_items_count = list.length;
  payload.r8z_v8e_review_wait_items_source = 'safe_custom_http_context_response_interceptor';

  return payload;
}

function aicmR8zV8eStripContentLengthHeader(args) {
  for (let i = 0; i < args.length; i++) {
    const v = args[i];
    if (!v || typeof v !== 'object' || Array.isArray(v)) continue;

    for (const k of Object.keys(v)) {
      if (String(k).toLowerCase() === 'content-length') delete v[k];
    }
  }

  return args;
}

function aicmR8zV8eInstallContextResponseInterceptor(req, res) {
  if (!res || res.__aicmR8zV8eInstalled) return;
  res.__aicmR8zV8eInstalled = true;

  const originalEnd = res.end.bind(res);
  const originalWriteHead = typeof res.writeHead === 'function' ? res.writeHead.bind(res) : null;

  if (originalWriteHead) {
    res.writeHead = function aicmR8zV8eWriteHeadWithoutFixedLength(...args) {
      return originalWriteHead(...aicmR8zV8eStripContentLengthHeader(args));
    };
  }

  res.end = function aicmR8zV8eEndWithReviewWaitItems(chunk, encoding, callback) {
    let enc = encoding;
    let cb = callback;

    if (typeof encoding === 'function') {
      cb = encoding;
      enc = undefined;
    }

    let called = false;

    const callOriginal = (finalChunk) => {
      if (called) return res;
      called = true;
      return originalEnd(finalChunk, enc, cb);
    };

    Promise.resolve()
      .then(async () => {
        if (chunk === undefined || chunk === null) {
          callOriginal(chunk);
          return;
        }

        const body = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
        const trimmed = body.trim();

        if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
          callOriginal(chunk);
          return;
        }

        const payload = JSON.parse(body);
        const items = await aicmR8zV8eLoadReviewWaitItems(req);
        aicmR8zV8eAttachReviewWaitItems(payload, items);

        try {
          if (typeof res.setHeader === 'function' && !res.headersSent) {
            res.setHeader('content-type', 'application/json; charset=utf-8');
            if (typeof res.removeHeader === 'function') res.removeHeader('content-length');
          }
        } catch {}

        callOriginal(JSON.stringify(payload));
      })
      .catch(() => {
        callOriginal(chunk);
      });

    return res;
  };
}
// ${marker}: helper end
`;

const helperPos = safeHelperInsertPosition(src);
src = src.slice(0, helperPos) + helper + '\n' + src.slice(helperPos);

const route = findContextLiteral(src);
if (route.pos < 0) {
  log.push('ERROR: context route literal not found after helper insertion');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(2);
}

const names = inferReqRes(src, route.pos);
const install = findRouteInstallPosition(src, route.pos);

const installLine =
  install.indent +
  '// ' + marker + ': install\\n' +
  install.indent +
  'aicmR8zV8eInstallContextResponseInterceptor(' + names.reqName + ', ' + names.resName + ');\\n';

src = src.slice(0, install.pos) + installLine + src.slice(install.pos);

fs.writeFileSync(serverPath, src, 'utf8');

log.push('PATCH_APPLIED: helper inserted at safe top-level position');
log.push('PATCH_APPLIED: route install line inserted');
log.push('HELPER_INSERT_POS=' + helperPos);
log.push('CONTEXT_LITERAL=' + route.literal);
log.push('ROUTE_INSTALL_MODE=' + install.mode);
log.push('REQ_NAME=' + names.reqName);
log.push('RES_NAME=' + names.resName);

fs.writeFileSync(patchLog, log.join('\n') + '\n');
