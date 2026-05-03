import fs from "node:fs";
import vm from "node:vm";

const coreFile = process.argv[2];
const code = fs.readFileSync(coreFile, "utf8");

const contextJson = {
  result: "ok",
  owner_civilization_id: "00000000-0000-4000-8000-000000000001",
  companies: [
    {
      aicm_user_company_id: "00000000-0000-4000-8000-000000000101",
      owner_civilization_id: "00000000-0000-4000-8000-000000000001",
      company_name: "VM確認会社",
      business_domain: "VM",
      company_status: "active",
      selected_flag: true
    }
  ],
  departments: [
    {
      aicm_user_company_department_id: "00000000-0000-4000-8000-000000000201",
      aicm_user_company_id: "00000000-0000-4000-8000-000000000101",
      owner_civilization_id: "00000000-0000-4000-8000-000000000001",
      department_name: "VM部門",
      purpose: "VM部門目的",
      department_status: "active"
    }
  ],
  sections: [
    {
      aicm_user_company_section_id: "00000000-0000-4000-8000-000000000301",
      aicm_user_company_department_id: "00000000-0000-4000-8000-000000000201",
      aicm_user_company_id: "00000000-0000-4000-8000-000000000101",
      owner_civilization_id: "00000000-0000-4000-8000-000000000001",
      section_name: "VM課",
      purpose: "VM課目的",
      section_status: "active"
    }
  ],
  placements: [],
  robot_catalog: [
    { robot_pool_id: "rp-president", aiworker_model_code: "HD-R5P", aiworker_model_name: "President VM" },
    { robot_pool_id: "rp-manager", aiworker_model_code: "HD-R5", aiworker_model_name: "Manager VM" },
    { robot_pool_id: "rp-leader", aiworker_model_code: "HD-R4", aiworker_model_name: "Leader VM" },
    { robot_pool_id: "rp-worker", aiworker_model_code: "HD-R3", aiworker_model_name: "Worker VM" }
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

let companyNewHtml = "";
let departmentNewHtml = "";
let sectionNewHtml = "";
let companyEditHtml = "";
let departmentEditHtml = "";
let sectionEditHtml = "";

try { companyNewHtml = await click("go", "company-new"); } catch (e) { errors.push("company new: " + e.stack); }
try { departmentNewHtml = await click("go", "department-new"); } catch (e) { errors.push("department new: " + e.stack); }
try { sectionNewHtml = await click("go", "section-new"); } catch (e) { errors.push("section new: " + e.stack); }
try { companyEditHtml = await click("company-edit-open", ""); } catch (e) { errors.push("company edit: " + e.stack); }
try { departmentEditHtml = await click("go", "department-edit"); } catch (e) { errors.push("department edit: " + e.stack); }
try { sectionEditHtml = await click("go", "section-edit"); } catch (e) { errors.push("section edit: " + e.stack); }

function has(html, text) {
  return String(html || "").includes(text) ? 1 : 0;
}

console.log("VM_ERROR_COUNT=" + errors.length);
console.log("COMPANY_NEW_HAS_PRESIDENT=" + has(companyNewHtml, "社長設定"));
console.log("DEPARTMENT_NEW_HAS_MANAGER=" + has(departmentNewHtml, "部長設定"));
console.log("SECTION_NEW_HAS_LEADER=" + has(sectionNewHtml, "課長設定"));
console.log("SECTION_NEW_HAS_WORKER=" + has(sectionNewHtml, "従業員設定"));
console.log("COMPANY_EDIT_HAS_PRESIDENT=" + has(companyEditHtml, "社長設定"));
console.log("DEPARTMENT_EDIT_HAS_MANAGER=" + has(departmentEditHtml, "部長設定"));
console.log("SECTION_EDIT_HAS_LEADER=" + has(sectionEditHtml, "課長設定"));
console.log("SECTION_EDIT_HAS_WORKER=" + has(sectionEditHtml, "従業員設定"));
console.log("ROLE_SETTING_OPEN_BUTTON_COUNT=" + ((companyNewHtml + departmentNewHtml + sectionNewHtml + companyEditHtml + departmentEditHtml + sectionEditHtml).split('role-setting-open').length - 1));
console.log("INLINE_SELECT_COUNT=" + ((companyNewHtml + departmentNewHtml + sectionNewHtml + companyEditHtml + departmentEditHtml + sectionEditHtml).split('data-inline-role-code').length - 1));
console.log("");
console.log("---- ERRORS ----");
for (const e of errors.slice(0, 20)) console.log(e);
