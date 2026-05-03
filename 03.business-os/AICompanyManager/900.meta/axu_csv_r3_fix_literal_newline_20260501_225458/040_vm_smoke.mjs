import fs from 'node:fs';
import vm from 'node:vm';

const src = fs.readFileSync(process.env.CLEAN_CORE, 'utf8');
let rootHtml = '';
let listeners = {};
let errors = [];

function el(tag) {
  return {
    tagName: String(tag || '').toUpperCase(),
    children: [],
    style: {},
    attributes: {},
    value: '',
    files: [],
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return this.attributes[k] || ''; },
    appendChild(c) { this.children.push(c); return c; },
    remove() {},
    click() {},
    closest() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener(t, f) { this.listeners = this.listeners || {}; this.listeners[t] = f; }
  };
}

const root = el('div');
Object.defineProperty(root, 'innerHTML', {
  get() { return rootHtml; },
  set(v) { rootHtml = String(v || ''); }
});

const document = {
  body: el('body'),
  createElement: el,
  getElementById(id) {
    if (id === 'app' || id === 'root' || id === 'aicm-root') return root;
    return null;
  },
  querySelector() { return root; },
  querySelectorAll() { return []; },
  addEventListener(type, fn) { listeners[type] = fn; }
};

const storage = {
  data: {},
  getItem(k) { return this.data[k] || null; },
  setItem(k, v) { this.data[k] = String(v); },
  removeItem(k) { delete this.data[k]; }
};

const context = {
  result: 'ok',
  owner_civilization_id: '00000000-0000-4000-8000-000000000001',
  companies: [{
    aicm_user_company_id: '8b9be487-7b74-4517-9b59-6c84a82ae6aa',
    company_name: 'ウルフ',
    company_status: 'active'
  }],
  departments: [],
  sections: [],
  worker_placements: [],
  pmlw_major_items: [],
  manager_major_items: [],
  review_wait_items: [],
  runtime_requests: []
};

const sandbox = {
  console,
  window: {},
  document,
  localStorage: storage,
  sessionStorage: storage,
  navigator: { clipboard: { writeText() { return Promise.resolve(); } } },
  location: { href: 'http://127.0.0.1:8794/' },
  Blob: class Blob {},
  URL: { createObjectURL() { return 'blob:mock'; }, revokeObjectURL() {} },
  FileReader: class FileReader {
    readAsText() {
      this.result = 'department_name,section_name,major_item_name,major_item_description,assigned_leader_label,priority_code,due_date,note\n開発部,UI課,UI整理,UIを整理する,,normal,,';
      if (this.onload) this.onload();
    }
  },
  fetch(url) {
    if (String(url || '').includes('/api/aicm/v2/context')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(context),
        text: () => Promise.resolve(JSON.stringify(context))
      });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ result: 'ok' }),
      text: () => Promise.resolve('ok')
    });
  },
  setTimeout(fn) { if (typeof fn === 'function') fn(); return 1; },
  clearTimeout() {},
  setInterval() { return 1; },
  clearInterval() {}
};

sandbox.window = sandbox;
sandbox.globalThis = sandbox;

try {
  vm.runInNewContext(src, sandbox, { filename: process.env.CLEAN_CORE, timeout: 5000 });
  if (listeners.DOMContentLoaded) {
    listeners.DOMContentLoaded({ type: 'DOMContentLoaded' });
  }
  if (listeners.load) {
    listeners.load({ type: 'load' });
  }
} catch (e) {
  errors.push(e && e.stack ? e.stack : String(e));
}

await new Promise(resolve => setTimeout(resolve, 10));

console.log('SMOKE_ROOT_HTML_LENGTH=' + String(rootHtml.length));
console.log('SMOKE_HAS_CORE_CLASS=' + String(rootHtml.includes('aicm-core')));
console.log('SMOKE_HAS_DASHBOARD=' + String(rootHtml.includes('AI企業ダッシュボード')));
console.log('SMOKE_SYNC_ERROR_COUNT=' + String(errors.length));
if (errors.length) {
  console.log('============================================================');
  console.log(errors.join('\n---\n'));
}
