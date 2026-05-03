import fs from 'node:fs';
import vm from 'node:vm';

const coreFile = process.env.CLEAN_CORE;
const src = fs.readFileSync(coreFile, 'utf8');

const root = { innerHTML: "" };
const listeners = {};
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
      setAttribute() {},
      appendChild() {},
      remove() {},
      style: {},
      classList: { add() {}, remove() {} }
    };
  },
  body: {
    appendChild() {}
  },
  head: {
    appendChild() {}
  }
};

const context = {
  console,
  window: {},
  document,
  localStorage: {
    getItem() { return null; },
    setItem() {},
    removeItem() {}
  },
  navigator: {},
  location: { href: "" },
  fetch: async () => ({
    ok: true,
    json: async () => ({
      result: "ok",
      owner_civilization_id: "00000000-0000-4000-8000-000000000001",
      companies: [{ aicm_user_company_id: "company-1", company_name: "ウルフ" }],
      departments: [],
      sections: [],
      placements: [],
      task_ledger: [],
      review_wait_items: [],
      pmlw_major_items: [
        {
          aicm_user_company_id: "company-1",
          major_item_name: "CSV表示テスト",
          major_item_description: "表示確認",
          priority_code: "normal",
          handoff_status_code: "draft",
          display_order: 100
        }
      ]
    })
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
console.log("ROOT_LENGTH=" + String(root.innerHTML.length));
console.log("HAS_MAJOR_ITEM=" + String(root.innerHTML.indexOf("CSV表示テスト") >= 0));
console.log("HAS_EMPTY_MAJOR=" + String(root.innerHTML.indexOf("登録済み大項目はまだありません") >= 0));
