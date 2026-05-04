import fs from 'fs';

const [,, corePath, verifyOut, extractOut] = process.argv;
let src = fs.readFileSync(corePath, 'utf8');

const marker = 'AICM_R8Z_MGR_MAJOR_CARD_C2E_R2B_SAFE_DEBUG_PANEL_DISPLAY_FILTER';
const targetFunction = 'h';

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

if (count(src, marker) > 0) {
  throw new Error('C2E_R2B_MARKER_ALREADY_EXISTS');
}

const target = findFunctionRange(src, targetFunction);

const insertion = `

// ${marker}_START
// Formal UI display filter for temporary C2D debug panels.
// This does not edit function h body.
// It only filters the returned HTML string.
// No DB write. No API POST. No fetch.
var aicmR8zC2eR2bOriginalH = h;

function aicmR8zC2eR2bRemoveBlockContainingLabel(html, label) {
  var out = String(html == null ? "" : html);
  var guard = 0;

  while (out.indexOf(label) >= 0 && guard < 50) {
    guard += 1;

    var labelIndex = out.indexOf(label);
    var removed = false;
    var tags = ["details", "section", "article", "div"];

    for (var i = 0; i < tags.length; i += 1) {
      var tag = tags[i];
      var openNeedle = "<" + tag;
      var closeNeedle = "</" + tag + ">";
      var openIndex = out.lastIndexOf(openNeedle, labelIndex);
      var closeIndex = out.indexOf(closeNeedle, labelIndex);

      if (openIndex >= 0 && closeIndex >= 0) {
        var endIndex = closeIndex + closeNeedle.length;
        var block = out.slice(openIndex, endIndex);

        if (block.indexOf(label) >= 0 && block.length <= 50000) {
          out = out.slice(0, openIndex) + out.slice(endIndex);
          removed = true;
          break;
        }
      }
    }

    if (!removed) {
      out = out.slice(0, labelIndex) + out.slice(labelIndex + label.length);
    }
  }

  return out;
}

function aicmR8zC2eR2bFilterFormalHtml(html) {
  if (typeof html !== "string") return html;

  var out = html;
  out = aicmR8zC2eR2bRemoveBlockContainingLabel(out, "C2D5R2A 課を適用 debug");
  out = aicmR8zC2eR2bRemoveBlockContainingLabel(out, "C2D7 handler entry debug");
  return out;
}

h = function aicmR8zC2eR2bFormalUiHWrapper() {
  var html = aicmR8zC2eR2bOriginalH.apply(this, arguments);
  return aicmR8zC2eR2bFilterFormalHtml(html);
};
// ${marker}_END
`;

src = src.slice(0, target.close + 1) + insertion + src.slice(target.close + 1);
fs.writeFileSync(corePath, src);

const wrapperStart = src.indexOf(marker + '_START');
const wrapperEnd = src.indexOf(marker + '_END');

if (wrapperStart < 0 || wrapperEnd < wrapperStart) {
  throw new Error('WRAPPER_INSERTION_FAILED');
}

const wrapperText = src.slice(wrapperStart, wrapperEnd + (marker + '_END').length);

const sample = [
  '<main>',
  '<section><h3>一括引き渡し先</h3><div>部門: 遠吠え部？</div><div>課: 遠吠え課？</div><div>Leader: ガチ</div></section>',
  '<details><summary>C2D5R2A 課を適用 debug</summary><p>debug body</p></details>',
  '<details><summary>C2D7 handler entry debug</summary><pre>{}</pre></details>',
  '<section><h3>対象大項目</h3><ul><li>ロボット配置表示の整備</li></ul></section>',
  '</main>'
].join('');

function sampleRemoveBlockContainingLabel(html, label) {
  let out = String(html == null ? "" : html);
  let guard = 0;

  while (out.indexOf(label) >= 0 && guard < 50) {
    guard += 1;

    const labelIndex = out.indexOf(label);
    let removed = false;
    const tags = ["details", "section", "article", "div"];

    for (const tag of tags) {
      const openNeedle = "<" + tag;
      const closeNeedle = "</" + tag + ">";
      const openIndex = out.lastIndexOf(openNeedle, labelIndex);
      const closeIndex = out.indexOf(closeNeedle, labelIndex);

      if (openIndex >= 0 && closeIndex >= 0) {
        const endIndex = closeIndex + closeNeedle.length;
        const block = out.slice(openIndex, endIndex);

        if (block.indexOf(label) >= 0 && block.length <= 50000) {
          out = out.slice(0, openIndex) + out.slice(endIndex);
          removed = true;
          break;
        }
      }
    }

    if (!removed) {
      out = out.slice(0, labelIndex) + out.slice(labelIndex + label.length);
    }
  }

  return out;
}

let sampleFiltered = sample;
sampleFiltered = sampleRemoveBlockContainingLabel(sampleFiltered, 'C2D5R2A 課を適用 debug');
sampleFiltered = sampleRemoveBlockContainingLabel(sampleFiltered, 'C2D7 handler entry debug');

const extract = [];
extract.push('AICompanyManager V10L-C2E-R2B wrapper extract');
extract.push('DB_WRITE=NO');
extract.push('API_POST=NO');
extract.push('CORE_PATCH=YES');
extract.push('SERVER_PATCH=NO');
extract.push('');
extract.push('TARGET_FUNCTION=h');
extract.push('TARGET_FUNCTION_LINES=' + target.startLine + '-' + target.endLine);
extract.push('');
extract.push('============================================================');
extract.push('SAMPLE_FILTERED_HTML');
extract.push('============================================================');
extract.push(sampleFiltered);
extract.push('');
extract.push('============================================================');
extract.push('INSERTED_WRAPPER');
extract.push('============================================================');
extract.push(wrapperText);
fs.writeFileSync(extractOut, extract.join('\n') + '\n');

const verify = [];
verify.push('AICompanyManager V10L-C2E-R2B verify');
verify.push('DB_WRITE=NO');
verify.push('API_POST=NO');
verify.push('SERVER_PATCH=NO');
verify.push('');
verify.push('TARGET_FUNCTION=h');
verify.push('TARGET_FUNCTION_LINES=' + target.startLine + '-' + target.endLine);
verify.push('C2E_R2B_MARKER_TOTAL_COUNT=' + count(src, marker));
verify.push('C2E_R2B_START_COUNT=' + count(src, marker + '_START'));
verify.push('C2E_R2B_END_COUNT=' + count(src, marker + '_END'));
verify.push('ORIGINAL_H_WRAPPER_COUNT=' + count(src, 'aicmR8zC2eR2bOriginalH'));
verify.push('H_ASSIGN_WRAPPER_COUNT=' + count(src, 'h = function aicmR8zC2eR2bFormalUiHWrapper()'));
verify.push('FILTER_FUNCTION_COUNT=' + count(src, 'aicmR8zC2eR2bFilterFormalHtml'));
verify.push('SOURCE_C2D5_VISIBLE_LABEL_COUNT_STILL_IN_SOURCE=' + count(src, 'C2D5R2A 課を適用 debug'));
verify.push('SOURCE_C2D7_VISIBLE_LABEL_COUNT_STILL_IN_SOURCE=' + count(src, 'C2D7 handler entry debug'));
verify.push('SAMPLE_HAS_C2D5_LABEL_AFTER_FILTER=' + (sampleFiltered.indexOf('C2D5R2A 課を適用 debug') >= 0 ? 'YES' : 'NO'));
verify.push('SAMPLE_HAS_C2D7_LABEL_AFTER_FILTER=' + (sampleFiltered.indexOf('C2D7 handler entry debug') >= 0 ? 'YES' : 'NO'));
verify.push('SAMPLE_KEEP_FORMAL_ROUTE_UI=' + (sampleFiltered.indexOf('一括引き渡し先') >= 0 ? 'YES' : 'NO'));
verify.push('SAMPLE_KEEP_DEPARTMENT=' + (sampleFiltered.indexOf('部門: 遠吠え部？') >= 0 ? 'YES' : 'NO'));
verify.push('SAMPLE_KEEP_SECTION=' + (sampleFiltered.indexOf('課: 遠吠え課？') >= 0 ? 'YES' : 'NO'));
verify.push('SAMPLE_KEEP_LEADER=' + (sampleFiltered.indexOf('Leader: ガチ') >= 0 ? 'YES' : 'NO'));
verify.push('FETCH_IN_INSERTED_WRAPPER=' + count(wrapperText, 'fetch('));
verify.push('XMLHTTP_IN_INSERTED_WRAPPER=' + count(wrapperText, 'XMLHttpRequest'));
verify.push('EXTRACT_OUT=' + extractOut);

if (count(src, marker) !== 2) throw new Error('C2E_R2B_MARKER_TOTAL_COUNT_NOT_2');
if (count(src, marker + '_START') !== 1) throw new Error('C2E_R2B_START_COUNT_NOT_1');
if (count(src, marker + '_END') !== 1) throw new Error('C2E_R2B_END_COUNT_NOT_1');
if (count(src, 'h = function aicmR8zC2eR2bFormalUiHWrapper()') !== 1) throw new Error('H_WRAPPER_ASSIGN_COUNT_NOT_1');
if (sampleFiltered.indexOf('C2D5R2A 課を適用 debug') >= 0) throw new Error('SAMPLE_C2D5_LABEL_STILL_VISIBLE');
if (sampleFiltered.indexOf('C2D7 handler entry debug') >= 0) throw new Error('SAMPLE_C2D7_LABEL_STILL_VISIBLE');
if (sampleFiltered.indexOf('一括引き渡し先') < 0) throw new Error('SAMPLE_FORMAL_ROUTE_UI_REMOVED');
if (sampleFiltered.indexOf('Leader: ガチ') < 0) throw new Error('SAMPLE_LEADER_REMOVED');
if (count(wrapperText, 'fetch(') !== 0) throw new Error('FETCH_FOUND_IN_INSERTED_WRAPPER');
if (count(wrapperText, 'XMLHttpRequest') !== 0) throw new Error('XMLHTTP_FOUND_IN_INSERTED_WRAPPER');

fs.writeFileSync(verifyOut, verify.join('\n') + '\n');
