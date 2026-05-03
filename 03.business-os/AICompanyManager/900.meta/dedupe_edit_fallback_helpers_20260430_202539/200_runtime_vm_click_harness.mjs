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
      company_common_rules_text: "VM共通ルール",
      president_policy_instruction_text: "VM方針",
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
  task_ledger: [],
  pmlw_major_items: [],
  review_wait_items: [],
  robot_catalog: []
};

const logs = [];
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
  clearTimeout,
  prompt() { return ""; },
  URL: { createObjectURL(){ return "blob:vm"; }, revokeObjectURL(){} }
};

const sandbox = {
  window,
  document,
  console: {
    log: (...args) => logs.push(args.map(String).join(" ")),
    error: (...args) => errors.push(args.map(String).join(" "))
  },
  fetch: fetchFn,
  setTimeout,
  clearTimeout,
  URL: window.URL,
  Blob: class Blob {},
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

async function click(action, screen, extraAttrs = {}) {
  const target = {
    getAttribute(name) {
      if (name === "data-core-action") return action;
      if (name === "data-screen") return screen || "";
      if (extraAttrs[name]) return extraAttrs[name];
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

let companyEditHtml = "";
let departmentEditHtml = "";
let sectionEditHtml = "";
let workerRouteHtml = "";

try {
  companyEditHtml = await click("company-edit-open", "");
} catch (e) {
  errors.push("company edit click: " + (e && e.stack ? e.stack : String(e)));
}

try {
  departmentEditHtml = await click("go", "department-edit");
} catch (e) {
  errors.push("department edit click: " + (e && e.stack ? e.stack : String(e)));
}

try {
  sectionEditHtml = await click("go", "section-edit");
} catch (e) {
  errors.push("section edit click: " + (e && e.stack ? e.stack : String(e)));
}

try {
  workerRouteHtml = await click("section-worker-update-open", "", {
    "data-section-id": "00000000-0000-4000-8000-000000000301"
  });
} catch (e) {
  errors.push("worker route click: " + (e && e.stack ? e.stack : String(e)));
}

console.log("VM_ERROR_COUNT=" + errors.length);
console.log("COMPANY_EDIT_HAS_FORM=" + (companyEditHtml.includes("企業情報を変更") ? 1 : 0));
console.log("COMPANY_EDIT_NEEDS_SELECTION=" + (companyEditHtml.includes("AI企業が選択されていません") ? 1 : 0));
console.log("DEPARTMENT_HAS_NAME_INPUT=" + (departmentEditHtml.includes("aicm-department-edit-name") ? 1 : 0));
console.log("DEPARTMENT_HAS_SAVE=" + (departmentEditHtml.includes("department-update-save") ? 1 : 0));
console.log("SECTION_HAS_NAME_INPUT=" + (sectionEditHtml.includes("aicm-section-edit-name") ? 1 : 0));
console.log("SECTION_HAS_SAVE=" + (sectionEditHtml.includes("section-update-save") ? 1 : 0));
console.log("SECTION_HAS_WORKER_UPDATE=" + (sectionEditHtml.includes("section-worker-update-open") ? 1 : 0));
console.log("WORKER_ROUTE_HTML_LENGTH=" + workerRouteHtml.length);
console.log("");
console.log("---- ERRORS ----");
for (const e of errors.slice(0, 20)) console.log(e);
console.log("");
console.log("---- COMPANY EDIT HEAD ----");
console.log(companyEditHtml.slice(0, 700));
console.log("");
console.log("---- DEPARTMENT HEAD ----");
console.log(departmentEditHtml.slice(0, 700));
console.log("");
console.log("---- SECTION HEAD ----");
console.log(sectionEditHtml.slice(0, 700));
