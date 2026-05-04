import fs from 'fs';

const [,, corePath, extractOut, verifyOut] = process.argv;
let src = fs.readFileSync(corePath, 'utf8');

const marker = 'AICM_R8Z_MGR_MAJOR_CARD_C2D12_LEADER_GENERIC_OPTION_FILTER';
const targetFunction = 'aicmR8zC2cRenderRoutePicker';

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function count(text, needle) {
  return (text.match(new RegExp(escRe(needle), 'g')) || []).length;
}

function lineNoAt(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function findOpenBrace(text, fromIndex) {
  let state = 'normal';
  let escape = false;

  for (let i = fromIndex; i < text.length; i += 1) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') state = 'normal';
      continue;
    }
    if (state === 'blockComment') {
      if (ch === '*' && nx === '/') {
        state = 'normal';
        i += 1;
      }
      continue;
    }
    if (state === 'single') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === "'") state = 'normal';
      continue;
    }
    if (state === 'double') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '"') state = 'normal';
      continue;
    }
    if (state === 'template') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '`') state = 'normal';
      continue;
    }

    if (ch === '/' && nx === '/') {
      state = 'lineComment';
      i += 1;
      continue;
    }
    if (ch === '/' && nx === '*') {
      state = 'blockComment';
      i += 1;
      continue;
    }
    if (ch === "'") {
      state = 'single';
      continue;
    }
    if (ch === '"') {
      state = 'double';
      continue;
    }
    if (ch === '`') {
      state = 'template';
      continue;
    }

    if (ch === '{') return i;
  }

  return -1;
}

function findMatchingBrace(text, openIndex) {
  let depth = 0;
  let state = 'normal';
  let escape = false;

  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    const nx = text[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') state = 'normal';
      continue;
    }
    if (state === 'blockComment') {
      if (ch === '*' && nx === '/') {
        state = 'normal';
        i += 1;
      }
      continue;
    }
    if (state === 'single') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === "'") state = 'normal';
      continue;
    }
    if (state === 'double') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '"') state = 'normal';
      continue;
    }
    if (state === 'template') {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '`') state = 'normal';
      continue;
    }

    if (ch === '/' && nx === '/') {
      state = 'lineComment';
      i += 1;
      continue;
    }
    if (ch === '/' && nx === '*') {
      state = 'blockComment';
      i += 1;
      continue;
    }
    if (ch === "'") {
      state = 'single';
      continue;
    }
    if (ch === '"') {
      state = 'double';
      continue;
    }
    if (ch === '`') {
      state = 'template';
      continue;
    }

    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function findFunctionRange(text, name) {
  const re = new RegExp('(?:async\\s+)?function\\s+' + escRe(name) + '\\s*\\(', 'm');
  const m = re.exec(text);
  if (!m) throw new Error('FUNCTION_NOT_FOUND: ' + name);

  const start = m.index;
  const open = findOpenBrace(text, start);
  if (open < 0) throw new Error('OPEN_BRACE_NOT_FOUND: ' + name);

  const close = findMatchingBrace(text, open);
  if (close < 0) throw new Error('CLOSE_BRACE_NOT_FOUND: ' + name);

  return {
    name,
    start,
    open,
    close,
    startLine: lineNoAt(text, start),
    endLine: lineNoAt(text, close),
    text: text.slice(start, close + 1)
  };
}

function replaceFunction(text, fn, nextText) {
  return text.slice(0, fn.start) + nextText + text.slice(fn.close + 1);
}

if (count(src, marker) > 0) {
  throw new Error('C2D12_MARKER_ALREADY_EXISTS');
}

const fn = findFunctionRange(src, targetFunction);
const openRel = fn.open - fn.start;
const closeRel = fn.close - fn.start;
const header = fn.text.slice(0, openRel + 1);
const body = fn.text.slice(openRel + 1, closeRel);
const footer = fn.text.slice(closeRel);

const wrapperBody = `
  // ${marker}_START
  // Keep route picker as the single UI source.
  // Filter only generic Leader role labels from rendered option HTML.
  // No DB write. No API POST. No fetch.
  function aicmC2d12StripTags(value) {
    return String(value == null ? "" : value)
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#x2F;/g, "/")
      .replace(/&#47;/g, "/")
      .trim();
  }

  function aicmC2d12NormalizeLeaderOption(value) {
    return aicmC2d12StripTags(value)
      .replace(/[\\s　]+/g, "")
      .toLowerCase();
  }

  function aicmC2d12IsGenericLeaderOption(label, attrs) {
    var visible = aicmC2d12StripTags(label);
    var normalized = aicmC2d12NormalizeLeaderOption(label);
    var normalizedAttrs = aicmC2d12NormalizeLeaderOption(attrs);

    if (!normalized) return false;

    // Placeholder must stay.
    if (visible.indexOf("選択してください") >= 0) return false;
    if (visible.indexOf("Leaderを選択") >= 0) return false;
    if (visible.indexOf("課長を選択") >= 0) return false;

    if (normalized === "leader") return true;
    if (normalized === "課長") return true;
    if (normalized === "課長/leader") return true;
    if (normalized === "leader/課長") return true;
    if (normalized === "section_leader") return true;
    if (normalized === "-") return true;
    if (normalized === "未設定") return true;

    // Keep real nicknames such as ガチ.
    // Remove only if both value/label are generic role-ish.
    if (normalizedAttrs.indexOf('value="leader"') >= 0 && normalized === "leader") return true;
    if (normalizedAttrs.indexOf("value='leader'") >= 0 && normalized === "leader") return true;

    return false;
  }

  function aicmC2d12FilterGenericLeaderOptions(html) {
    if (typeof html !== "string") return html;

    return html.replace(/<option\\b([^>]*)>([\\s\\S]*?)<\\/option>/gi, function (match, attrs, label) {
      if (aicmC2d12IsGenericLeaderOption(label, attrs)) {
        return "";
      }
      return match;
    });
  }

  var aicmC2d12Args = arguments;
  var aicmC2d12Html = (function () {
${body}
  }).apply(this, aicmC2d12Args);

  return aicmC2d12FilterGenericLeaderOptions(aicmC2d12Html);
  // ${marker}_END
`;

const patchedFunctionText = header + wrapperBody + footer;
src = replaceFunction(src, fn, patchedFunctionText);
fs.writeFileSync(corePath, src);

const patched = findFunctionRange(src, targetFunction);

const sampleHtml = [
  '<select>',
  '<option value="">Leaderを選択してください</option>',
  '<option value="Leader">Leader</option>',
  '<option value="gachi">ガチ</option>',
  '<option value="section_leader">section_leader</option>',
  '</select>'
].join("");

const sampleFiltered = sampleHtml
  .replace(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi, function (match, attrs, label) {
    function stripTags(value) {
      return String(value == null ? "" : value)
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#x2F;/g, "/")
        .replace(/&#47;/g, "/")
        .trim();
    }

    function norm(value) {
      return stripTags(value).replace(/[\s　]+/g, "").toLowerCase();
    }

    const visible = stripTags(label);
    const n = norm(label);
    const na = norm(attrs);

    if (visible.includes("選択してください")) return match;
    if (visible.includes("Leaderを選択")) return match;
    if (visible.includes("課長を選択")) return match;

    if (
      n === "leader" ||
      n === "課長" ||
      n === "課長/leader" ||
      n === "leader/課長" ||
      n === "section_leader" ||
      n === "-" ||
      n === "未設定" ||
      (na.includes('value="leader"') && n === "leader") ||
      (na.includes("value='leader'") && n === "leader")
    ) {
      return "";
    }

    return match;
  });

const extract = [];
extract.push('AICompanyManager V10L-C2D12 patched route picker extract');
extract.push('DB_WRITE=NO');
extract.push('API_POST=NO');
extract.push('CORE_PATCH=YES');
extract.push('SERVER_PATCH=NO');
extract.push('');
extract.push('FUNCTION=' + targetFunction);
extract.push('FUNCTION_LINES=' + patched.startLine + '-' + patched.endLine);
extract.push('');
extract.push('============================================================');
extract.push('SAMPLE_FILTERED_HTML');
extract.push('============================================================');
extract.push(sampleFiltered);
extract.push('');
extract.push('============================================================');
extract.push('PATCHED_FUNCTION');
extract.push('============================================================');
extract.push(patched.text);
fs.writeFileSync(extractOut, extract.join('\n') + '\n');

const verify = [];
verify.push('AICompanyManager V10L-C2D12 verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('');
verify.push('FUNCTION=' + targetFunction);
verify.push('FUNCTION_LINES=' + patched.startLine + '-' + patched.endLine);
verify.push('C2D12_MARKER_TOTAL_COUNT=' + count(src, marker));
verify.push('C2D12_START_COUNT=' + count(src, marker + '_START'));
verify.push('C2D12_END_COUNT=' + count(src, marker + '_END'));
verify.push('FILTER_FUNCTION_COUNT=' + count(patched.text, 'aicmC2d12FilterGenericLeaderOptions'));
verify.push('GENERIC_LEADER_RULE_COUNT=' + count(patched.text, 'normalized === "leader"'));
verify.push('PRESERVE_PLACEHOLDER_RULE_COUNT=' + count(patched.text, '選択してください'));
verify.push('SAMPLE_HAS_PLACEHOLDER=' + (sampleFiltered.includes('Leaderを選択してください') ? 'YES' : 'NO'));
verify.push('SAMPLE_HAS_GACHI=' + (sampleFiltered.includes('ガチ') ? 'YES' : 'NO'));
verify.push('SAMPLE_HAS_GENERIC_LEADER_OPTION=' + (sampleFiltered.includes('>Leader</option>') ? 'YES' : 'NO'));
verify.push('SAMPLE_HAS_SECTION_LEADER_OPTION=' + (sampleFiltered.includes('section_leader') ? 'YES' : 'NO'));
verify.push('FETCH_IN_INSERTED_BLOCK=' + count(wrapperBody, 'fetch('));
verify.push('XMLHTTP_IN_INSERTED_BLOCK=' + count(wrapperBody, 'XMLHttpRequest'));
verify.push('EXTRACT_OUT=' + extractOut);

if (count(src, marker) !== 2) throw new Error('C2D12_MARKER_TOTAL_COUNT_NOT_2');
if (count(src, marker + '_START') !== 1) throw new Error('C2D12_START_COUNT_NOT_1');
if (count(src, marker + '_END') !== 1) throw new Error('C2D12_END_COUNT_NOT_1');
if (!sampleFiltered.includes('Leaderを選択してください')) throw new Error('PLACEHOLDER_REMOVED');
if (!sampleFiltered.includes('ガチ')) throw new Error('REAL_LEADER_CANDIDATE_REMOVED');
if (sampleFiltered.includes('>Leader</option>')) throw new Error('GENERIC_LEADER_NOT_FILTERED');
if (sampleFiltered.includes('section_leader')) throw new Error('SECTION_LEADER_NOT_FILTERED');
if (count(wrapperBody, 'fetch(') !== 0) throw new Error('FETCH_FOUND_IN_INSERTED_BLOCK');
if (count(wrapperBody, 'XMLHttpRequest') !== 0) throw new Error('XMLHTTP_FOUND_IN_INSERTED_BLOCK');

fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
