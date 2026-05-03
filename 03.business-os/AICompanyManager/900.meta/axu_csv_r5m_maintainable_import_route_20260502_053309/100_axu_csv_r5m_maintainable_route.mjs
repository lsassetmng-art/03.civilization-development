import fs from 'node:fs';

const serverFile = process.env.SERVER_FILE;
let src = fs.readFileSync(serverFile, 'utf8');
const before = src;

const endpoint = 'manager-major/import-csv';
const marker = 'AICM_AXU_CSV_R5M_MAINTAINABLE_IMPORT_ROUTE_V1';

function countText(text, needle) {
  return String(text || '').split(needle).length - 1;
}

function isWordBoundary(ch) {
  return !ch || !/[A-Za-z0-9_$]/.test(ch);
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

function findRouteIfBlock(text, endpointText) {
  const ep = text.indexOf(endpointText);
  if (ep < 0) return null;

  for (let i = ep; i >= 0; i -= 1) {
    if (
      text.slice(i, i + 2) === 'if' &&
      isWordBoundary(text[i - 1]) &&
      isWordBoundary(text[i + 2])
    ) {
      const open = text.indexOf('{', i);
      if (open < 0 || open > ep + 1200) continue;

      const close = findMatchingBrace(text, open);
      if (close > ep) {
        return {
          start: i,
          open,
          close,
          end: close + 1,
          text: text.slice(i, close + 1),
          conditionText: text.slice(i, open + 1)
        };
      }
    }
  }

  return null;
}

function parseInsertTargetAndColumns(routeText) {
  const re = /insert\s+into\s+([A-Za-z0-9_."']+(?:\s*\.\s*[A-Za-z0-9_."']+)?)\s*\(([\s\S]*?)\)\s*(?:select|with|values)/i;
  const m = routeText.match(re);

  if (!m) return null;

  const targetTable = m[1].replace(/\s+/g, '');
  const rawCols = m[2];

  const columns = rawCols
    .split(',')
    .map(s => s.trim().replace(/^"+|"+$/g, '').replace(/`/g, ''))
    .filter(Boolean)
    .filter(c => /^[A-Za-z0-9_]+$/.test(c));

  if (!targetTable || columns.length === 0) return null;

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

  if (c === 'created_at' || c === 'updated_at') return 'now()';
  if (c === 'metadata_jsonb') return "'{}'::jsonb";

  if (c.includes('approval') && c.endsWith('status_code')) return "'draft'::text";
  if (c.includes('progress') && c.endsWith('status_code')) return "'not_started'::text";
  if (c.includes('workflow') && c.endsWith('status_code')) return "'not_started'::text";
  if (c === 'status_code') return "'not_started'::text";

  return null;
}

function buildInsertSql(targetTable, columns) {
  const expressions = columns.map(expressionForColumn);
  const unknown = columns.filter((_, i) => !expressions[i]);

  if (unknown.length) {
    throw new Error('Unsupported insert columns for maintainable route: ' + unknown.join(','));
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

const block = findRouteIfBlock(src, endpoint);
if (!block) {
  console.error('Could not locate raw if-block for ' + endpoint);
  process.exit(1);
}

const parsed = parseInsertTargetAndColumns(block.text);
if (!parsed) {
  console.error('Could not parse INSERT target/columns from existing route. Stop without patch.');
  console.error(block.text.slice(0, 4000));
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

const replacementBlock = `${block.conditionText}
    // ${marker}
    const aicmR5mReq = (typeof req !== "undefined") ? req : ((typeof request !== "undefined") ? request : null);
    const aicmR5mRes = (typeof res !== "undefined") ? res : ((typeof response !== "undefined") ? response : null);

    function aicmR5mSendJson(statusCode, payload) {
      if (!aicmR5mRes) throw new Error("HTTP response object is not available.");
      aicmR5mRes.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
      aicmR5mRes.end(JSON.stringify(payload));
    }

    function aicmR5mReadBody() {
      return new Promise(function (resolve, reject) {
        if (!aicmR5mReq) {
          reject(new Error("HTTP request object is not available."));
          return;
        }

        var chunks = [];

        aicmR5mReq.on("data", function (chunk) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
        });

        aicmR5mReq.on("end", function () {
          resolve(Buffer.concat(chunks).toString("utf8"));
        });

        aicmR5mReq.on("error", reject);
      });
    }

    async function aicmR5mDbQuery(sql, params) {
      if (typeof pool !== "undefined" && pool && typeof pool.query === "function") {
        return pool.query(sql, params);
      }

      if (typeof pgPool !== "undefined" && pgPool && typeof pgPool.query === "function") {
        return pgPool.query(sql, params);
      }

      if (typeof dbPool !== "undefined" && dbPool && typeof dbPool.query === "function") {
        return dbPool.query(sql, params);
      }

      if (!globalThis.__AICM_AXU_CSV_R5M_POOL) {
        const pgModule = await import("pg");
        const PoolClass = pgModule.Pool || (pgModule.default && pgModule.default.Pool);
        const connectionString = process.env.PERSONA_DATABASE_URL || process.env.DATABASE_URL;

        if (!PoolClass) {
          throw new Error("pg Pool class is not available.");
        }

        if (!connectionString) {
          throw new Error("PERSONA_DATABASE_URL is not set.");
        }

        globalThis.__AICM_AXU_CSV_R5M_POOL = new PoolClass({ connectionString: connectionString });
      }

      return globalThis.__AICM_AXU_CSV_R5M_POOL.query(sql, params);
    }

    function aicmR5mText(value) {
      return String(value == null ? "" : value).trim();
    }

    function aicmR5mNormalizeRows(rows) {
      if (!Array.isArray(rows)) return [];

      return rows.map(function (row) {
        var dueDate = aicmR5mText(row.due_date);
        var priority = aicmR5mText(row.priority_code).toLowerCase();

        if (["low", "normal", "high", "urgent"].indexOf(priority) < 0) {
          priority = "normal";
        }

        if (dueDate && !/^\\d{4}-\\d{2}-\\d{2}$/.test(dueDate)) {
          throw new Error("due_date は YYYY-MM-DD または空欄にしてください: " + dueDate);
        }

        return {
          department_name: aicmR5mText(row.department_name),
          section_name: aicmR5mText(row.section_name),
          major_item_name: aicmR5mText(row.major_item_name),
          major_item_description: aicmR5mText(row.major_item_description),
          assigned_leader_label: aicmR5mText(row.assigned_leader_label),
          priority_code: priority,
          due_date: dueDate,
          note: aicmR5mText(row.note)
        };
      }).filter(function (row) {
        return row.major_item_name;
      });
    }

    try {
      const rawBody = await aicmR5mReadBody();
      const body = rawBody ? JSON.parse(rawBody) : {};
      const ownerCivilizationId = aicmR5mText(body.owner_civilization_id || body.ownerCivilizationId);
      const companyId = aicmR5mText(body.aicm_user_company_id || body.company_id);
      const rows = aicmR5mNormalizeRows(body.rows);

      if (!ownerCivilizationId) {
        aicmR5mSendJson(400, { result: "error", error_message: "owner_civilization_id is required." });
        return;
      }

      if (!companyId) {
        aicmR5mSendJson(400, { result: "error", error_message: "aicm_user_company_id is required." });
        return;
      }

      if (!rows.length) {
        aicmR5mSendJson(400, { result: "error", error_message: "取り込めるCSV行がありません。" });
        return;
      }

      const sql = ${JSON.stringify(insertSql)};
      const dbResult = await aicmR5mDbQuery(sql, [ownerCivilizationId, companyId, JSON.stringify(rows)]);
      const insertedCount = dbResult && Array.isArray(dbResult.rows) ? dbResult.rows.length : 0;

      aicmR5mSendJson(200, {
        result: "ok",
        inserted_count: insertedCount,
        route_version: "AXU-CSV-R5M",
        import_target: ${JSON.stringify(parsed.targetTable)}
      });
      return;
    } catch (error) {
      console.error("AXU-CSV-R5M manager-major CSV import failed:", error && error.stack ? error.stack : error);
      aicmR5mSendJson(500, {
        result: "error",
        error_message: error && error.message ? error.message : "CSV取り込みに失敗しました。",
        route_version: "AXU-CSV-R5M"
      });
      return;
    }
  }`;

src = src.slice(0, block.start) + replacementBlock + src.slice(block.end);
fs.writeFileSync(serverFile, src, "utf8");

const after = fs.readFileSync(serverFile, "utf8");

console.log("serverChanged=" + String(before !== after));
console.log("markerCount=" + String(countText(after, marker)));
console.log("endpointCount=" + String(countText(after, endpoint)));
console.log("targetTable=" + parsed.targetTable);
console.log("insertColumnCount=" + parsed.columns.length);
console.log("insertColumns=" + parsed.columns.join(","));
console.log("jsonbRecordsetCount=" + String(countText(after, "jsonb_to_recordset($3::jsonb)")));
console.log("dueDateCastCount=" + String(countText(after, "NULLIF(trim(coalesce(x.due_date, '')), '')::date")));
console.log("valuesJoinRiskCount=" + String(
  countText(after, "rows.map") +
  countText(after, "valuesSql") +
  countText(after, ".join(\",\\\\n") +
  countText(after, ".join(',\\\\n")
));
console.log("tokenEnvNameCountServer=" + String(countText(after, "PERSONA_AIWORKEROS_AUTH_TOKEN")));
console.log("asyncAsyncCountServer=" + String(countText(after, "async async function")));
