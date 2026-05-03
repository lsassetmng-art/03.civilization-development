import fs from 'node:fs';
import vm from 'node:vm';

const coreFile = process.env.CLEAN_CORE;
const src = fs.readFileSync(coreFile, 'utf8');

let rootHtml = '';
let listeners = {};
let syncErrors = [];
let unhandledErrors = [];

function makeElement(tag) {
  return {
    tagName: String(tag || '').toUpperCase(),
    children: [],
    style: {},
    attributes: {},
    className: '',
    id: '',
    innerHTML: '',
    textContent: '',
    value: '',
    files: [],
    dataset: {},
    setAttribute(name, value) {
      this.attributes[name] = String(value);
      if (name === 'id') this.id = String(value);
      if (name === 'class') this.className = String(value);
    },
    getAttribute(name) {
      return this.attributes[name] || '';
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    remove() {},
    addEventListener(type, fn) {
      this._listeners = this._listeners || {};
      this._listeners[type] = fn;
    },
    closest() {
      return null;
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    click() {}
  };
}

const root = makeElement('div');
root.id = 'app';

Object.defineProperty(root, 'innerHTML', {
  get() { return rootHtml; },
  set(v) { rootHtml = String(v || ''); }
});

const doc = {
  body: makeElement('body'),
  documentElement: makeElement('html'),
  createElement: makeElement,
  getElementById(id) {
    if (id === 'app' || id === 'root' || id === 'aicm-root') return root;
    return null;
  },
  querySelector(sel) {
    if (sel === '#app' || sel === '#root' || sel === '[data-aicm-root]') return root;
    return root;
  },
  querySelectorAll() {
    return [];
  },
  addEventListener(type, fn) {
    listeners[type] = fn;
  }
};

const storage = {
  data: {},
  getItem(k) { return this.data[k] || null; },
  setItem(k, v) { this.data[k] = String(v); },
  removeItem(k) { delete this.data[k]; }
};

const contextPayload = {
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
  document: doc,
  localStorage: storage,
  sessionStorage: storage,
  navigator: {
    clipboard: {
      writeText() { return Promise.resolve(); }
    }
  },
  location: { href: 'http://127.0.0.1:8794/' },
  Blob: class Blob {
    constructor(parts, opts) {
      this.parts = parts;
      this.opts = opts;
    }
  },
  URL: {
    createObjectURL() { return 'blob:mock'; },
    revokeObjectURL() {}
  },
  FileReader: class FileReader {
    readAsText() {
      this.result = 'department_name,section_name,major_item_name,major_item_description,assigned_leader_label,priority_code,due_date,note\n開発部,UI課,UI整理,UIを整理する,,normal,,';
      if (this.onload) this.onload();
    }
  },
  fetch(url) {
    const textUrl = String(url || '');
    if (textUrl.includes('/api/aicm/v2/context')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(contextPayload),
        text: () => Promise.resolve(JSON.stringify(contextPayload))
      });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ result: 'ok' }),
      text: () => Promise.resolve('ok')
    });
  },
  setTimeout(fn) {
    if (typeof fn === 'function') fn();
    return 1;
  },
  clearTimeout() {},
  setInterval() { return 1; },
  clearInterval() {}
};

sandbox.window = sandbox;
sandbox.globalThis = sandbox;

try {
  vm.runInNewContext(src, sandbox, { filename: coreFile, timeout: 5000 });

  if (listeners.DOMContentLoaded) {
    try {
      listeners.DOMContentLoaded({ type: 'DOMContentLoaded' });
    } catch (e) {
      syncErrors.push(e && e.stack ? e.stack : String(e));
    }
  }

  if (listeners.load) {
    try {
      listeners.load({ type: 'load' });
    } catch (e) {
      syncErrors.push(e && e.stack ? e.stack : String(e));
    }
  }
} catch (e) {
  syncErrors.push(e && e.stack ? e.stack : String(e));
}

await new Promise(resolve => setTimeout(resolve, 10));

console.log('SMOKE_ROOT_HTML_LENGTH=' + String(rootHtml.length));
console.log('SMOKE_HAS_CORE_CLASS=' + String(rootHtml.includes('aicm-core')));
console.log('SMOKE_HAS_DASHBOARD=' + String(rootHtml.includes('AI企業ダッシュボード')));
console.log('SMOKE_HAS_TASK_LEDGER=' + String(rootHtml.includes('部門別タスク台帳')));
console.log('SMOKE_HAS_CSV=' + String(rootHtml.includes('CSV')));
console.log('SMOKE_LISTENERS=' + Object.keys(listeners).sort().join(','));
console.log('SMOKE_SYNC_ERROR_COUNT=' + String(syncErrors.length));
console.log('SMOKE_UNHANDLED_COUNT=' + String(unhandledErrors.length));

if (syncErrors.length) {
  console.log('============================================================');
  console.log('SMOKE_SYNC_ERRORS');
  console.log('============================================================');
  console.log(syncErrors.join('\n---\n'));
}
