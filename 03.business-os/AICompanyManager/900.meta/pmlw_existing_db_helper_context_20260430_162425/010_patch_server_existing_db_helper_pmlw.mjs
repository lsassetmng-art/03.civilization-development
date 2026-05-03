import fs from "node:fs";

const targets = process.argv.slice(2).filter(Boolean);

const marker = "AICM_PMLW_CONTEXT_EXISTING_DB_HELPER_AQH_AQK_REDO_V1";

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function extractFunctionBodyStart(src, functionName) {
  const re = new RegExp("(async\\s+)?function\\s+" + functionName + "\\s*\\(");
  const m = re.exec(src);
  if (!m) return -1;
  return m.index;
}

function detectExistingQueryHelper(src) {
  /*
   * 既存serverの保守性を優先するため、既存helperだけを使う。
   * 新しい Pool / Client / pg import は作らない。
   *
   * 優先順:
   * 1. 既存の rows-return helper
   * 2. 既存の汎用 query helper
   * 3. 既存 client.query wrapper
   *
   * 見つからなければ STOP。
   */
  const candidates = [
    { name: "queryRows", call: (sql, params) => `queryRows(${sql}, ${params})`, rowMode: "rows" },
    { name: "dbQueryRows", call: (sql, params) => `dbQueryRows(${sql}, ${params})`, rowMode: "rows" },
    { name: "queryDbRows", call: (sql, params) => `queryDbRows(${sql}, ${params})`, rowMode: "rows" },
    { name: "readRows", call: (sql, params) => `readRows(${sql}, ${params})`, rowMode: "rows" },
    { name: "selectRows", call: (sql, params) => `selectRows(${sql}, ${params})`, rowMode: "rows" },

    { name: "query", call: (sql, params) => `query(${sql}, ${params})`, rowMode: "result" },
    { name: "dbQuery", call: (sql, params) => `dbQuery(${sql}, ${params})`, rowMode: "result" },
    { name: "queryDb", call: (sql, params) => `queryDb(${sql}, ${params})`, rowMode: "result" },
    { name: "executeQuery", call: (sql, params) => `executeQuery(${sql}, ${params})`, rowMode: "result" },
    { name: "runQuery", call: (sql, params) => `runQuery(${sql}, ${params})`, rowMode: "result" }
  ];

  for (const c of candidates) {
    const fnRe = new RegExp("(async\\s+)?function\\s+" + c.name + "\\s*\\(");
    const constRe = new RegExp("(const|let|var)\\s+" + c.name + "\\s*=\\s*(async\\s*)?\\(");
    const arrowRe = new RegExp("(const|let|var)\\s+" + c.name + "\\s*=\\s*async\\s*\\(");

    if (fnRe.test(src) || constRe.test(src) || arrowRe.test(src)) {
      return c;
    }
  }

  /*
   * 追加保険:
   * context内で既存関数として使われている可能性が高い rows helper を拾う。
   */
  const called = Array.from(src.matchAll(/await\s+([A-Za-z0-9_]+)\s*\(\s*["'`][\s\S]{0,80}select\s+/gi))
    .map((m) => m[1])
    .filter((name) => !["fetch", "sendJson", "readAicmPmlwContext"].includes(name));

  const unique = [...new Set(called)];
  if (unique.length === 1) {
    const name = unique[0];
    return {
      name,
      call: (sql, params) => `${name}(${sql}, ${params})`,
      rowMode: "unknown"
    };
  }

  return null;
}

function makeRowsExpr(helper, sqlConst, paramsConst) {
  const call = helper.call(sqlConst, paramsConst);

  if (helper.rowMode === "rows") {
    return `await ${call}`;
  }

  if (helper.rowMode === "result") {
    return `(await ${call}).rows`;
  }

  return `normalizeAicmPmlwRows(await ${call})`;
}

function insertHelper(src, helper) {
  if (src.includes(marker)) return src;

  const row = (sqlName) => makeRowsExpr(helper, sqlName, "params");

  const helperCode = `

// ${marker}
function normalizeAicmPmlwRows(value) {
  if (Array.isArray(value)) return value;
  if (value && Array.isArray(value.rows)) return value.rows;
  if (value && Array.isArray(value.data)) return value.data;
  return [];
}

async function readAicmPmlwContext(ownerCivilizationId) {
  const params = [ownerCivilizationId];

  const presidentPolicySql =
    "select * from business.vw_aicm_pmlw_president_policy_display where owner_civilization_id = $1 order by display_order asc, updated_at desc, created_at desc";

  const majorItemSql =
    "select * from business.vw_aicm_pmlw_major_work_display where owner_civilization_id = $1 order by display_order asc, updated_at desc, created_at desc";

  const middleItemSql =
    "select * from business.vw_aicm_pmlw_leader_middle_display where owner_civilization_id = $1 order by display_order asc, updated_at desc, created_at desc";

  const deliverableRequirementSql =
    "select * from business.vw_aicm_pmlw_deliverable_requirement_display where owner_civilization_id = $1 order by display_order asc, updated_at desc, created_at desc";

  const workerWorkUnitSql =
    "select * from business.vw_aicm_pmlw_worker_work_unit_display where owner_civilization_id = $1 order by display_order asc, updated_at desc, created_at desc";

  const workflowTreeSql =
    "select * from business.vw_aicm_pmlw_workflow_tree where owner_civilization_id = $1 order by last_updated_at desc nulls last";

  return {
    pmlw_president_policies: ${row("presidentPolicySql")},
    pmlw_major_items: ${row("majorItemSql")},
    pmlw_middle_items: ${row("middleItemSql")},
    pmlw_deliverable_requirements: ${row("deliverableRequirementSql")},
    pmlw_worker_work_units: ${row("workerWorkUnitSql")},
    pmlw_workflow_tree: ${row("workflowTreeSql")}
  };
}
`;

  /*
   * 既存helperの後ろに置くのが一番読みやすい。
   */
  const helperPos = extractFunctionBodyStart(src, helper.name);
  if (helperPos >= 0) {
    const nextFunction = src.indexOf("\nfunction ", helperPos + 10);
    const nextAsyncFunction = src.indexOf("\nasync function ", helperPos + 10);

    const positions = [nextFunction, nextAsyncFunction].filter((v) => v > helperPos);
    const insertPos = positions.length ? Math.min(...positions) : src.indexOf("\n", helperPos + 10);

    if (insertPos > 0) {
      return src.slice(0, insertPos) + helperCode + "\n" + src.slice(insertPos);
    }
  }

  /*
   * fallback: context routeの直前。
   */
  const contextPos = src.indexOf("/api/aicm/v2/context");
  if (contextPos > 0) {
    const lineStart = src.lastIndexOf("\n", contextPos);
    return src.slice(0, lineStart) + helperCode + "\n" + src.slice(lineStart);
  }

  throw new Error("Could not locate safe insertion point for PMLW helper");
}

function patchContextResponse(src) {
  if (src.includes("...aicmPmlwContext")) return src;

  const taskLine = src.match(/\n([ \t]*)task_ledger[ \t]*:[^\n}]+,?/);
  if (!taskLine || taskLine.index === undefined) {
    throw new Error("Could not locate task_ledger property in context response");
  }

  /*
   * context responseオブジェクトの直前で await readAicmPmlwContext を入れる。
   */
  const responseStartCandidates = [
    src.lastIndexOf("sendJson", taskLine.index),
    src.lastIndexOf("writeJson", taskLine.index),
    src.lastIndexOf("json", taskLine.index),
    src.lastIndexOf("return", taskLine.index)
  ].filter((v) => v >= 0);

  if (!responseStartCandidates.length) {
    throw new Error("Could not locate context response start");
  }

  const responseStart = Math.max(...responseStartCandidates);
  const lineStart = src.lastIndexOf("\n", responseStart) + 1;
  const declaration = "    const aicmPmlwContext = await readAicmPmlwContext(ownerCivilizationId);\n";

  let out = src;
  if (!out.includes("const aicmPmlwContext = await readAicmPmlwContext(ownerCivilizationId);")) {
    out = out.slice(0, lineStart) + declaration + out.slice(lineStart);
  }

  const refreshedTaskLine = out.match(/\n([ \t]*)task_ledger[ \t]*:[^\n}]+,?/);
  if (!refreshedTaskLine || refreshedTaskLine.index === undefined) {
    throw new Error("Could not locate task_ledger property after declaration insert");
  }

  const indent = refreshedTaskLine[1] || "";
  const start = refreshedTaskLine.index;
  const end = start + refreshedTaskLine[0].length;
  let line = refreshedTaskLine[0];

  if (!/,\s*$/.test(line)) {
    line = line + ",";
  }

  const inject = [
    line,
    `${indent}...aicmPmlwContext,`
  ].join("\n");

  out = out.slice(0, start) + inject + out.slice(end);
  return out;
}

function assertNoNewPool(src, before) {
  const newPoolBefore = count(before, "new Pool(") + count(before, "new PgPool(") + count(before, "new AicmPmlwPgPool(");
  const newPoolAfter = count(src, "new Pool(") + count(src, "new PgPool(") + count(src, "new AicmPmlwPgPool(");

  if (newPoolAfter !== newPoolBefore) {
    throw new Error("New Pool detected; prohibited for this phase");
  }

  if (src.includes("AICM_PMLW_CONTEXT_READ_AQH_AQK_V1") || src.includes("AicmPmlwPgPool")) {
    throw new Error("Old dedicated PMLW Pool marker detected; prohibited");
  }
}

function patchFile(file) {
  if (!fs.existsSync(file)) return { file, skipped: true, reason: "missing" };

  let src = fs.readFileSync(file, "utf8");
  const before = src;

  if (src.includes(marker) && src.includes("...aicmPmlwContext")) {
    return { file, changed: false, alreadyPatched: true };
  }

  const helper = detectExistingQueryHelper(src);
  if (!helper) {
    return { file, changed: false, stopped: true, reason: "existing DB query helper not detected" };
  }

  src = insertHelper(src, helper);
  src = patchContextResponse(src);
  assertNoNewPool(src, before);

  fs.writeFileSync(file, src);
  return { file, changed: src !== before, helper: helper.name, helperRowMode: helper.rowMode };
}

let anyChanged = false;
let anyPatched = false;
const results = [];

for (const file of targets) {
  const result = patchFile(file);
  results.push(result);
  if (result.changed || result.alreadyPatched) anyPatched = true;
  if (result.changed) anyChanged = true;
}

for (const result of results) {
  console.log(JSON.stringify(result));
}

if (!anyPatched) {
  throw new Error("STOP: existing DB helper was not found in target server files; no server patch applied");
}
