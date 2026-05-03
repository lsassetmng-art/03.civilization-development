import fs from 'node:fs';

const corePath = process.argv[2];
if (!corePath) {
  console.error('ERROR: core path missing');
  process.exit(1);
}

let text = fs.readFileSync(corePath, 'utf8');

const START = '// AICM_R8Z_C_OUTPUT_VISIBILITY_PANEL_START';
const END = '// AICM_R8Z_C_OUTPUT_VISIBILITY_PANEL_END';

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

const before = {
  marker: count(text, 'AICM_R8Z_C_OUTPUT_VISIBILITY_PANEL'),
  injectFunction: count(text, 'function aicmInjectPmlwAutoOutputsPanelR8ZC'),
  oldAppendToMain: count(text, "source.replace('</main>', panel + '</main>')"),
  csvPanelLabel: count(text, 'CSV取り込み'),
  outputLabel: count(text, 'Leader以降の出力')
};

if (before.marker < 2) throw new Error('R8Z-C marker missing');
if (before.injectFunction !== 1) throw new Error('inject function count invalid: ' + before.injectFunction);

const oldFunction = `  function aicmInjectPmlwAutoOutputsPanelR8ZC(html) {
    var panel = aicmRenderPmlwAutoOutputsPanelR8ZC();
    var source = String(html || "");

    if (source.indexOf('</main>') >= 0) {
      return source.replace('</main>', panel + '</main>');
    }

    return source + panel;
  }`;

const newFunction = `  function aicmInjectPmlwAutoOutputsPanelR8ZC(html) {
    var panel = aicmRenderPmlwAutoOutputsPanelR8ZC();
    var source = String(html || "");

    // AICM_R8Z_C2_OUTPUT_PANEL_POSITION_V1
    // Prefer showing this directly after Manager大項目サマリ and before CSV/import/list sections.
    var anchors = [
      '<section class="aicm-core-card aicm-csv-panel">',
      '<section class="aicm-core-card"><p class="aicm-eyebrow">Manager大項目</p>',
      '<section class="aicm-core-card">\\n  <p class="aicm-eyebrow">Manager大項目</p>',
      '<p class="aicm-eyebrow">CSV取り込み</p>'
    ];

    for (var i = 0; i < anchors.length; i += 1) {
      var anchor = anchors[i];
      var index = source.indexOf(anchor);

      if (index >= 0) {
        return source.slice(0, index) + panel + source.slice(index);
      }
    }

    if (source.indexOf('</main>') >= 0) {
      return source.replace('</main>', panel + '</main>');
    }

    return source + panel;
  }`;

if (!text.includes(oldFunction)) {
  throw new Error('old inject function exact block not found; review required');
}

text = text.replace(oldFunction, newFunction);

const after = {
  marker: count(text, 'AICM_R8Z_C_OUTPUT_VISIBILITY_PANEL'),
  c2Marker: count(text, 'AICM_R8Z_C2_OUTPUT_PANEL_POSITION_V1'),
  injectFunction: count(text, 'function aicmInjectPmlwAutoOutputsPanelR8ZC'),
  oldAppendToMain: count(text, "source.replace('</main>', panel + '</main>')"),
  csvAnchor: count(text, 'aicm-csv-panel'),
  managerAnchor: count(text, 'Manager大項目'),
  outputLabel: count(text, 'Leader以降の出力')
};

if (after.c2Marker !== 1) throw new Error('C2 marker missing');
if (after.injectFunction !== 1) throw new Error('inject function count invalid after: ' + after.injectFunction);
if (after.csvAnchor < 1) throw new Error('csv anchor missing');
if (after.outputLabel < 1) throw new Error('output label missing');

fs.writeFileSync(corePath, text, 'utf8');

console.log(JSON.stringify({
  status: 'PATCHED',
  before,
  after,
  core_file_write: 'YES',
  server_file_write: 'NO',
  api_post: 'NO',
  db_write: 'NO',
  persistent_db_write: 'NO'
}, null, 2));
