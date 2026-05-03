import fs from 'node:fs';
import vm from 'node:vm';

const corePath = process.env.CORE;
const contextPath = process.env.CONTEXT_JSON;

const core = fs.readFileSync(corePath, 'utf8');
const context = JSON.parse(fs.readFileSync(contextPath, 'utf8'));

const wolf = (context.companies || []).find((c) => String(c.company_name || '') === 'ウルフ') || null;
const wolfId = wolf ? String(wolf.aicm_user_company_id || '') : '';

function arr(v) {
  return Array.isArray(v) ? v : [];
}

const allContextRows = []
  .concat(arr(context.pmlw_major_items))
  .concat(arr(context.manager_major_items))
  .concat(arr(context.major_items));

const wolfContextRows = allContextRows.filter((r) => String(r.aicm_user_company_id || '') === wolfId);

console.log('CONTEXT_COMPANIES=' + arr(context.companies).length);
console.log('WOLF_ID=' + wolfId);
console.log('CONTEXT_PMLW_MAJOR_ITEMS=' + arr(context.pmlw_major_items).length);
console.log('CONTEXT_MANAGER_MAJOR_ITEMS=' + arr(context.manager_major_items).length);
console.log('CONTEXT_MAJOR_ITEMS=' + arr(context.major_items).length);
console.log('CONTEXT_ALL_MAJOR_ROWS=' + allContextRows.length);
console.log('CONTEXT_WOLF_MAJOR_ROWS=' + wolfContextRows.length);
console.log('CONTEXT_FIRST_WOLF_ROW=' + JSON.stringify(wolfContextRows[0] || null));

let rootHtml = '';
let listeners = {};

const document = {
  getElementById(id) {
    if (id === 'aicm-root' || id === 'root' || id === 'app') {
      return {
        innerHTML: rootHtml,
        set innerHTML(value) {
          rootHtml = String(value || '');
        },
        get innerHTML() {
          return rootHtml;
        },
        addEventListener(type, fn) {
          listeners[type] = fn;
        }
      };
    }

    if (id === 'aicm-production-core-css') return null;

    return null;
  },
  querySelector() {
    return this.getElementById('aicm-root');
  },
  createElement() {
    return {
      id: '',
      textContent: '',
      setAttribute() {},
      appendChild() {},
      remove() {},
      click() {}
    };
  },
  body: {
    appendChild() {}
  },
  head: {
    appendChild() {}
  },
  addEventListener(type, fn) {
    listeners[type] = fn;
  }
};

const localStorage = {
  store: Object.create(null),
  getItem(key) {
    if (key === 'aicm.selectedCompanyId') return wolfId;
    if (key === 'selectedCompanyId') return wolfId;
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = String(value);
  },
  removeItem(key) {
    delete this.store[key];
  }
};

const sandbox = {
  console,
  window: {},
  document,
  localStorage,
  navigator: { clipboard: null },
  location: { search: '' },
  Blob: function Blob() {},
  URL: { createObjectURL() { return 'blob:test'; }, revokeObjectURL() {} },
  setTimeout(fn) { if (typeof fn === 'function') fn(); },
  clearTimeout() {},
  fetch: async (url) => {
    if (String(url).includes('/api/aicm/v2/context')) {
      return {
        ok: true,
        status: 200,
        json: async () => context,
        text: async () => JSON.stringify(context)
      };
    }

    return {
      ok: false,
      status: 404,
      json: async () => ({ result: 'error', message: 'not mocked: ' + url }),
      text: async () => 'not mocked'
    };
  }
};

sandbox.window = sandbox;
sandbox.globalThis = sandbox;

try {
  vm.runInNewContext(core, sandbox, { filename: corePath });

  if (sandbox.state) {
    sandbox.state.context = context;
    sandbox.state.selectedCompanyId = wolfId;
    sandbox.state.screen = 'task-ledger';
    sandbox.state.loading = false;
  }

  let rows = [];
  if (typeof sandbox.aicmGetManagerMajorRowsForSelectedCompany === 'function') {
    rows = sandbox.aicmGetManagerMajorRowsForSelectedCompany(wolfId);
  }

  console.log('ROWS_HELPER_TYPE=' + typeof sandbox.aicmGetManagerMajorRowsForSelectedCompany);
  console.log('RENDER_HELPER_TYPE=' + typeof sandbox.aicmRenderManagerMajorRows);
  console.log('PLACEHOLDER_TYPE=' + typeof sandbox.renderTaskLedgerPlaceholder);
  console.log('STATE_SELECTED_COMPANY_ID=' + (sandbox.state && sandbox.state.selectedCompanyId ? sandbox.state.selectedCompanyId : ''));
  console.log('STATE_CONTEXT_PMLW_MAJOR_ITEMS=' + (sandbox.state && sandbox.state.context && Array.isArray(sandbox.state.context.pmlw_major_items) ? sandbox.state.context.pmlw_major_items.length : -1));
  console.log('ROWS_RESULT=' + (Array.isArray(rows) ? rows.length : -1));
  console.log('ROWS_FIRST=' + JSON.stringify(Array.isArray(rows) ? (rows[0] || null) : null));
  console.log('DISPLAY_SCOPE=' + (sandbox.state && sandbox.state.__managerMajorDisplayScope ? sandbox.state.__managerMajorDisplayScope : ''));

  let renderHtml = '';
  if (typeof sandbox.aicmRenderManagerMajorRows === 'function') {
    renderHtml = sandbox.aicmRenderManagerMajorRows(rows);
  }

  console.log('RENDER_HTML_LENGTH=' + String(renderHtml || '').length);
  console.log('RENDER_HAS_EMPTY=' + String(renderHtml || '').includes('登録済み大項目はまだありません'));
  console.log('RENDER_HAS_PENDING_COUNT=' + String(renderHtml || '').includes('未実行大項目'));
  console.log('RENDER_HAS_HANDOFF=' + String(renderHtml || '').includes('pmlw-major-leader-handoff'));
  console.log('RENDER_HTML_HEAD=' + String(renderHtml || '').slice(0, 500).replace(/\n/g, '\\n'));

  if (typeof sandbox.renderTaskLedgerPlaceholder === 'function') {
    const pageHtml = sandbox.renderTaskLedgerPlaceholder();
    console.log('PLACEHOLDER_HTML_LENGTH=' + String(pageHtml || '').length);
    console.log('PLACEHOLDER_HAS_EMPTY=' + String(pageHtml || '').includes('登録済み大項目はまだありません'));
    console.log('PLACEHOLDER_HAS_PENDING_COUNT=' + String(pageHtml || '').includes('未実行大項目'));
    console.log('PLACEHOLDER_HAS_HANDOFF=' + String(pageHtml || '').includes('pmlw-major-leader-handoff'));
    console.log('PLACEHOLDER_HTML_HEAD=' + String(pageHtml || '').slice(0, 500).replace(/\n/g, '\\n'));
  }

  if (typeof sandbox.render === 'function') {
    sandbox.render();
    console.log('ROOT_HTML_LENGTH=' + rootHtml.length);
    console.log('ROOT_HAS_EMPTY=' + rootHtml.includes('登録済み大項目はまだありません'));
    console.log('ROOT_HAS_PENDING_COUNT=' + rootHtml.includes('未実行大項目'));
    console.log('ROOT_HAS_HANDOFF=' + rootHtml.includes('pmlw-major-leader-handoff'));
  }
} catch (error) {
  console.log('VM_ERROR=' + (error && error.stack ? error.stack : String(error)));
}
