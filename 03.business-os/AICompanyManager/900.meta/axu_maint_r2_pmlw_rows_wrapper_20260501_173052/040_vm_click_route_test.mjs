import fs from 'node:fs';
import vm from 'node:vm';

const coreFile = process.env.CLEAN_CORE;
const core = fs.readFileSync(coreFile, 'utf8');

let rootInnerHtml = '';
let rootListeners = {};
let syncErrors = [];
let unhandledErrors = [];

process.on('unhandledRejection', (error) => {
  unhandledErrors.push(error && error.stack ? error.stack : String(error));
});

function makeElement(tagName) {
  return {
    tagName,
    style: {},
    dataset: {},
    children: [],
    value: '',
    files: [],
    textContent: '',
    innerText: '',
    classList: { add(){}, remove(){}, contains(){ return false; } },
    attrs: {},
    setAttribute(name, value) { this.attrs[String(name)] = String(value); },
    getAttribute(name) { return this.attrs[String(name)] || ''; },
    appendChild(child) { this.children.push(child); return child; },
    remove(){},
    addEventListener(){},
    removeEventListener(){},
    closest(){ return null; },
    querySelector(){ return null; },
    querySelectorAll(){ return []; },
    focus(){},
    click(){}
  };
}

const root = makeElement('div');
root.id = 'aicm-root';

root.addEventListener = function(type, fn) {
  rootListeners[type] = fn;
};

Object.defineProperty(root, 'innerHTML', {
  get() { return rootInnerHtml; },
  set(value) { rootInnerHtml = String(value || ''); }
});

const storage = new Map();
const localStorage = {
  getItem(key) { return storage.has(String(key)) ? storage.get(String(key)) : null; },
  setItem(key, value) { storage.set(String(key), String(value)); },
  removeItem(key) { storage.delete(String(key)); },
  clear() { storage.clear(); }
};

const document = {
  readyState: 'complete',
  body: makeElement('body'),
  head: makeElement('head'),
  documentElement: makeElement('html'),
  getElementById(id) {
    if (id === 'aicm-root') return root;
    return null;
  },
  createElement(tagName) { return makeElement(tagName); },
  createTextNode(text) { return { textContent: String(text || '') }; },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  addEventListener(type, fn) {
    if (type === 'DOMContentLoaded' && typeof fn === 'function') fn();
  },
  removeEventListener(){}
};

document.body.appendChild = function(child) { return child; };
document.head.appendChild = function(child) { return child; };

const fakeContext = {
  result: 'ok',
  owner_civilization_id: '00000000-0000-4000-8000-000000000001',
  companies: [
    {
      owner_civilization_id: '00000000-0000-4000-8000-000000000001',
      aicm_user_company_id: '00000000-0000-4000-8000-000000000101',
      company_name: 'SmokeCompany',
      company_status: 'active',
      created_at: '2026-05-01T00:00:00Z',
      updated_at: '2026-05-01T00:00:00Z'
    }
  ],
  departments: [],
  sections: [],
  placements: [],
  task_ledger: [],
  pmlw_president_policies: [],
  pmlw_major_items: [
    {
      owner_civilization_id: '00000000-0000-4000-8000-000000000001',
      aicm_user_company_id: '00000000-0000-4000-8000-000000000101',
      aicm_manager_major_work_item_id: '00000000-0000-4000-8000-000000000401',
      major_item_name: 'SmokeMajor',
      major_item_description: 'Smoke major item',
      assigned_leader_label: 'SmokeLeader@Leader',
      decomposition_status_code: 'draft',
      handoff_status_code: 'draft',
      priority_code: 'normal',
      due_date: '',
      display_order: 1,
      created_at: '2026-05-01T00:00:00Z',
      updated_at: '2026-05-01T00:00:00Z'
    }
  ],
  pmlw_middle_items: [],
  pmlw_deliverable_requirements: [],
  pmlw_worker_work_units: [],
  pmlw_workflow_tree: [],
  review_wait_items: [],
  robot_catalog: []
};

const fetch = async function(url) {
  const text = String(url || '');
  if (text.includes('/api/aicm/v2/context')) {
    return { ok: true, status: 200, json: async () => fakeContext, text: async () => JSON.stringify(fakeContext) };
  }
  return { ok: true, status: 200, json: async () => ({ result: 'ok', payload: [] }), text: async () => '{"result":"ok"}' };
};

const context = {
  console,
  document,
  localStorage,
  sessionStorage: localStorage,
  fetch,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  URL,
  URLSearchParams,
  Blob: class Blob {},
  FileReader: class FileReader {},
  FormData: class FormData {},
  navigator: { userAgent: 'node-vm-click' },
  location: { href: 'http://127.0.0.1:8794/?vm=1' },
  alert(){},
  confirm(){ return true; }
};

context.window = context;
context.globalThis = context;
document.defaultView = context;

try {
  vm.runInNewContext(core, context, { filename: coreFile, timeout: 5000 });
} catch (error) {
  syncErrors.push(error && error.stack ? error.stack : String(error));
}

await new Promise((resolve) => setTimeout(resolve, 300));

const beforeClickHtml = rootInnerHtml;

const taskButton = makeElement('button');
taskButton.textContent = '部門別タスク台帳';
taskButton.innerText = '部門別タスク台帳';
taskButton.attrs = {
  'data-core-action': 'go',
  'data-screen': 'task-ledger'
};
taskButton.closest = function(selector) {
  if (String(selector).includes('[data-core-action]')) return taskButton;
  return taskButton;
};

try {
  if (typeof rootListeners.click === 'function') {
    rootListeners.click({
      target: taskButton,
      preventDefault(){},
      stopPropagation(){}
    });
  } else {
    syncErrors.push('root click listener missing');
  }
} catch (error) {
  syncErrors.push(error && error.stack ? error.stack : String(error));
}

await new Promise((resolve) => setTimeout(resolve, 100));

const afterClickHtml = rootInnerHtml;

console.log('VM_CLICK_LISTENERS=' + Object.keys(rootListeners).join(','));
console.log('VM_BEFORE_LENGTH=' + String(beforeClickHtml.length));
console.log('VM_AFTER_LENGTH=' + String(afterClickHtml.length));
console.log('VM_AFTER_HAS_TASK_LEDGER=' + String(afterClickHtml.includes('部門別タスク台帳')));
console.log('VM_AFTER_HAS_MANAGER_MAJOR=' + String(afterClickHtml.includes('Manager大項目')));
console.log('VM_AFTER_HAS_LEADER_HANDOFF=' + String(afterClickHtml.includes('課長へ送る')));
console.log('VM_SYNC_ERROR_COUNT=' + String(syncErrors.length));
console.log('VM_UNHANDLED_ERROR_COUNT=' + String(unhandledErrors.length));

if (syncErrors.length) {
  console.log('============================================================');
  console.log('VM_SYNC_ERRORS');
  console.log('============================================================');
  console.log(syncErrors.join('\n---\n'));
}

if (unhandledErrors.length) {
  console.log('============================================================');
  console.log('VM_UNHANDLED_ERRORS');
  console.log('============================================================');
  console.log(unhandledErrors.join('\n---\n'));
}

if (
  syncErrors.length ||
  unhandledErrors.length ||
  !afterClickHtml.includes('部門別タスク台帳') ||
  !afterClickHtml.includes('Manager大項目')
) {
  process.exit(2);
}
