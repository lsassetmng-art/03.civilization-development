import fs from "node:fs";
import vm from "node:vm";

const coreFile = process.argv[2];
const code = fs.readFileSync(coreFile, "utf8");

const errors = [];
const listeners = {};
const rootListeners = {};
const elements = new Map();

function makeElement(id) {
  return {
    id,
    value: "",
    style: {},
    classList: { add(){}, remove(){}, contains(){ return false; } },
    setAttribute(k, v) { this[k] = v; },
    getAttribute(k) { return this[k] || ""; },
    appendChild() {},
    remove() {},
    click() {},
    closest(selector) { return selector === "[data-core-action]" ? this : this; },
    addEventListener(type, fn) {
      rootListeners[type] = rootListeners[type] || [];
      rootListeners[type].push(fn);
    },
    _innerHTML: "",
    set innerHTML(v) { this._innerHTML = String(v || ""); },
    get innerHTML() { return this._innerHTML || ""; }
  };
}

const root = makeElement("aicm-root");
elements.set("aicm-root", root);

const contextJson = {
  result: "ok",
  owner_civilization_id: "00000000-0000-4000-8000-000000000001",
  companies: [{
    aicm_user_company_id: "00000000-0000-4000-8000-000000000101",
    company_name: "VM確認会社",
    business_domain: "VM事業",
    company_status: "active",
    selected_flag: true
  }],
  departments: [{
    aicm_user_company_department_id: "00000000-0000-4000-8000-000000000201",
    aicm_user_company_id: "00000000-0000-4000-8000-000000000101",
    department_name: "VM部門",
    purpose: "VM部門目的",
    department_status: "active"
  }],
  sections: [{
    aicm_user_company_section_id: "00000000-0000-4000-8000-000000000301",
    aicm_user_company_department_id: "00000000-0000-4000-8000-000000000201",
    aicm_user_company_id: "00000000-0000-4000-8000-000000000101",
    section_name: "VM課",
    purpose: "VM課目的",
    section_status: "active"
  }],
  placements: [],
  robot_catalog: [
    { robot_pool_id: "rp-president", selector_label: "President推奨", aiworker_model_code: "HD-R5P", recommended_role_codes: ["president"], usable_quantity: 1 },
    { robot_pool_id: "rp-manager", selector_label: "Manager推奨", aiworker_model_code: "HD-R5", recommended_role_codes: ["manager"], usable_quantity: 1 },
    { robot_pool_id: "rp-leader", selector_label: "Leader推奨", aiworker_model_code: "HD-R4", recommended_role_codes: ["leader"], usable_quantity: 1 },
    { robot_pool_id: "rp-worker", selector_label: "Worker推奨", aiworker_model_code: "HD-R3", recommended_role_codes: ["worker"], usable_quantity: 1 }
  ],
  task_ledger: [],
  pmlw_major_items: [],
  review_wait_items: []
};

const document = {
  body: makeElement("body"),
  createElement(tag) { return makeElement(tag); },
  getElementById(id) {
    if (!elements.has(id)) elements.set(id, makeElement(id));
    return elements.get(id);
  },
  querySelector() { return null; },
  querySelectorAll() { return []; },
  addEventListener(type, fn) {
    listeners[type] = listeners[type] || [];
    listeners[type].push(fn);
  }
};

const fetchFn = async () => ({
  ok: true,
  status: 200,
  async text() { return JSON.stringify(contextJson); },
  async json() { return contextJson; }
});

const sandbox = {
  window: {
    document,
    fetch: fetchFn,
    location: { href: "http://127.0.0.1:8794/?v=vm", search: "?v=vm" },
    addEventListener(type, fn) {
      listeners["window:" + type] = listeners["window:" + type] || [];
      listeners["window:" + type].push(fn);
    },
    removeEventListener() {},
    setTimeout,
    clearTimeout
  },
  document,
  console: { log(){}, error(){} },
  fetch: fetchFn,
  setTimeout,
  clearTimeout,
  localStorage: { getItem(){ return null; }, setItem(){}, removeItem(){} },
  sessionStorage: { getItem(){ return null; }, setItem(){}, removeItem(){} },
  navigator: { clipboard: { async writeText() {} } }
};

sandbox.globalThis = sandbox;
sandbox.self = sandbox.window;

try {
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: coreFile });
} catch (e) {
  errors.push("vm.runInContext: " + (e && e.stack ? e.stack : String(e)));
}

try {
  for (const fn of (listeners.DOMContentLoaded || [])) await fn({ type: "DOMContentLoaded" });
  await Promise.resolve();
  await Promise.resolve();
} catch (e) {
  errors.push("DOMContentLoaded: " + (e && e.stack ? e.stack : String(e)));
}

const html = String(root.innerHTML || "");

console.log("VM_ERROR_COUNT=" + errors.length);
console.log("ROOT_HTML_LENGTH=" + html.length);
console.log("HAS_OPERATION_CARD=" + (html.includes("aicm-operation-card") ? 1 : 0));
console.log("HAS_CONFIRM_WARNING=" + (html.includes("DBへ保存") ? 1 : 0));
console.log("");
console.log("---- ERRORS ----");
for (const e of errors.slice(0, 20)) console.log(e);
