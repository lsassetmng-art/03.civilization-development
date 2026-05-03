import fs from 'node:fs';
import path from 'node:path';

const serverPath = process.argv[2];
const appRoot = process.argv[3];
const patchLog = process.argv[4];

const marker = 'AICM_R8Z_V8D_CUSTOM_HTTP_CONTEXT_REVIEW_WAIT_ITEMS_EXPOSURE';

const log = [];
let src = fs.readFileSync(serverPath, 'utf8');

if (src.includes(marker)) {
  log.push('SKIP: marker already exists');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(0);
}

function listLatestV8BRelations() {
  const metaDir = path.join(appRoot, '900.meta');
  let dirs = [];

  try {
    dirs = fs.readdirSync(metaDir)
      .filter(name => name.startsWith('r8z_v8b_db_view_id_direct_locate_'))
      .map(name => path.join(metaDir, name))
      .filter(p => fs.statSync(p).isDirectory())
      .sort()
      .reverse();
  } catch {
    return [];
  }

  const rels = [];

  for (const dir of dirs.slice(0, 3)) {
    for (const file of [
      '030_request_id_hit_scan.txt',
      '031_title_hit_scan.txt',
      '032_status_count_scan.txt',
      '022_known_relation_scan.txt'
    ]) {
      const p = path.join(dir, file);
      if (!fs.existsSync(p)) continue;

      const text = fs.readFileSync(p, 'utf8');
      const matches = text.match(/\b(?:business|aiworker|cx22073jw|public)\.[A-Za-z0-9_]+\b/g) || [];

      for (const m of matches) {
        if (!rels.includes(m)) rels.push(m);
      }
    }

    if (rels.length > 0) break;
  }

  return rels
    .filter(r => !/information_schema/i.test(r))
    .filter(r => /review|human|delivery|approval|wait|pmlw|worker|work_unit|deliverable/i.test(r))
    .slice(0, 12);
}

const sourceRelations = listLatestV8BRelations();

if (sourceRelations.length === 0) {
  log.push('ERROR: no source relations found from latest V8B reports');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(2);
}

log.push('SOURCE_RELATIONS=' + JSON.stringify(sourceRelations));

const literalCandidates = [
  '/api/aicm/v2/context',
  'api/aicm/v2/context',
  'v2/context'
];

let literal = '';
let literalPos = -1;

for (const candidate of literalCandidates) {
  const p = src.indexOf(candidate);
  if (p >= 0) {
    literal = candidate;
    literalPos = p;
    break;
  }
}

if (literalPos < 0) {
  log.push('ERROR: context route literal not found');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(3);
}

const nearby = src.slice(Math.max(0, literalPos - 900), Math.min(src.length, literalPos + 1300));

let reqName = '';
let resName = '';

if (/\breq\b/.test(nearby)) reqName = 'req';
else if (/\brequest\b/.test(nearby)) reqName = 'request';

if (/\bres\b/.test(nearby)) resName = 'res';
else if (/\bresponse\b/.test(nearby)) resName = 'response';

if (!reqName || !resName) {
  log.push('ERROR: could not infer req/res variable names near context route');
  log.push('nearby=' + nearby.slice(0, 1000));
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(4);
}

log.push(`INFERRED_REQ=${reqName}`);
log.push(`INFERRED_RES=${resName}`);

const openBracePos = src.indexOf('{', literalPos);
if (openBracePos < 0 || openBracePos - literalPos > 1200) {
  log.push('ERROR: could not locate route branch opening brace near context route');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(5);
}

const helper = `

// ${marker}: helper begin
const AICM_R8Z_V8D_REVIEW_SOURCE_RELATIONS = ${JSON.stringify(sourceRelations, null, 2)};

function aicmR8zV8dQuoteIdent(value) {
  return '"' + String(value).replace(/"/g, '""') + '"';
}

function aicmR8zV8dPick(row, keys) {
  for (const key of keys) {
    if (row && row[key] !== undefined && row[key] !== null && String(row[key]).length > 0) return row[key];
  }
  return null;
}

function aicmR8zV8dStringifyBrief(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value); } catch { return String(value); }
}

async function aicmR8zV8dGetPgPool() {
  if (globalThis.__aicmR8zV8dPgPool) return globalThis.__aicmR8zV8dPgPool;

  const connectionString = process.env.PERSONA_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error('PERSONA_DATABASE_URL is not set');

  const pgModule = await import('pg');
  const Pool = pgModule.Pool || pgModule.default?.Pool;
  if (!Pool) throw new Error('pg Pool not available');

  globalThis.__aicmR8zV8dPgPool = new Pool({ connectionString });
  return globalThis.__aicmR8zV8dPgPool;
}

function aicmR8zV8dGetContextQuery(req) {
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

function aicmR8zV8dLooksNonTerminal(row) {
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
    'cancelled',
    'canceled',
    'archived',
    'closed'
  ]);

  return values.every(v => !terminal.has(v));
}

function aicmR8zV8dLooksReviewRelated(row) {
  const text = aicmR8zV8dStringifyBrief(row);
  return /review|human|delivery|summary|result_summary|delivery_package|delivery_summary|review_waiting|waiting|pending|納品|サマリー|承認|レビュー|AI企業|Manager大項目/i.test(text);
}

function aicmR8zV8dNormalizeReviewItem(row, sourceRelation) {
  const sourceId = aicmR8zV8dPick(row, [
    'human_review_id',
    'review_id',
    'review_item_id',
    'id',
    'worker_work_unit_id',
    'work_unit_id',
    'pmlw_worker_work_unit_id',
    'deliverable_requirement_id'
  ]);

  const requestId = aicmR8zV8dPick(row, [
    'request_id',
    'aiworker_request_id',
    'runtime_request_id',
    'external_request_id'
  ]);

  const taskName = aicmR8zV8dPick(row, [
    'task_name',
    'worker_task_name',
    'work_unit_name',
    'work_name',
    'deliverable_name',
    'requirement_title',
    'name'
  ]);

  const explicitTitle = aicmR8zV8dPick(row, [
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

  const summaryText = aicmR8zV8dPick(row, [
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

  const statusRaw = aicmR8zV8dPick(row, [
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
    result_summary_text: summaryText || aicmR8zV8dStringifyBrief(deliverySummary || deliveryPackage).slice(0, 1200),
    summary_text: summaryText || aicmR8zV8dStringifyBrief(deliverySummary || deliveryPackage).slice(0, 1200),
    delivery_summary: deliverySummary,
    delivery_package: deliveryPackage,
    raw: row
  };
}

async function aicmR8zV8dLoadReviewWaitItems(req) {
  const { ownerId, companyId } = aicmR8zV8dGetContextQuery(req);
  if (!companyId) return [];

  const pool = await aicmR8zV8dGetPgPool();
  const output = [];
  const seen = new Set();

  for (const relationName of AICM_R8Z_V8D_REVIEW_SOURCE_RELATIONS) {
    const [schema, table] = String(relationName).split('.');
    if (!schema || !table) continue;

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

    if (!colSet.has('company_id')) continue;

    const where = [];
    const params = [];

    params.push(String(companyId));
    where.push(aicmR8zV8dQuoteIdent('company_id') + '::text = $' + params.length);

    if (colSet.has('owner_id')) {
      params.push(String(ownerId));
      where.push(aicmR8zV8dQuoteIdent('owner_id') + '::text = $' + params.length);
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
        \`coalesce(lower(\${aicmR8zV8dQuoteIdent(col)}::text), '') not in ('approved','accepted','rejected','declined','done','completed','cancelled','canceled','archived','closed')\`
      );
    }

    const orderCol = colSet.has('updated_at') ? 'updated_at' : (colSet.has('created_at') ? 'created_at' : null);
    const orderSql = orderCol ? ' order by ' + aicmR8zV8dQuoteIdent(orderCol) + ' desc nulls last' : '';

    const sql =
      'select row_to_json(t) as row_data from (select * from ' +
      aicmR8zV8dQuoteIdent(schema) + '.' + aicmR8zV8dQuoteIdent(table) +
      ' where ' + where.join(' and ') +
      orderSql +
      ' limit 50) t';

    let rows = [];
    try {
      const r = await pool.query(sql, params);
      rows = r.rows.map(x => x.row_data).filter(Boolean);
    } catch {
      continue;
    }

    for (const row of rows) {
      if (!aicmR8zV8dLooksNonTerminal(row)) continue;
      if (!aicmR8zV8dLooksReviewRelated(row)) continue;

      const item = aicmR8zV8dNormalizeReviewItem(row, relationName);
      const key = String(item.source_relation || '') + '|' + String(item.source_id || item.request_id || item.title || '');
      if (seen.has(key)) continue;
      seen.add(key);
      output.push(item);

      if (output.length >= 50) return output;
    }
  }

  return output;
}

function aicmR8zV8dAttachReviewWaitItems(payload, items) {
  if (!payload || typeof payload !== 'object') return payload;
  const list = Array.isArray(items) ? items : [];

  payload.review_wait_items = list;

  if (!payload.context || typeof payload.context !== 'object') payload.context = {};
  payload.context.review_wait_items = list;

  if (!payload.data || typeof payload.data !== 'object') payload.data = {};
  payload.data.review_wait_items = list;

  payload.r8z_v8d_review_wait_items_count = list.length;
  payload.r8z_v8d_review_wait_items_source = 'custom_http_context_response_interceptor';

  return payload;
}

function aicmR8zV8dStripContentLengthHeader(args) {
  for (let i = 0; i < args.length; i++) {
    const v = args[i];
    if (!v || typeof v !== 'object' || Array.isArray(v)) continue;
    for (const k of Object.keys(v)) {
      if (String(k).toLowerCase() === 'content-length') delete v[k];
    }
  }
  return args;
}

function aicmR8zV8dInstallContextResponseInterceptor(req, res) {
  if (!res || res.__aicmR8zV8dInstalled) return;
  res.__aicmR8zV8dInstalled = true;

  const originalEnd = res.end.bind(res);
  const originalWriteHead = typeof res.writeHead === 'function' ? res.writeHead.bind(res) : null;

  if (originalWriteHead) {
    res.writeHead = function aicmR8zV8dWriteHeadWithoutFixedLength(...args) {
      return originalWriteHead(...aicmR8zV8dStripContentLengthHeader(args));
    };
  }

  res.end = function aicmR8zV8dEndWithReviewWaitItems(chunk, encoding, callback) {
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

    (async () => {
      try {
        if (chunk === undefined || chunk === null) return callOriginal(chunk);

        const body = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
        const trimmed = body.trim();

        if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return callOriginal(chunk);

        const payload = JSON.parse(body);
        const items = await aicmR8zV8dLoadReviewWaitItems(req);
        aicmR8zV8dAttachReviewWaitItems(payload, items);

        const nextBody = JSON.stringify(payload);

        try {
          if (typeof res.setHeader === 'function' && !res.headersSent) {
            res.setHeader('content-type', 'application/json; charset=utf-8');
            res.removeHeader?.('content-length');
          }
        } catch {}

        return callOriginal(nextBody);
      } catch (error) {
        return callOriginal(chunk);
      }
    })();

    return res;
  };
}
// ${marker}: helper end
`;

const insertCall = `
    // ${marker}: route interceptor install
    aicmR8zV8dInstallContextResponseInterceptor(${reqName}, ${resName});
`;

src = src.slice(0, literalPos) + helper + '\n' + src.slice(literalPos);

const newLiteralPos = src.indexOf(literal, literalPos + helper.length);
if (newLiteralPos < 0) {
  log.push('ERROR: literal lost after helper insert');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(6);
}

const newOpenBracePos = src.indexOf('{', newLiteralPos);
if (newOpenBracePos < 0 || newOpenBracePos - newLiteralPos > 1200) {
  log.push('ERROR: route branch opening brace lost after helper insert');
  fs.writeFileSync(patchLog, log.join('\n') + '\n');
  process.exit(7);
}

src = src.slice(0, newOpenBracePos + 1) + insertCall + src.slice(newOpenBracePos + 1);

fs.writeFileSync(serverPath, src, 'utf8');

log.push('PATCH_APPLIED: helper inserted');
log.push('PATCH_APPLIED: custom HTTP context branch interceptor inserted');
log.push('CONTEXT_LITERAL=' + literal);
log.push('INSERT_CALL=' + insertCall.trim());

fs.writeFileSync(patchLog, log.join('\n') + '\n');
