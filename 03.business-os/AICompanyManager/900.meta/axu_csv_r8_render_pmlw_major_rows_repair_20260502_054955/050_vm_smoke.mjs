import fs from 'node:fs';
import vm from 'node:vm';

const coreFile = process.env.CLEAN_CORE;
const src = fs.readFileSync(coreFile, 'utf8');

let root = { innerHTML: "" };
let listeners = {};

const document = {
  getElementById(id) {
    if (id === "app" || id === "root" || id === "aicm-root") return root;
    return null;
  },
  addEventListener(name, fn) {
    listeners[name] = fn;
  },
  createElement() {
    return {
      id: "",
      style: {},
      textContent: "",
      setAttribute() {},
      appendChild() {},
      remove() {},
      classList: { add() {}, remove() {} }
    };
  },
  body: { appendChild() {} },
  head: { appendChild() {} }
};

const fakeContext = {
  result: "ok",
  owner_civilization_id: "00000000-0000-4000-8000-000000000001",
  companies: [{ aicm_user_company_id: "wolf-company", company_name: "ウルフ" }],
  departments: [],
  sections: [],
  placements: [],
  task_ledger: [],
  review_wait_items: [],
  pmlw_major_items: [{
    aicm_user_company_id: "wolf-company",
    aicm_manager_major_work_item_id: "major-1",
    major_item_name: "CSV表示テスト大項目",
    major_item_description: "CSVから取り込んだ大項目",
    department_name: "遠吠え部",
    section_name: "遠吠え課",
    priority_code: "urgent",
    due_date: null,
    handoff_status_code: "draft",
    display_order: 100
  }]
};

const context = {
  console,
  window: {},
  document,
  localStorage: {
    getItem(key) {
      if (String(key).indexOf("selectedCompanyId") >= 0) return "wolf-company";
      return null;
    },
    setItem() {},
    removeItem() {}
  },
  navigator: {},
  location: { href: "" },
  fetch: async () => ({
    ok: true,
    json: async () => fakeContext
  }),
  setTimeout(fn) {
    if (typeof fn === "function") fn();
    return 1;
  },
  clearTimeout() {}
};

context.window = context;

let error = null;

try {
  vm.runInNewContext(src, context, { filename: coreFile });
} catch (e) {
  error = e;
}

console.log("VM_ERROR=" + (error ? (error.stack || error.message) : ""));
console.log("VM_LISTENERS=" + Object.keys(listeners).join(","));
console.log("ROOT_LENGTH=" + root.innerHTML.length);
console.log("HAS_TEST_MAJOR=" + String(root.innerHTML.indexOf("CSV表示テスト大項目") >= 0));
console.log("HAS_HANDOFF_BUTTON=" + String(root.innerHTML.indexOf("課長へ送る") >= 0));
console.log("HAS_EMPTY_TEXT=" + String(root.innerHTML.indexOf("登録済み大項目はまだありません") >= 0));
