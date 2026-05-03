import fs from "node:fs";
import vm from "node:vm";

const coreFile = process.argv[2];
const contextFile = process.argv[3];

const code = fs.readFileSync(coreFile, "utf8");

let contextJson = {
  result: "ok",
  api_identifier: "vm-harness",
  owner_civilization_id: "00000000-0000-4000-8000-000000000001",
  companies: [
    {
      aicm_user_company_id: "00000000-0000-4000-8000-000000000101",
      owner_civilization_id: "00000000-0000-4000-8000-000000000001",
      company_name: "VM確認会社",
      business_domain: "VM確認用",
      company_common_rules_text: "",
      president_policy_instruction_text: "",
      company_status: "active",
      selected_flag: true,
      created_at: "2026-04-30T00:00:00Z",
      updated_at: "2026-04-30T00:00:00Z"
    }
  ],
  departments: [
    {
      aicm_user_company_department_id: "00000000-0000-4000-8000-000000000201",
      aicm_user_company_id: "00000000-0000-4000-8000-000000000101",
      owner_civilization_id: "00000000-0000-4000-8000-000000000001",
      department_name: "VM部門",
      purpose: "VM確認",
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
      purpose: "VM確認",
      section_status: "active"
    }
  ],
  placements: [],
  task_ledger: [],
  pmlw_major_items: [],
  review_wait_items: [],
  robot_catalog: []
};

try {
  if (contextFile && fs.existsSync(contextFile)) {
    const parsed = JSON.parse(fs.readFileSync(contextFile, "utf8"));
    if (parsed && parsed.result === "ok") contextJson = parsed;
  }
} catch (_) {}

const logs = [];
const errors = [];
const listeners = {};
const rootListeners = {};
const elements = new Map();

function log(...args) {
  logs.push(args.map((x) => String(x)).join(" "));
}

function makeElement(id) {
  const el = {
    id,
    value: "",
    checked: false,
    style: {},
    classList: {
      add() {},
      remove() {},
      contains() { return false; }
    },
    setAttribute(k, v) { this[k] = v; },
    getAttribute(k) { return this[k] || ""; },
    appendChild() {},
    remove() {},
    click() {
      log("element.click", id);
    },
    closest() { return this; },
    addEventListener(type, fn) {
      rootListeners[type] = rootListeners[type] || [];
      rootListeners[type].push(fn);
      log("element.addEventListener", id, type);
    },
    dispatchEvent(evt) {
      const arr = rootListeners[evt.type] || [];
      for (const fn of arr) fn(evt);
    },
    _innerHTML: "",
    set innerHTML(v) {
      this._innerHTML = String(v || "");
      log("innerHTML", id, this._innerHTML.slice(0, 180).replace(/\s+/g, " "));
    },
    get innerHTML() {
      return this._innerHTML || "";
    }
  };

  return el;
}

const root = makeElement("aicm-root");
elements.set("aicm-root", root);

const document = {
  body: makeElement("body"),
  activeElement: null,
  createElement(tag) {
    return makeElement(tag + "-" + Math.random().toString(16).slice(2));
  },
  getElementById(id) {
    if (!elements.has(id)) elements.set(id, makeElement(id));
    return elements.get(id);
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
  addEventListener(type, fn) {
    listeners[type] = listeners[type] || [];
    listeners[type].push(fn);
    log("document.addEventListener", type);
  },
  dispatchEvent(evt) {
    const arr = listeners[evt.type] || [];
    for (const fn of arr) fn(evt);
  }
};

const window = {
  document,
  location: { href: "http://127.0.0.1:8794/?v=vm", search: "?v=vm" },
  addEventListener(type, fn) {
    listeners["window:" + type] = listeners["window:" + type] || [];
    listeners["window:" + type].push(fn);
    log("window.addEventListener", type);
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

async function fetch(url, options) {
  log("fetch", String(url), options && options.method ? options.method : "GET");
  if (options && options.method && options.method !== "GET") {
    return {
      ok: true,
      status: 200,
      async text() { return JSON.stringify({ result: "ok", api_identifier: "vm-harness-post" }); },
      async json() { return { result: "ok", api_identifier: "vm-harness-post" }; }
    };
  }

  return {
    ok: true,
    status: 200,
    async text() { return JSON.stringify(contextJson); },
    async json() { return contextJson; }
  };
}

const sandbox = {
  window,
  document,
  console: { log, error: (...args) => errors.push(args.map(String).join(" ")) },
  fetch,
  setTimeout,
  clearTimeout,
  URL: window.URL,
  Blob: class Blob {
    constructor(parts, opts) {
      this.parts = parts;
      this.opts = opts;
    }
  },
  localStorage: {
    getItem() { return null; },
    setItem() {},
    removeItem() {}
  },
  sessionStorage: {
    getItem() { return null; },
    setItem() {},
    removeItem() {}
  },
  navigator: {
    clipboard: {
      async writeText(text) {
        log("clipboard.writeText", String(text || "").slice(0, 80));
      }
    }
  }
};

sandbox.globalThis = sandbox;
sandbox.self = sandbox.window;

try {
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: coreFile });
  log("vm.runInContext", "ok");
} catch (e) {
  errors.push("vm.runInContext: " + (e && e.stack ? e.stack : String(e)));
}

async function fireDomLoaded() {
  try {
    const arr = listeners.DOMContentLoaded || [];
    for (const fn of arr) {
      await fn({ type: "DOMContentLoaded" });
    }
    log("DOMContentLoaded", "ok");
  } catch (e) {
    errors.push("DOMContentLoaded: " + (e && e.stack ? e.stack : String(e)));
  }
}

await fireDomLoaded();

console.log("VM_ERROR_COUNT=" + errors.length);
console.log("VM_LOG_COUNT=" + logs.length);
console.log("ROOT_HTML_LENGTH=" + String(root.innerHTML || "").length);
console.log("ROOT_CLICK_LISTENER_COUNT=" + (rootListeners.click || []).length);
console.log("ROOT_CHANGE_LISTENER_COUNT=" + (rootListeners.change || []).length);
console.log("");
console.log("---- ERRORS ----");
for (const e of errors.slice(0, 20)) console.log(e);
console.log("");
console.log("---- LOGS HEAD ----");
for (const l of logs.slice(0, 60)) console.log(l);
console.log("");
console.log("---- ROOT HEAD ----");
console.log(String(root.innerHTML || "").slice(0, 1200));
