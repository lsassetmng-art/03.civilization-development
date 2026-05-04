const fs = require("fs");

const [
  ,
  ,
  corePath,
  serverPath,
  verifyOut,
  decisionOut,
  rankingOut,
  extractOut,
  endpointScanOut
] = process.argv;

const src = fs.readFileSync(corePath, "utf8");
const server = fs.readFileSync(serverPath, "utf8");

function count(text, needle) {
  let c = 0;
  let from = 0;
  while (true) {
    const idx = text.indexOf(needle, from);
    if (idx < 0) break;
    c++;
    from = idx + needle.length;
  }
  return c;
}

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function lineNoAt(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function findOpenBrace(text, fromIndex) {
  let state = "normal";
  let escape = false;

  for (let i = fromIndex; i < text.length; i += 1) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === "lineComment") {
      if (ch === "\n") state = "normal";
      continue;
    }
    if (state === "blockComment") {
      if (ch === "*" && nx === "/") {
        state = "normal";
        i += 1;
      }
      continue;
    }
    if (state === "single") {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === "'") state = "normal";
      continue;
    }
    if (state === "double") {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') state = "normal";
      continue;
    }
    if (state === "template") {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === "`") state = "normal";
      continue;
    }

    if (ch === "/" && nx === "/") {
      state = "lineComment";
      i += 1;
      continue;
    }
    if (ch === "/" && nx === "*") {
      state = "blockComment";
      i += 1;
      continue;
    }
    if (ch === "'") {
      state = "single";
      continue;
    }
    if (ch === '"') {
      state = "double";
      continue;
    }
    if (ch === "`") {
      state = "template";
      continue;
    }

    if (ch === "{") return i;
  }

  return -1;
}

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  let state = "normal";
  let escape = false;

  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === "lineComment") {
      if (ch === "\n") state = "normal";
      continue;
    }
    if (state === "blockComment") {
      if (ch === "*" && nx === "/") {
        state = "normal";
        i += 1;
      }
      continue;
    }
    if (state === "single") {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === "'") state = "normal";
      continue;
    }
    if (state === "double") {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') state = "normal";
      continue;
    }
    if (state === "template") {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === "`") state = "normal";
      continue;
    }

    if (ch === "/" && nx === "/") {
      state = "lineComment";
      i += 1;
      continue;
    }
    if (ch === "/" && nx === "*") {
      state = "blockComment";
      i += 1;
      continue;
    }
    if (ch === "'") {
      state = "single";
      continue;
    }
    if (ch === '"') {
      state = "double";
      continue;
    }
    if (ch === "`") {
      state = "template";
      continue;
    }

    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function listFunctions(text) {
  const out = [];
  const re = /(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/g;
  let m;

  while ((m = re.exec(text)) !== null) {
    const name = m[1];
    const start = m.index;
    const open = findOpenBrace(text, start);
    if (open < 0) continue;

    const close = findMatchingBrace(text, open);
    if (close < 0) continue;

    out.push({
      name,
      start,
      open,
      close,
      startLine: lineNoAt(text, start),
      endLine: lineNoAt(text, close),
      text: text.slice(start, close + 1)
    });
  }

  return out;
}

const functions = listFunctions(src);

function hasAny(text, needles) {
  return needles.some(n => text.includes(n));
}

function scoreFunction(fn) {
  const t = fn.text;
  let score = 0;
  const reasons = [];

  if (hasAny(t, ["実行前チェック", "事前チェック", "precheck", "pre-check"])) {
    score += 80;
    reasons.push("HAS_PRECHECK_TEXT");
  }
  if (hasAny(t, ["payload preview", "Payload preview", "payloadPreview", "payload_preview"])) {
    score += 70;
    reasons.push("HAS_PAYLOAD_PREVIEW");
  }
  if (hasAny(t, ["manager-major/update", "/api/aicm/v2/manager-major/update"])) {
    score += 90;
    reasons.push("HAS_MANAGER_MAJOR_UPDATE_ENDPOINT");
  }
  if (hasAny(t, ["fetch(", "method: \"POST\"", "method:'POST'", "method: 'POST'"])) {
    score += 90;
    reasons.push("HAS_FETCH_OR_POST");
  }
  if (hasAny(t, ["open-handoff-confirm", "handoff-confirm", "HandoffConfirm", "Leaderへ送る", "課長へ送る"])) {
    score += 60;
    reasons.push("HAS_HANDOFF_CONFIRM");
  }
  if (hasAny(t, ["handoffBatchRoute", "sectionLabel", "departmentLabel", "leaderLabel", "leaderPlacementId"])) {
    score += 65;
    reasons.push("USES_C2D_ROUTE_STATE");
  }
  if (hasAny(t, ["selectedRows", "aicmR8zMgrMajorCardSelectedRows", "selected ids", "selectedIds"])) {
    score += 50;
    reasons.push("USES_SELECTED_ROWS");
  }
  if (hasAny(t, ["manager_major_item_id", "managerMajorItemId", "major_item_id", "majorItemId"])) {
    score += 45;
    reasons.push("USES_MAJOR_ID");
  }
  if (hasAny(t, ["disabled", "POST未実行", "API_POST", "DB_WRITE=NO", "unlock", "locked"])) {
    score += 45;
    reasons.push("HAS_LOCK_OR_DISABLED_HINT");
  }
  if (hasAny(t, ["確認", "Yes", "No", "はい", "いいえ"])) {
    score += 25;
    reasons.push("HAS_CONFIRM_UI_TEXT");
  }
  if (hasAny(t, ["C2D9", "C2D11R1", "C2D12", "AICM_R8Z_MGR_MAJOR_CARD_C2D"])) {
    score += 20;
    reasons.push("HAS_C2D_MARKER_CONTEXT");
  }

  return { fn, score, reasons };
}

const ranked = functions
  .map(scoreFunction)
  .filter(x => x.score > 0)
  .sort((a, b) => b.score - a.score);

const top = ranked.slice(0, 30);

const endpointNeedles = [
  "/api/aicm/v2/manager-major/update",
  "manager-major/update",
  "fetch(",
  "method: \"POST\"",
  "method: 'POST'",
  "payload preview",
  "Payload preview",
  "実行前チェック",
  "handoffBatchRoute",
  "leaderPlacementId",
  "leaderLabel",
  "departmentLabel",
  "sectionLabel",
  "aicmR8zMgrMajorCardSelectedRows",
  "manager_major_item_id",
  "managerMajorItemId"
];

const endpointScan = [];
endpointScan.push("AICompanyManager V10L-C2F-A endpoint and payload scan");
endpointScan.push("DB_WRITE=NO");
endpointScan.push("API_POST=NO");
endpointScan.push("CORE_PATCH=NO");
endpointScan.push("SERVER_PATCH=NO");
endpointScan.push("");
endpointScan.push("[CORE COUNTS]");
for (const n of endpointNeedles) {
  endpointScan.push(`${n}=${count(src, n)}`);
}
endpointScan.push("");
endpointScan.push("[SERVER COUNTS]");
for (const n of endpointNeedles) {
  endpointScan.push(`${n}=${count(server, n)}`);
}
fs.writeFileSync(endpointScanOut, endpointScan.join("\n") + "\n");

const rankingLines = [];
rankingLines.push("AICompanyManager V10L-C2F-A validation function ranking");
rankingLines.push("DB_WRITE=NO");
rankingLines.push("API_POST=NO");
rankingLines.push("CORE_PATCH=NO");
rankingLines.push("SERVER_PATCH=NO");
rankingLines.push("");

for (const item of top) {
  rankingLines.push(
    `score=${item.score}; function=${item.fn.name}; lines=${item.fn.startLine}-${item.fn.endLine}; reasons=${item.reasons.join(",")}`
  );
}
fs.writeFileSync(rankingOut, rankingLines.join("\n") + "\n");

const extractLines = [];
extractLines.push("AICompanyManager V10L-C2F-A relevant function extracts");
extractLines.push("DB_WRITE=NO");
extractLines.push("API_POST=NO");
extractLines.push("CORE_PATCH=NO");
extractLines.push("SERVER_PATCH=NO");
extractLines.push("");

for (const item of top.slice(0, 12)) {
  extractLines.push("============================================================");
  extractLines.push(`FUNCTION=${item.fn.name}`);
  extractLines.push(`LINES=${item.fn.startLine}-${item.fn.endLine}`);
  extractLines.push(`SCORE=${item.score}`);
  extractLines.push(`REASONS=${item.reasons.join(",")}`);
  extractLines.push("============================================================");
  extractLines.push(item.fn.text);
  extractLines.push("");
}
fs.writeFileSync(extractOut, extractLines.join("\n") + "\n");

const topFn = top[0] ? top[0].fn : null;
const confirmCandidates = ranked.filter(x => x.reasons.includes("HAS_HANDOFF_CONFIRM")).slice(0, 10);
const postCandidates = ranked.filter(x => x.reasons.includes("HAS_FETCH_OR_POST") || x.reasons.includes("HAS_MANAGER_MAJOR_UPDATE_ENDPOINT")).slice(0, 10);
const precheckCandidates = ranked.filter(x => x.reasons.includes("HAS_PRECHECK_TEXT") || x.reasons.includes("HAS_PAYLOAD_PREVIEW")).slice(0, 10);
const routeCandidates = ranked.filter(x => x.reasons.includes("USES_C2D_ROUTE_STATE")).slice(0, 10);

const requiredValidation = [
  {
    key: "selected_rows_non_empty",
    present: count(src, "aicmR8zMgrMajorCardSelectedRows") > 0 || count(src, "selectedRows") > 0
  },
  {
    key: "manager_major_id_present",
    present: count(src, "manager_major_item_id") > 0 || count(src, "managerMajorItemId") > 0 || count(src, "major_item_id") > 0
  },
  {
    key: "section_applied_present",
    present: count(src, "sectionLabel") > 0 || count(src, "section_label") > 0
  },
  {
    key: "department_present",
    present: count(src, "departmentLabel") > 0 || count(src, "department_label") > 0
  },
  {
    key: "leader_present",
    present: count(src, "leaderLabel") > 0 || count(src, "leader_label") > 0
  },
  {
    key: "leader_placement_present",
    present: count(src, "leaderPlacementId") > 0 || count(src, "leader_placement_id") > 0
  },
  {
    key: "payload_preview_present",
    present: count(src, "payload preview") > 0 || count(src, "Payload preview") > 0 || count(src, "payloadPreview") > 0
  },
  {
    key: "post_endpoint_present",
    present: count(src, "/api/aicm/v2/manager-major/update") > 0 || count(src, "manager-major/update") > 0
  }
];

const verify = [];
verify.push("AICompanyManager V10L-C2F-A verify");
verify.push("DB_WRITE=NO");
verify.push("API_POST=NO");
verify.push("CORE_PATCH=NO");
verify.push("SERVER_PATCH=NO");
verify.push("");
verify.push("CORE_FUNCTION_COUNT=" + functions.length);
verify.push("VALIDATION_RELATED_FUNCTION_COUNT=" + ranked.length);
verify.push("TOP_FUNCTION=" + (topFn ? topFn.name : "NONE"));
verify.push("TOP_FUNCTION_LINES=" + (topFn ? `${topFn.startLine}-${topFn.endLine}` : "NONE"));
verify.push("CONFIRM_CANDIDATE_COUNT=" + confirmCandidates.length);
verify.push("POST_CANDIDATE_COUNT=" + postCandidates.length);
verify.push("PRECHECK_CANDIDATE_COUNT=" + precheckCandidates.length);
verify.push("ROUTE_STATE_CANDIDATE_COUNT=" + routeCandidates.length);
verify.push("");
for (const v of requiredValidation) {
  verify.push("VALIDATION_SIGNAL_" + v.key.toUpperCase() + "=" + (v.present ? "YES" : "NO"));
}
verify.push("");
verify.push("CORE_ENDPOINT_UPDATE_COUNT=" + count(src, "/api/aicm/v2/manager-major/update"));
verify.push("CORE_FETCH_COUNT=" + count(src, "fetch("));
verify.push("SERVER_ENDPOINT_UPDATE_COUNT=" + count(server, "/api/aicm/v2/manager-major/update") + count(server, "manager-major/update"));
verify.push("");
verify.push("FUNCTION_RANKING=" + rankingOut);
verify.push("RELEVANT_EXTRACT=" + extractOut);
verify.push("ENDPOINT_SCAN=" + endpointScanOut);
fs.writeFileSync(verifyOut, verify.join("\n") + "\n");

const missingValidation = requiredValidation.filter(v => !v.present).map(v => v.key);

const decision = [];
decision.push("AICompanyManager V10L-C2F-A decision");
decision.push("DB_WRITE=NO");
decision.push("API_POST=NO");
decision.push("CORE_PATCH=NO");
decision.push("SERVER_PATCH=NO");
decision.push("");
decision.push("CONCLUSION=PRE_POST_VALIDATION_STRUCTURE_AUDITED_PATCH_NOT_APPLIED");
decision.push("TOP_FUNCTION=" + (topFn ? `${topFn.name}:${topFn.startLine}-${topFn.endLine}` : "NONE"));
decision.push("MISSING_VALIDATION_SIGNALS=" + (missingValidation.length ? missingValidation.join(",") : "NONE"));
decision.push("");
decision.push("C2F_REQUIRED_GATE");
decision.push("1. selected rows must be non-empty");
decision.push("2. every selected row must have stable manager major id");
decision.push("3. route must be applied");
decision.push("4. section must be present");
decision.push("5. department must be present");
decision.push("6. Leader must be present");
decision.push("7. Leader placement id should be present when available; if missing, POST stays locked");
decision.push("8. payload preview must match confirm state");
decision.push("9. POST button must not be shown/enabled when any required item is missing");
decision.push("");
decision.push("PATCH_NEXT_POLICY");
decision.push("- C2F-B should patch only the highest-ranked existing confirm/precheck/render function");
decision.push("- Do not add another bridge or wrapper");
decision.push("- Do not enable API POST yet");
decision.push("- Do not touch server/API/DB route");
decision.push("- Validation result should be visible in the existing confirm panel");
decision.push("- Existing C2D route state must remain the single source of truth");
decision.push("");
decision.push("TOP_CONFIRM_CANDIDATES");
for (const c of confirmCandidates.slice(0, 5)) {
  decision.push(`- ${c.fn.name}:${c.fn.startLine}-${c.fn.endLine}; score=${c.score}; reasons=${c.reasons.join(",")}`);
}
decision.push("");
decision.push("TOP_POST_CANDIDATES");
for (const c of postCandidates.slice(0, 5)) {
  decision.push(`- ${c.fn.name}:${c.fn.startLine}-${c.fn.endLine}; score=${c.score}; reasons=${c.reasons.join(",")}`);
}
decision.push("");
decision.push("NEXT=V10L-C2F-B_PRE_POST_VALIDATION_GATE_PATCH");
fs.writeFileSync(decisionOut, decision.join("\n") + "\n");
