import fs from 'node:fs';

const serverFile = process.env.SERVER_FILE;
let src = fs.readFileSync(serverFile, 'utf8');
const before = src;

const marker = 'AICM_AXU_CSV_R5M2_IMPORT_FUNCTION_REPAIR_V1';

function countText(text, needle) {
  return String(text || '').split(needle).length - 1;
}

function findFunctionStart(source, name) {
  const patterns = [
    'function ' + name + '(',
    'function ' + name + ' (',
    'async function ' + name + '(',
    'async function ' + name + ' ('
  ];

  let best = -1;

  for (const p of patterns) {
    const i = source.indexOf(p);
    if (i >= 0 && (best < 0 || i < best)) best = i;
  }

  return best;
}

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }

    if (ch === '/' && next === '/') {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === '/' && next === '*') {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }

    if (ch === '{') depth += 1;
    if (ch === '}') depth -= 1;

    if (depth === 0) return i;
  }

  return -1;
}

function findFunctionRange(source, name) {
  const start = findFunctionStart(source, name);
  if (start < 0) return null;

  const open = source.indexOf('{', start);
  if (open < 0) return null;

  const close = findMatchingBrace(source, open);
  if (close < 0) return null;

  return {
    start,
    open,
    close,
    end: close + 1,
    text: source.slice(start, close + 1)
  };
}

function parseInsertTargetAndColumns(functionText) {
  const re = /insert\s+into\s+([A-Za-z0-9_."']+(?:\s*\.\s*[A-Za-z0-9_."']+)?)\s*\(([\s\S]*?)\)\s*(?:select|with|values)/i;
  const m = functionText.match(re);

  if (!m) return null;

  const targetTable = m[1].replace(/\s+/g, '').replace(/'/g, '');
  const columns = m[2]
    .split(',')
    .map(s => s.trim().replace(/^"+|"+$/g, '').replace(/`/g, ''))
    .filter(Boolean)
    .filter(c => /^[A-Za-z0-9_]+$/.test(c));

  if (!targetTable || !columns.length) return null;

  return { targetTable, columns };
}

function quoteIdent(name) {
  return '"' + String(name).replace(/"/g, '""') + '"';
}

function expressionForColumn(col) {
  const c = String(col || '').toLowerCase();

  if (c === 'owner_civilization_id') return '$1::uuid';
  if (c === 'aicm_user_company_id') return '$2::uuid';

  if (c === 'aicm_user_company_department_id') return 'r.department_id';
  if (c === 'aicm_user_company_section_id') return 'r.section_id';

  if (c === 'display_order' || c === 'sort_order') return '(r.rn * 100)::integer';

  if (c === 'major_item_name') return 'r.major_item_name';
  if (c === 'major_item_description') return 'r.major_item_description';
  if (c === 'assigned_leader_label') return 'r.assigned_leader_label';

  if (c === 'priority_code') return 'r.priority_code';
  if (c === 'due_date') return 'r.due_date';
  if (c === 'note') return 'r.note';

  if (c === 'progress_status_code') return "'not_started'::text";
  if (c === 'approval_status_code') return "'draft'::text";
  if (c === 'workflow_status_code') return "'not_started'::text";
  if (c === 'handoff_status_code') return "'not_sent'::text";
  if (c === 'status_code') return "'active'::text";

  if (c === 'source_type_code') return "'csv_import'::text";
  if (c === 'source_app_code') return "'AICompanyManager'::text";
  if (c === 'created_by_ref' || c === 'updated_by_ref') return "'human'::text";

  if (c === 'created_at' || c === 'updated_at') return 'now()';
  if (c === 'metadata_jsonb') return "'{}'::jsonb";

  if (c.endsWith('_id')) return 'gen_random_uuid()';

  return null;
}

function buildInsertSql(targetTable, columns) {
  const expressions = columns.map(expressionForColumn);
  const unknown = columns.filter((_, i) => !expressions[i]);

  if (unknown.length) {
    throw new Error('Unsupported insert columns: ' + unknown.join(','));
  }

  const insertCols = columns.map(quoteIdent).join(',\n        ');
  const selectCols = expressions.join(',\n        ');

  return `
      WITH input_rows AS (
        SELECT
          row_number() OVER () AS rn,
          trim(coalesce(x.department_name, '')) AS department_name,
          nullif(trim(coalesce(x.section_name, '')), '') AS section_name,
          nullif(trim(coalesce(x.major_item_name, '')), '') AS major_item_name,
          nullif(trim(coalesce(x.major_item_description, '')), '') AS major_item_description,
          nullif(trim(coalesce(x.assigned_leader_label, '')), '') AS assigned_leader_label,
          CASE
            WHEN lower(trim(coalesce(x.priority_code, 'normal'))) IN ('low', 'normal', 'high', 'urgent')
              THEN lower(trim(coalesce(x.priority_code, 'normal')))
            ELSE 'normal'
          END AS priority_code,
          NULLIF(trim(coalesce(x.due_date, '')), '')::date AS due_date,
          nullif(trim(coalesce(x.note, '')), '') AS note
        FROM jsonb_to_recordset($3::jsonb) AS x(
          department_name text,
          section_name text,
          major_item_name text,
          major_item_description text,
          assigned_leader_label text,
          priority_code text,
          due_date text,
          note text
        )
      ),
      resolved AS (
        SELECT
          i.rn,
          d.aicm_user_company_department_id AS department_id,
          s.aicm_user_company_section_id AS section_id,
          i.major_item_name,
          coalesce(i.major_item_description, i.major_item_name) AS major_item_description,
          i.assigned_leader_label,
          i.priority_code,
          i.due_date,
          i.note
        FROM input_rows i
        LEFT JOIN business.aicm_user_company_department d
          ON d.owner_civilization_id = $1::uuid
         AND d.aicm_user_company_id = $2::uuid
         AND d.department_name = i.department_name
        LEFT JOIN business.aicm_user_company_section s
          ON s.owner_civilization_id = $1::uuid
         AND s.aicm_user_company_id = $2::uuid
         AND s.aicm_user_company_department_id = d.aicm_user_company_department_id
         AND i.section_name IS NOT NULL
         AND s.section_name = i.section_name
        WHERE i.major_item_name IS NOT NULL
      )
      INSERT INTO ${targetTable} (
        ${insertCols}
      )
      SELECT
        ${selectCols}
      FROM resolved r
      RETURNING 1 AS inserted_flag
    `;
}

const functionRange = findFunctionRange(src, 'importManagerMajorItemsCsv');

if (!functionRange) {
  console.error('function importManagerMajorItemsCsv not found');
  process.exit(1);
}

const parsed = parseInsertTargetAndColumns(functionRange.text);

if (!parsed) {
  console.error('Could not parse INSERT target/columns from importManagerMajorItemsCsv. Stop without patch.');
  console.error(functionRange.text.slice(0, 5000));
  process.exit(1);
}

let insertSql = '';

try {
  insertSql = buildInsertSql(parsed.targetTable, parsed.columns);
} catch (error) {
  console.error(error.message);
  console.error('targetTable=' + parsed.targetTable);
  console.error('columns=' + parsed.columns.join(','));
  process.exit(1);
}

const replacementFunction = `async function importManagerMajorItemsCsv(body) {
  // ${marker}
  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function normalizeRows(rows) {
    if (!Array.isArray(rows)) return [];

    return rows.map(function (row) {
      var dueDate = text(row.due_date);
      var priority = text(row.priority_code).toLowerCase();

      if (["low", "normal", "high", "urgent"].indexOf(priority) < 0) {
        priority = "normal";
      }

      if (dueDate && !/^\\d{4}-\\d{2}-\\d{2}$/.test(dueDate)) {
        throw new Error("due_date は YYYY-MM-DD または空欄にしてください: " + dueDate);
      }

      return {
        department_name: text(row.department_name),
        section_name: text(row.section_name),
        major_item_name: text(row.major_item_name),
        major_item_description: text(row.major_item_description),
        assigned_leader_label: text(row.assigned_leader_label),
        priority_code: priority,
        due_date: dueDate,
        note: text(row.note)
      };
    }).filter(function (row) {
      return row.major_item_name;
    });
  }

  async function queryDb(sql, params) {
    if (typeof pool !== "undefined" && pool && typeof pool.query === "function") {
      return pool.query(sql, params);
    }

    if (typeof pgPool !== "undefined" && pgPool && typeof pgPool.query === "function") {
      return pgPool.query(sql, params);
    }

    if (typeof dbPool !== "undefined" && dbPool && typeof dbPool.query === "function") {
      return dbPool.query(sql, params);
    }

    if (!globalThis.__AICM_AXU_CSV_R5M2_POOL) {
      const pgModule = await import("pg");
      const PoolClass = pgModule.Pool || (pgModule.default && pgModule.default.Pool);
      const connectionString = process.env.PERSONA_DATABASE_URL || process.env.DATABASE_URL;

      if (!PoolClass) {
        throw new Error("pg Pool class is not available.");
      }

      if (!connectionString) {
        throw new Error("PERSONA_DATABASE_URL is not set.");
      }

      globalThis.__AICM_AXU_CSV_R5M2_POOL = new PoolClass({ connectionString: connectionString });
    }

    return globalThis.__AICM_AXU_CSV_R5M2_POOL.query(sql, params);
  }

  const ownerCivilizationId = text(body.owner_civilization_id || body.ownerCivilizationId);
  const companyId = text(body.aicm_user_company_id || body.company_id);
  const rows = normalizeRows(body.rows);

  if (!ownerCivilizationId) {
    return { result: "error", error_message: "owner_civilization_id is required." };
  }

  if (!companyId) {
    return { result: "error", error_message: "aicm_user_company_id is required." };
  }

  if (!rows.length) {
    return { result: "error", error_message: "取り込めるCSV行がありません。" };
  }

  const sql = ${JSON.stringify(insertSql)};
  const dbResult = await queryDb(sql, [ownerCivilizationId, companyId, JSON.stringify(rows)]);
  const insertedCount = dbResult && Array.isArray(dbResult.rows) ? dbResult.rows.length : 0;

  return {
    result: "ok",
    inserted_count: insertedCount,
    route_version: "AXU-CSV-R5M2",
    import_target: ${JSON.stringify(parsed.targetTable)}
  };
}`;

src = src.slice(0, functionRange.start) + replacementFunction + src.slice(functionRange.end);

/*
 * Route currently calls:
 *   sendJson(res, 200, importManagerMajorItemsCsv(body));
 * Because function is now async, add await only to this route call.
 */
src = src.replace(
  'sendJson(res, 200, importManagerMajorItemsCsv(body));',
  'sendJson(res, 200, await importManagerMajorItemsCsv(body));'
);

src = src.replace(
  'sendJson(response, 200, importManagerMajorItemsCsv(body));',
  'sendJson(response, 200, await importManagerMajorItemsCsv(body));'
);

fs.writeFileSync(serverFile, src, 'utf8');

const after = fs.readFileSync(serverFile, 'utf8');

console.log('serverChanged=' + String(before !== after));
console.log('markerCount=' + String(countText(after, marker)));
console.log('endpointCount=' + String(countText(after, 'manager-major/import-csv')));
console.log('functionCount=' + String(countText(after, 'function importManagerMajorItemsCsv') + countText(after, 'async function importManagerMajorItemsCsv')));
console.log('awaitRouteCallCount=' + String(countText(after, 'await importManagerMajorItemsCsv(body)')));
console.log('targetTable=' + parsed.targetTable);
console.log('insertColumnCount=' + parsed.columns.length);
console.log('insertColumns=' + parsed.columns.join(','));
console.log('jsonbRecordsetCount=' + String(countText(after, 'jsonb_to_recordset($3::jsonb)')));
console.log('dueDateCastCount=' + String(countText(after, "NULLIF(trim(coalesce(x.due_date, '')), '')::date")));
console.log('valuesJoinRiskCount=' + String(
  countText(after, 'rows.map') +
  countText(after, 'valuesSql') +
  countText(after, '.join(",\\\\n') +
  countText(after, ".join(',\\\\n")
));
console.log('tokenEnvNameCountServer=' + String(countText(after, 'PERSONA_AIWORKEROS_AUTH_TOKEN')));
console.log('asyncAsyncCountServer=' + String(countText(after, 'async async function')));
