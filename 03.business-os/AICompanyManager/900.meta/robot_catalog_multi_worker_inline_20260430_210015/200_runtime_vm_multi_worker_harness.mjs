import fs from "node:fs";
import vm from "node:vm";

const coreFile = process.argv[2];
const code = fs.readFileSync(coreFile, "utf8");

const contextJson = {
  result: "ok",
  owner_civilization_id: "00000000-0000-4000-8000-000000000001",
  companies: [
    { aicm_user_company_id: "c1", company_name: "VM確認会社", company_status: "active", selected_flag: true }
  ],
  departments: [
    { aicm_user_company_department_id: "d1", aicm_user_company_id: "c1", department_name: "VM部門", department_status: "active" }
  ],
  sections: [
    { aicm_user_company_section_id: "s1", aicm_user_company_department_id: "d1", aicm_user_company_id: "c1", section_name: "VM課", section_status: "active" }
  ],
  placements: [],
  robot_catalog: [
    { robot_pool_id: "rp-president", aiworker_model_code: "HD-R5P", aiworker_model_name: "President VM" },
    { robot_pool_id: "rp-manager", aiworker_model_code: "HD-R5", aiworker_model_name: "Manager VM" },
    { robot_pool_id: "rp-leader", aiworker_model_code: "HD-R4", aiworker_model_name: "Leader VM" },
    { robot_pool_id: "rp-worker-1", aiworker_model_code: "HD-R3", aiworker_model_name: "Worker VM 1" },
    { robot_pool_id: "rp-worker-2", aiworker_model_code: "BYD1-003", aiworker_model_name: "Worker VM 2" }
  ],
  task_ledger: [],
  pmlw_major_items: [],
  review_wait_items: []
};

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
    closest(selector) {
      if (selector === "[data-core-action]") return this;
      return this;
    },
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

const document = {
  body: makeElement("body"),
  activeElement: null,
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

let fetchFn = async function fetch(url, options) {
  return {
    ok: true,
    status: 200,
    async text() { return JSON.stringify(contextJson); },
    async json() { return contextJson; }
  };
};

const window = {
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
};

const sandbox = {
  window,
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
  const arr = listeners.DOMContentLoaded || [];
  for (const fn of arr) await fn({ type: "DOMContentLoaded" });
  await Promise.resolve();
  await Promise.resolve();
} catch (e) {
  errors.push("DOMContentLoaded: " + (e && e.stack ? e.stack : String(e)));
}

async function click(action, screen) {
  const target = {
    getAttribute(name) {
      if (name === "data-core-action") return action;
      if (name === "data-screen") return screen || "";
      return "";
    },
    closest(selector) {
      if (selector === "[data-core-action]") return this;
      return this;
    }
  };

  const arr = rootListeners.click || [];
  for (const fn of arr) {
    await fn({ type: "click", target, preventDefault() {} });
    await Promise.resolve();
  }

  return String(root.innerHTML || "");
}

let sectionHtml = "";
let afterAddHtml = "";

try { sectionHtml = await click("go", "section-edit"); } catch (e) { errors.push("section edit: " + e.stack); }
try { afterAddHtml = await click("inline-worker-slot-add", ""); } catch (e) { errors.push("worker add: " + e.stack); }

function countText(html, text) {
  return String(html || "").split(text).length - 1;
}

console.log("VM_ERROR_COUNT=" + errors.length);
console.log("SECTION_HAS_WORKER_SETTING=" + (sectionHtml.includes("従業員設定") ? 1 : 0));
console.log("WORKER_SELECT_COUNT_BEFORE=" + countText(sectionHtml, 'data-worker-slot-index'));
console.log("WORKER_SELECT_COUNT_AFTER_ADD=" + countText(afterAddHtml, 'data-worker-slot-index'));
console.log("WORKER_ADD_BUTTON_COUNT=" + countText(sectionHtml, 'inline-worker-slot-add'));
console.log("WORKER_OPTION_PRESENT=" + (sectionHtml.includes("Worker VM") ? 1 : 0));
console.log("NO_CANDIDATE_MESSAGE_PRESENT=" + (sectionHtml.includes("選択可能なロボット候補がありません") ? 1 : 0));
console.log("");
console.log("---- ERRORS ----");
for (const e of errors.slice(0, 20)) console.log(e);
