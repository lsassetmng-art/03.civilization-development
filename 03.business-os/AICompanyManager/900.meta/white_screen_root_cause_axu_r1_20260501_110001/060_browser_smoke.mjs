import fs from 'node:fs';
import vm from 'node:vm';

const coreFile = process.env.CLEAN_CORE;
const core = fs.readFileSync(coreFile, 'utf8');

let rootInnerHtml = '';
let errors = [];
let unhandled = [];

process.on('unhandledRejection', (error) => {
  unhandled.push(error && error.stack ? error.stack : String(error));
});

process.on('uncaughtException', (error) => {
  errors.push(error && error.stack ? error.stack : String(error));
});

function makeElement(tagName) {
  const listeners = {};
  return {
    tagName,
    style: {},
    dataset: {},
    children: [],
    classList: {
      add(){},
      remove(){},
      contains(){ return false; }
    },
    setAttribute(){},
    getAttribute(){ return ''; },
    appendChild(child){ this.children.push(child); return child; },
    removeChild(){},
    addEventListener(type, cb){ listeners[type] = cb; },
    removeEventListener(){},
    closest(){ return null; },
    querySelector(){ return null; },
    querySelectorAll(){ return []; },
    click(){},
    focus(){},
    value: '',
    files: [],
    textContent: '',
    get innerHTML(){ return this._innerHTML || ''; },
    set innerHTML(value){ this._innerHTML = String(value || ''); }
  };
}

const rootListeners = {};
const root = makeElement('div');
root.id = 'aicm-root';
root.addEventListener = function(type, cb) {
  rootListeners[type] = cb;
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

function contextPayload() {
  return {
    result: 'ok',
    owner_civilization_id: '00000000-0000-4000-8000-000000000001',
    companies: [
      {
        owner_civilization_id: '00000000-0000-4000-8000-000000000001',
        aicm_user_company_id: '00000000-0000-4000-8000-000000000101',
        company_name: 'SmokeCompany',
        company_status: 'active'
      }
    ],
    departments: [
      {
        owner_civilization_id: '00000000-0000-4000-8000-000000000001',
        aicm_user_company_id: '00000000-0000-4000-8000-000000000101',
        aicm_user_company_department_id: '00000000-0000-4000-8000-000000000201',
        department_name: 'SmokeDept',
        department_status: 'active'
      }
    ],
    sections: [
      {
        owner_civilization_id: '00000000-0000-4000-8000-000000000001',
        aicm_user_company_id: '00000000-0000-4000-8000-000000000101',
        aicm_user_company_department_id: '00000000-0000-4000-8000-000000000201',
        aicm_user_company_section_id: '00000000-0000-4000-8000-000000000301',
        section_name: 'SmokeSection',
        section_status: 'active'
      }
    ],
    placements: [],
    task_ledger: [],
    pmlw_president_policies: [],
    pmlw_major_items: [
      {
        owner_civilization_id: '00000000-0000-4000-8000-000000000001',
        aicm_user_company_id: '00000000-0000-4000-8000-000000000101',
        aicm_manager_major_work_item_id: '00000000-0000-4000-8000-000000000401',
        aicm_user_company_department_id: '00000000-0000-4000-8000-000000000201',
        aicm_user_company_section_id: '00000000-0000-4000-8000-000000000301',
        major_item_name: 'SmokeMajor',
        major_item_description: 'SmokeDescription',
        decomposition_status_code: 'not_started',
        handoff_status_code: 'draft',
        priority_code: 'normal',
        due_date: null,
        assigned_leader_label: 'SmokeLeader@Leader',
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
}

const document = {
  readyState: 'complete',
  body: makeElement('body'),
  head: makeElement('head'),
  documentElement: makeElement('html'),
  getElementById(id) {
    if (id === 'aicm-root') return root;
    return null;
  },
  createElement(tagName) {
    return makeElement(tagName);
  },
  createTextNode(text) {
    return { textContent: String(text || '') };
  },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  addEventListener(type, cb) {
    if (type === 'DOMContentLoaded' && typeof cb === 'function') cb();
  },
  removeEventListener() {}
};

document.body.appendChild = function(child) {
  return child;
};

document.head.appendChild = function(child) {
  return child;
};

const fakeFetch = async function(url) {
  const textUrl = String(url || '');
  if (textUrl.includes('/api/aicm/v2/context')) {
    return {
      ok: true,
      status: 200,
      json: async () => contextPayload(),
      text: async () => JSON.stringify(contextPayload())
    };
  }
  if (textUrl.includes('/api/aicm/v2/worker-runtime/pipeline-board')) {
    return {
      ok: true,
      status: 200,
      json: async () => ({ result: 'ok', payload: [] }),
      text: async () => JSON.stringify({ result: 'ok', payload: [] })
    };
  }
  return {
    ok: true,
    status: 200,
    json: async () => ({ result: 'ok' }),
    text: async () => JSON.stringify({ result: 'ok' })
  };
};

const context = {
  console,
  document,
  localStorage,
  sessionStorage: localStorage,
  fetch: fakeFetch,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  URL,
  URLSearchParams,
  Blob: class Blob {},
  FileReader: class FileReader {},
  FormData: class FormData {},
  navigator: { userAgent: 'node-smoke' },
  location: { href: 'http://127.0.0.1:8794/' },
  alert() {},
  confirm() { return true; }
};

context.window = context;
context.globalThis = context;
document.defaultView = context;

try {
  vm.runInNewContext(core, context, {
    filename: coreFile,
    timeout: 5000
  });
} catch (error) {
  errors.push(error && error.stack ? error.stack : String(error));
}

await new Promise((resolve) => setTimeout(resolve, 150));

console.log('SMOKE_ROOT_HTML_LENGTH=' + String(rootInnerHtml.length));
console.log('SMOKE_HAS_CORE_CLASS=' + String(rootInnerHtml.includes('aicm-core')));
console.log('SMOKE_LISTENERS=' + Object.keys(rootListeners).join(','));
console.log('SMOKE_SYNC_ERROR_COUNT=' + String(errors.length));
console.log('SMOKE_UNHANDLED_COUNT=' + String(unhandled.length));

if (errors.length) {
  console.log('============================================================');
  console.log('SMOKE_SYNC_ERRORS');
  console.log('============================================================');
  console.log(errors.join('\n---\n'));
}

if (unhandled.length) {
  console.log('============================================================');
  console.log('SMOKE_UNHANDLED_ERRORS');
  console.log('============================================================');
  console.log(unhandled.join('\n---\n'));
}

if (errors.length || unhandled.length || rootInnerHtml.length === 0) {
  process.exit(2);
}
