import fs from "node:fs";

const files = process.argv.slice(2).filter(Boolean);
const marker = "AICM_PMLW_GETCONTEXT_SQL_EXTENSION_AQL_AQO_V1";

function extractFunction(source, functionName) {
  const needle = "function " + functionName + "(";
  const start = source.indexOf(needle);
  if (start < 0) throw new Error("Function not found: " + functionName);

  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) throw new Error("Opening brace not found: " + functionName);

  let depth = 0;
  let quote = "";
  let templateDepth = 0;
  let lineComment = false;
  let blockComment = false;
  let escape = false;

  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i++;
      }
      continue;
    }

    if (quote) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (quote === "`" && ch === "$" && next === "{") {
        templateDepth++;
        i++;
        continue;
      }
      if (quote === "`" && templateDepth > 0) {
        if (ch === "{") templateDepth++;
        if (ch === "}") templateDepth--;
        continue;
      }
      if (ch === quote) quote = "";
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i++;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i++;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return { start, end: i + 1, text: source.slice(start, i + 1) };
    }
  }

  throw new Error("Function end not found: " + functionName);
}

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function findArrayLineIndex(lines, pattern) {
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) return i;
  }
  return -1;
}

function patchGetContextText(fnText) {
  if (fnText.includes(marker)) return { text: fnText, changed: false, already: true };

  if (!fnText.includes("task_ledger")) {
    throw new Error("getContext does not contain task_ledger");
  }

  if (!fnText.includes("robot_catalog")) {
    throw new Error("getContext does not contain robot_catalog insertion anchor");
  }

  if (!fnText.includes("sqlLiteral(owner)")) {
    throw new Error("getContext does not use sqlLiteral(owner)");
  }

  const lines = fnText.split("\n");

  const robotIdx = findArrayLineIndex(lines, /["']\s*,?\s*'robot_catalog'\s*,?\s*["']/);
  if (robotIdx < 0) {
    throw new Error("robot_catalog line not found");
  }

  const indent = (lines[robotIdx].match(/^(\s*)/) || ["", ""])[1];

  const insert = [
    `${indent}// ${marker}`,
    `${indent}"  'pmlw_president_policies', (",`,
    `${indent}"    SELECT COALESCE(jsonb_agg(to_jsonb(p) ORDER BY p.display_order ASC, p.updated_at DESC, p.created_at DESC), '[]'::jsonb)",`,
    `${indent}"    FROM business.vw_aicm_pmlw_president_policy_display p",`,
    `${indent}"    WHERE p.owner_civilization_id::text = " + sqlLiteral(owner),`,
    `${indent}"  ),",`,
    `${indent}"  'pmlw_major_items', (",`,
    `${indent}"    SELECT COALESCE(jsonb_agg(to_jsonb(m) ORDER BY m.display_order ASC, m.updated_at DESC, m.created_at DESC), '[]'::jsonb)",`,
    `${indent}"    FROM business.vw_aicm_pmlw_major_work_display m",`,
    `${indent}"    WHERE m.owner_civilization_id::text = " + sqlLiteral(owner),`,
    `${indent}"  ),",`,
    `${indent}"  'pmlw_middle_items', (",`,
    `${indent}"    SELECT COALESCE(jsonb_agg(to_jsonb(l) ORDER BY l.display_order ASC, l.updated_at DESC, l.created_at DESC), '[]'::jsonb)",`,
    `${indent}"    FROM business.vw_aicm_pmlw_leader_middle_display l",`,
    `${indent}"    WHERE l.owner_civilization_id::text = " + sqlLiteral(owner),`,
    `${indent}"  ),",`,
    `${indent}"  'pmlw_deliverable_requirements', (",`,
    `${indent}"    SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.display_order ASC, r.updated_at DESC, r.created_at DESC), '[]'::jsonb)",`,
    `${indent}"    FROM business.vw_aicm_pmlw_deliverable_requirement_display r",`,
    `${indent}"    WHERE r.owner_civilization_id::text = " + sqlLiteral(owner),`,
    `${indent}"  ),",`,
    `${indent}"  'pmlw_worker_work_units', (",`,
    `${indent}"    SELECT COALESCE(jsonb_agg(to_jsonb(w) ORDER BY w.display_order ASC, w.updated_at DESC, w.created_at DESC), '[]'::jsonb)",`,
    `${indent}"    FROM business.vw_aicm_pmlw_worker_work_unit_display w",`,
    `${indent}"    WHERE w.owner_civilization_id::text = " + sqlLiteral(owner),`,
    `${indent}"  ),",`,
    `${indent}"  'pmlw_workflow_tree', (",`,
    `${indent}"    SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.last_updated_at DESC NULLS LAST), '[]'::jsonb)",`,
    `${indent}"    FROM business.vw_aicm_pmlw_workflow_tree t",`,
    `${indent}"    WHERE t.owner_civilization_id::text = " + sqlLiteral(owner),`,
    `${indent}"  ),",`
  ];

  lines.splice(robotIdx, 0, ...insert);
  return { text: lines.join("\n"), changed: true, already: false };
}

function assertNoDedicatedPoolAdded(before, after) {
  const beforeCount = count(before, "new Pool(") + count(before, "new PgPool(") + count(before, "AicmPmlwPgPool") + count(before, "aicmPmlwPg");
  const afterCount = count(after, "new Pool(") + count(after, "new PgPool(") + count(after, "AicmPmlwPgPool") + count(after, "aicmPmlwPg");

  if (afterCount !== beforeCount) {
    throw new Error("Dedicated Pool/import marker count changed; prohibited");
  }
}

function patchFile(file) {
  if (!fs.existsSync(file)) return { file, skipped: true, reason: "missing" };

  const before = fs.readFileSync(file, "utf8");
  const fn = extractFunction(before, "getContext");
  const patched = patchGetContextText(fn.text);

  const after = before.slice(0, fn.start) + patched.text + before.slice(fn.end);
  assertNoDedicatedPoolAdded(before, after);

  if (after !== before) {
    fs.writeFileSync(file, after);
  }

  return {
    file,
    changed: after !== before,
    alreadyPatched: patched.already,
    pmlwMajorCount: count(after, "pmlw_major_items"),
    markerCount: count(after, marker)
  };
}

let patchedAny = false;

for (const file of files) {
  const result = patchFile(file);
  console.log(JSON.stringify(result));
  if (result.changed || result.alreadyPatched) patchedAny = true;
}

if (!patchedAny) {
  throw new Error("No file patched");
}
