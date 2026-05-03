import fs from "node:fs";
import vm from "node:vm";

const coreFile = process.argv[2];
const code = fs.readFileSync(coreFile, "utf8");

const contextJson = {
  result: "ok",
  api_identifier: "vm-harness",
  owner_civilization_id: "00000000-0000-4000-8000-000000000001",
  companies: [
    {
      aicm_user_company_id: "00000000-0000-4000-8000-000000000101",
      owner_civilization_id: "00000000-0000-4000-8000-000000000001",
      company_name: "VM確認会社",
      business_domain: "VM確認用",
      company_common_rules_text: "VMルール",
      president_policy_instruction_text: "VM方針",
      company_status: "active",
      selected_flag: true,
      created_at: "2026-04-30T00:00:00Z",
      updated_at: "2026-04-30T00:00:00Z"
    }
  ],
  departments: [],
  sections: [],
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
    closest() { return this; },
    addEventListener(type, fn) {
      rootListeners[type] = rootListeners[type] || [];
      rootListeners[type].push(fn);
      logs.push("element.addEventListener " + id + " " + type);
    },
    _innerHTML: "",
    set innerHTML(v) {
      this._innerHTML = String(v || "");
      logs.push("innerHTML " + id + " " + this._innerHTML.slice(0, 180).replace(/\s+/g, " "));
    },
    get innerHTML() {
      return this._innerHTML || "";
    }
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
    logs.push("document.addEventListener " + type);
  }
};

let fetchFn = async function fetch(url, options) {
  logs.push("fetch " + String(url) + " " + ((options && options.method) || "GET"));
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
    logs.push("window.addEventListener " + type);
  },
  removeEventListener() {},
  setTimeout,
  clearTimeout,
  prompt() { return ""; },
  URL: {
    createObjectURL() { return "blob:vm"; },
    revokeObjectURL() {}
  }
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
  Blob: class Blob {
    constructor(parts, opts) {
      this.parts = parts;
      this.opts = opts;
    }
  },
  localStorage: { getItem(){ return null; }, setItem(){}, removeItem(){} },
  sessionStorage: { getItem(){ return null; }, setItem(){}, removeItem(){} },
  navigator: { clipboard: { async writeText() {} } }
};

sandbox.globalThis = sandbox;
sandbox.self = sandbox.window;

try {
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: coreFile });
  logs.push("vm.runInContext ok");
} catch (e) {
  errors.push("vm.runInContext: " + (e && e.stack ? e.stack : String(e)));
}

try {
  const arr = listeners.DOMContentLoaded || [];
  for (const fn of arr) {
    await fn({ type: "DOMContentLoaded" });
  }
  logs.push("DOMContentLoaded ok");
} catch (e) {
  errors.push("DOMContentLoaded: " + (e && e.stack ? e.stack : String(e)));
}

const dashboardHtml = String(root.innerHTML || "");
let editHtml = "";

try {
  const clickListeners = rootListeners.click || [];
  const target = {
    getAttribute(name) {
      if (name === "data-core-action") return "company-edit-open";
      if (name === "data-screen") return "";
      return "";
    },
    closest() { return this; }
  };

  for (const fn of clickListeners) {
    await fn({ type: "click", target, preventDefault() {} });
  }

  editHtml = String(root.innerHTML || "");
} catch (e) {
  errors.push("company-edit-open click: " + (e && e.stack ? e.stack : String(e)));
}

console.log("VM_ERROR_COUNT=" + errors.length);
console.log("VM_LOG_COUNT=" + logs.length);
console.log("DASHBOARD_HTML_LENGTH=" + dashboardHtml.length);
console.log("DASHBOARD_HAS_COMPANY_OVERVIEW=" + (dashboardHtml.includes("会社概要") ? 1 : 0));
console.log("DASHBOARD_HAS_COMPANY_EDIT=" + (dashboardHtml.includes("企業情報を変更") ? 1 : 0));
console.log("EDIT_HTML_LENGTH=" + editHtml.length);
console.log("EDIT_HAS_COMPANY_EDIT=" + (editHtml.includes("企業情報を変更") ? 1 : 0));
console.log("EDIT_HAS_CONFIRMATION=" + (editHtml.includes("確認画面") ? 1 : 0));
console.log("");
console.log("---- ERRORS ----");
for (const e of errors.slice(0, 20)) console.log(e);
console.log("");
console.log("---- EDIT HEAD ----");
console.log(editHtml.slice(0, 1000));
