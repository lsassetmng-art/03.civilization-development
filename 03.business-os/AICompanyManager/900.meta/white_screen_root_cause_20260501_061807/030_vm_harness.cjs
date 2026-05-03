const fs = require("node:fs");
const vm = require("node:vm");

const coreFile = process.argv[2];
const src = fs.readFileSync(coreFile, "utf8");
const logs = [];

process.on("unhandledRejection", (reason) => {
  console.log("VM_UNHANDLED_REJECTION=" + (reason && reason.stack ? reason.stack : String(reason)));
});

process.on("uncaughtException", (error) => {
  console.log("VM_UNCAUGHT_EXCEPTION=" + (error && error.stack ? error.stack : String(error)));
});

function makeElement(id) {
  const el = {
    id: id || "",
    tagName: "div",
    style: {},
    children: [],
    attributes: {},
    files: [],
    options: [],
    selectedIndex: -1,
    value: "",
    textContent: "",
    innerText: "",
    classList: {
      add() {},
      remove() {},
      contains() { return false; }
    },
    _html: "",
    set innerHTML(value) {
      this._html = String(value || "");
      logs.push("innerHTML set id=" + this.id + " len=" + this._html.length);
    },
    get innerHTML() {
      return this._html;
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    addEventListener(type, handler) {
      logs.push("addEventListener id=" + this.id + " type=" + type);
      this["on" + type] = handler;
    },
    getAttribute(name) {
      return this.attributes[name] || "";
    },
    setAttribute(name, value) {
      this.attributes[name] = String(value || "");
    },
    closest(selector) {
      if (selector === "[data-core-action]" && this.attributes["data-core-action"]) return this;
      return null;
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    remove() {}
  };
  return el;
}

const elements = {};
const root = makeElement("aicm-root");
elements["aicm-root"] = root;

const document = {
  readyState: "complete",
  body: makeElement("body"),
  head: makeElement("head"),
  createElement(tag) {
    const el = makeElement(tag);
    el.tagName = tag;
    return el;
  },
  getElementById(id) {
    return elements[id] || null;
  },
  addEventListener(type, handler) {
    logs.push("document.addEventListener type=" + type);
    if (type === "DOMContentLoaded" && typeof handler === "function") {
      handler();
    }
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  }
};

const localStorage = {
  _map: new Map(),
  getItem(key) {
    return this._map.has(key) ? this._map.get(key) : null;
  },
  setItem(key, value) {
    this._map.set(key, String(value || ""));
  },
  removeItem(key) {
    this._map.delete(key);
  }
};

const context = {
  console: {
    log: (...args) => logs.push("console.log " + args.join(" ")),
    warn: (...args) => logs.push("console.warn " + args.join(" ")),
    error: (...args) => logs.push("console.error " + args.join(" "))
  },
  document,
  localStorage,
  navigator: { userAgent: "vm-harness" },
  location: { href: "http://127.0.0.1:8794/", search: "" },
  fetch: async (url, options) => {
    logs.push("fetch url=" + url + " options=" + JSON.stringify(options || {}));
    return {
      ok: true,
      status: 200,
      json: async () => ({
        result: "ok",
        api_identifier: "VM_CONTEXT",
        owner_civilization_id: "00000000-0000-4000-8000-000000000001",
        companies: [],
        departments: [],
        sections: [],
        placements: [],
        task_ledger: [],
        pmlw_president_policies: [],
        pmlw_major_items: [],
        pmlw_middle_items: [],
        pmlw_deliverable_requirements: [],
        pmlw_worker_work_units: [],
        pmlw_workflow_tree: [],
        review_wait_items: [],
        robot_catalog: []
      }),
      text: async () => ""
    };
  },
  setTimeout: (fn) => {
    if (typeof fn === "function") fn();
    return 1;
  },
  clearTimeout: () => {},
  URL,
  Blob: globalThis.Blob || function Blob() {},
  FileReader: function FileReader() {
    this.readAsText = function () {};
  }
};

context.window = context;
context.self = context;
context.globalThis = context;

try {
  vm.createContext(context);
  vm.runInContext(src, context, { filename: coreFile, timeout: 3000 });
  console.log("VM_STATUS=OK");
} catch (error) {
  console.log("VM_STATUS=ERROR");
  console.log("VM_ERROR_NAME=" + error.name);
  console.log("VM_ERROR_MESSAGE=" + error.message);
  console.log("VM_ERROR_STACK_START");
  console.log(String(error.stack || error).split("\n").slice(0, 30).join("\n"));
  console.log("VM_ERROR_STACK_END");
}

setTimeout(() => {
  console.log("VM_LOGS_START");
  console.log(logs.slice(0, 260).join("\n"));
  console.log("VM_LOGS_END");
  console.log("ROOT_HTML_LEN=" + String(root.innerHTML || "").length);
  console.log("ROOT_HTML_HEAD=" + String(root.innerHTML || "").slice(0, 800).replace(/\n/g, "\\n"));
}, 50);
