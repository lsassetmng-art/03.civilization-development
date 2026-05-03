import fs from "node:fs";
import vm from "node:vm";

const coreFile = process.argv[2];
const code = fs.readFileSync(coreFile, "utf8");

const robots = [
  { robot_pool_id: "rp-president", selector_label: "President推奨", display_name: "President", aiworker_model_code: "HD-R5P", recommended_role_codes: ["president"], usable_quantity: 1 },
  { robot_pool_id: "rp-manager", selector_label: "Manager推奨", display_name: "Manager", aiworker_model_code: "HD-R5", recommended_role_codes: ["manager"], usable_quantity: 1 },
  { robot_pool_id: "rp-leader", selector_label: "Leader推奨", display_name: "Leader", aiworker_model_code: "HD-R4", recommended_role_codes: ["leader"], usable_quantity: 1 },
  { robot_pool_id: "rp-worker-1", selector_label: "Worker推奨1", display_name: "Worker1", aiworker_model_code: "HD-R3", recommended_role_codes: ["worker"], usable_quantity: 1 },
  { robot_pool_id: "rp-worker-2", selector_label: "Worker推奨2", display_name: "Worker2", aiworker_model_code: "BYD1-003", recommended_role_codes: ["worker"], usable_quantity: 1 },
  { robot_pool_id: "rp-other", selector_label: "その他に出してはいけない", display_name: "Other", aiworker_model_code: "HD-R1", recommended_role_codes: ["helper"], usable_quantity: 1 }
];

const contextJson = {
  result: "ok",
  companies: [{ aicm_user_company_id: "c1", company_name: "VM確認会社", company_status: "active", selected_flag: true }],
  departments: [{ aicm_user_company_department_id: "d1", aicm_user_company_id: "c1", department_name: "VM部門", department_status: "active" }],
  sections: [{ aicm_user_company_section_id: "s1", aicm_user_company_department_id: "d1", aicm_user_company_id: "c1", section_name: "VM課", section_status: "active" }],
  placements: [],
  robot_catalog: robots,
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
  for (const fn of (listeners.DOMContentLoaded || [])) await fn({ type: "DOMContentLoaded" });
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
    closest(selector) { return selector === "[data-core-action]" ? this : this; }
  };

  for (const fn of (rootListeners.click || [])) {
    await fn({ type: "click", target, preventDefault() {} });
    await Promise.resolve();
  }

  return String(root.innerHTML || "");
}

let sectionHtml = "";
try { sectionHtml = await click("go", "section-edit"); } catch (e) { errors.push("section edit: " + e.stack); }

function c(text) {
  return sectionHtml.split(text).length - 1;
}

console.log("VM_ERROR_COUNT=" + errors.length);
console.log("SECTION_HTML_LENGTH=" + sectionHtml.length);
console.log("OPTION_COUNT=" + c("<option"));
console.log("OTHER_CANDIDATE_VISIBLE=" + (sectionHtml.includes("その他に出してはいけない") ? 1 : 0));
console.log("OTHER_OPTGROUP_VISIBLE=" + (sectionHtml.includes("その他候補") ? 1 : 0));
console.log("RECOMMENDED_OPTGROUP_VISIBLE=" + (sectionHtml.includes("推奨候補") ? 1 : 0));
console.log("WORKER_SLOT_COUNT=" + c("data-worker-slot-index"));
console.log("WORKER_RECOMMENDED_VISIBLE=" + (sectionHtml.includes("Worker推奨") ? 1 : 0));
console.log("LEADER_RECOMMENDED_VISIBLE=" + (sectionHtml.includes("Leader推奨") ? 1 : 0));
console.log("");
console.log("---- ERRORS ----");
for (const e of errors.slice(0, 20)) console.log(e);
