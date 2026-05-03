const fs = require("fs");

const corePath = process.argv[2];
const patchLog = process.argv[3];
const analysisPath = process.argv[4];

const marker = "AICM_R8Z_V10F2B_SECTION_NEW_WORKER_RENDERER_MODE_FIX";
const log = [];
const analysis = [];

let src = fs.readFileSync(corePath, "utf8");

if (src.includes(marker)) {
  log.push("SKIP: marker already exists");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, "SKIP_ALREADY_EXISTS\n");
  process.exit(0);
}

function lineNo(index) {
  return src.slice(0, Math.max(0, index)).split(/\n/).length;
}

function scanBraceEnd(openIndex, source = src) {
  let depth = 0;
  let quote = "";
  let lineComment = false;
  let blockComment = false;
  let escape = false;

  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i += 1;
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
      if (ch === quote) quote = "";
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }

  return -1;
}

function findFunction(name, source = src) {
  const patterns = [
    new RegExp(`function\\s+${name}\\s*\\(`, "g"),
    new RegExp(`${name}\\s*=\\s*function\\s*\\(`, "g"),
    new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*function\\s*\\(`, "g"),
    new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*\\([^)]*\\)\\s*=>`, "g"),
    new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*[^\\n=]*=>`, "g")
  ];

  for (const re of patterns) {
    const m = re.exec(source);
    if (!m) continue;

    const start = m.index;
    const open = source.indexOf("{", start);
    if (open < 0) continue;

    const end = scanBraceEnd(open, source);
    if (end < 0) continue;

    return {
      name,
      start,
      open,
      end,
      line: lineNo(start),
      text: source.slice(start, end)
    };
  }

  return null;
}

function identifiersCalled(text) {
  const set = new Set();
  const re = /\b([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g;
  const skip = new Set([
    "if","for","while","switch","catch","function","return",
    "String","Number","Boolean","Array","Object","Date","JSON","Math",
    "parseInt","parseFloat","isNaN","isFinite","encodeURIComponent",
    "setTimeout","clearTimeout","alert","confirm","console"
  ]);

  let m;
  while ((m = re.exec(text))) {
    const name = m[1];
    if (!skip.has(name)) set.add(name);
  }

  return Array.from(set).sort();
}

function findCallEnd(source, openParen) {
  let depth = 0;
  let quote = "";
  let lineComment = false;
  let blockComment = false;
  let escape = false;

  for (let i = openParen; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === "*" && next === "/") {
        blockComment = false;
        i += 1;
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
      if (ch === quote) quote = "";
      continue;
    }

    if (ch === "/" && next === "/") {
      lineComment = true;
      i += 1;
      continue;
    }

    if (ch === "/" && next === "*") {
      blockComment = true;
      i += 1;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }

    if (ch === "(") depth += 1;
    if (ch === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function functionNameLooksWorker(name) {
  return /worker|placement|robot|employee|staff|member/i.test(name);
}

function textLooksWorkerRenderer(text) {
  return /従業員設定|従業員設定ロボット|従業員行を追加|Worker|worker|ロボット|robot|placement|配置/i.test(text);
}

function textLooksWholeSectionForm(text) {
  return /課名|課コード|課説明|section_name|section_code|section_description|部門名/.test(text);
}

const sectionNew = findFunction("renderSectionNew");

if (!sectionNew) {
  log.push("ERROR: renderSectionNew not found");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, "SECTION_NEW_FOUND=false\n");
  process.exit(2);
}

analysis.push(`SECTION_NEW_FOUND=true`);
analysis.push(`SECTION_NEW_LINE=${sectionNew.line}`);

const calls = identifiersCalled(sectionNew.text);
analysis.push(`SECTION_NEW_CALLS=${calls.join(",")}`);

const candidates = [];

for (const name of calls) {
  if (name === "renderSectionNew") continue;

  const fn = findFunction(name);
  if (!fn) continue;

  let score = 0;
  if (functionNameLooksWorker(name)) score += 100;
  if (/従業員設定ロボット/.test(fn.text)) score += 90;
  if (/従業員設定/.test(fn.text)) score += 80;
  if (/従業員行を追加/.test(fn.text)) score += 60;
  if (/worker|Worker|robot|ロボット|placement|配置/i.test(fn.text)) score += 30;
  if (/selectedSectionId|selectedSection|currentSection|editingSectionId|sectionEditId|placements|state\.placements/.test(fn.text)) score += 25;
  if (textLooksWholeSectionForm(fn.text) && !functionNameLooksWorker(name)) score -= 160;
  if (/renderSectionNew|section-new/.test(name)) score -= 300;

  candidates.push({
    name,
    score,
    line: fn.line,
    text: fn.text,
    fn
  });
}

candidates.sort((a, b) => b.score - a.score);

analysis.push("CANDIDATES_BEGIN");
for (const c of candidates) {
  analysis.push([
    `name=${c.name}`,
    `score=${c.score}`,
    `line=${c.line}`,
    `name_worker=${functionNameLooksWorker(c.name)}`,
    `text_worker=${textLooksWorkerRenderer(c.text)}`,
    `whole_form=${textLooksWholeSectionForm(c.text)}`
  ].join("\t"));
}
analysis.push("CANDIDATES_END");

const candidate = candidates.find(c =>
  c.score >= 80 &&
  textLooksWorkerRenderer(c.text) &&
  (
    functionNameLooksWorker(c.name) ||
    !textLooksWholeSectionForm(c.text)
  )
);

if (!candidate) {
  log.push("ERROR: safe worker renderer candidate not found");
  analysis.push("PATCH_DECISION=NO_SAFE_CANDIDATE");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(3);
}

analysis.push(`PATCH_DECISION=CANDIDATE_SELECTED`);
analysis.push(`WORKER_RENDERER_NAME=${candidate.name}`);
analysis.push(`WORKER_RENDERER_LINE=${candidate.line}`);
analysis.push(`WORKER_RENDERER_SCORE=${candidate.score}`);

const emptyHook = `
    // ${marker}_WORKER_RENDERER_MODE_HOOK_START
    try {
      var aicmR8zV10f2bOptions = null;
      if (arguments && arguments.length > 0) {
        var aicmR8zV10f2bLastArg = arguments[arguments.length - 1];
        if (
          aicmR8zV10f2bLastArg &&
          typeof aicmR8zV10f2bLastArg === "object" &&
          aicmR8zV10f2bLastArg.aicmSectionWorkerMode
        ) {
          aicmR8zV10f2bOptions = aicmR8zV10f2bLastArg;
        }
      }

      if (aicmR8zV10f2bOptions && aicmR8zV10f2bOptions.aicmSectionWorkerMode === "new") {
        var aicmR8zV10f2bEsc = function(value) {
          var text = String(value === undefined || value === null ? "" : value).trim();
          if (typeof escapeHtml === "function") return escapeHtml(text);
          return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        };

        return [
          '<section class="aicm-core-card" data-aicm-v10f2b-section-new-worker-empty="true" style="border:2px solid #38bdf8;background:#eff6ff;">',
          '  <p class="aicm-eyebrow">従業員設定</p>',
          '  <h2>従業員は未設定です</h2>',
          '  <p class="aicm-selected-note">新規課では、既存課の従業員設定を引き継ぎません。</p>',
          '  <p class="aicm-selected-note">課を保存したあと、課詳細から従業員を配置してください。</p>',
          '  <p class="aicm-selected-note">V10F2B: worker renderer mode=new / empty draft</p>',
          '</section>'
        ].join("");
      }
    } catch (aicmR8zV10f2bModeError) {
      if (typeof console !== "undefined" && console && console.warn) {
        console.warn("AICM V10F2B worker mode hook skipped", aicmR8zV10f2bModeError);
      }
    }
    // ${marker}_WORKER_RENDERER_MODE_HOOK_END
`;

let patchedSrc = src;

// Patch worker renderer body.
{
  const fn = candidate.fn;
  const insertAt = fn.open + 1;
  patchedSrc = patchedSrc.slice(0, insertAt) + emptyHook + patchedSrc.slice(insertAt);
}

// Recompute sectionNew after source changed.
src = patchedSrc;
const sectionNewAfter = findFunction("renderSectionNew");
if (!sectionNewAfter) {
  log.push("ERROR: renderSectionNew not found after worker hook");
  fs.writeFileSync(patchLog, log.join("\n") + "\n");
  fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
  process.exit(4);
}

// Patch candidate call inside renderSectionNew.
{
  const fnText = sectionNewAfter.text;
  const name = candidate.name;
  const re = new RegExp(`\\b${name}\\s*\\(`, "g");
  const m = re.exec(fnText);

  if (!m) {
    log.push(`ERROR: call to ${name} not found in renderSectionNew after recompute`);
    fs.writeFileSync(patchLog, log.join("\n") + "\n");
    fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
    process.exit(5);
  }

  const callStartGlobal = sectionNewAfter.start + m.index;
  const openParenGlobal = src.indexOf("(", callStartGlobal);
  const closeParenGlobal = findCallEnd(src, openParenGlobal);

  if (openParenGlobal < 0 || closeParenGlobal < 0) {
    log.push(`ERROR: call bounds not found for ${name}`);
    fs.writeFileSync(patchLog, log.join("\n") + "\n");
    fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
    process.exit(6);
  }

  const argsText = src.slice(openParenGlobal + 1, closeParenGlobal).trim();
  const optionArg = `{ aicmSectionWorkerMode: "new", rows: [], source: "section-new" }`;
  const insert = argsText.length ? `, ${optionArg}` : optionArg;

  patchedSrc = src.slice(0, closeParenGlobal) + insert + src.slice(closeParenGlobal);

  analysis.push(`CALLSITE_PATCHED=true`);
  analysis.push(`CALLSITE_FUNCTION=${name}`);
  analysis.push(`CALLSITE_LINE=${lineNo(callStartGlobal)}`);
}

fs.writeFileSync(corePath, patchedSrc, "utf8");

log.push(`PATCH_APPLIED: worker renderer mode hook added to ${candidate.name}`);
log.push(`PATCH_APPLIED: renderSectionNew passes mode=new to ${candidate.name}`);
fs.writeFileSync(patchLog, log.join("\n") + "\n");
fs.writeFileSync(analysisPath, analysis.join("\n") + "\n");
