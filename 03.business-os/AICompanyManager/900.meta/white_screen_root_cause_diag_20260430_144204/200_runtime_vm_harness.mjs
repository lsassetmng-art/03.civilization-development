import fs from "node:fs";
import vm from "node:vm";

const coreFile = process.argv[2];
const source = fs.readFileSync(coreFile, "utf8");

const events = {};
const rootEvents = {};
const logs = [];
const errors = [];

function makeEl(id = "") {
  const el = {
    id,
    value: "",
    files: [],
    style: {},
    dataset: {},
    children: [],
    attributes: {},
    innerHTMLValue: "",
    textContent: "",
    className: "",
    set innerHTML(v) {
      this.innerHTMLValue = String(v || "");
      logs.push(["innerHTML", id, this.innerHTMLValue.slice(0, 200)]);
    },
    get innerHTML() {
      return this.innerHTMLValue;
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    remove() {},
    click() {
      logs.push(["click", id]);
    },
    addEventListener(type, fn) {
      rootEvents[type] = rootEvents[type] || [];
      rootEvents[type].push(fn);
      logs.push(["rootAddEventListener", id, type]);
    },
    getAttribute(name) {
      return this.attributes[name] || "";
    },
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    matches() {
      return false;
    }
  };

  if (id === "aicm-root") {
    el.addEventListener = function(type, fn) {
      rootEvents[type] = rootEvents[type] || [];
      rootEvents[type].push(fn);
      logs.push(["rootAddEventListener", id, type]);
    };
  }

  return el;
}

const elements = {
  "aicm-root": makeEl("aicm-root")
};

const document = {
  readyState: "loading",
  body: makeEl("body"),
  head: makeEl("head"),
  createElement(tag) {
    const el = makeEl(tag);
    el.tagName = String(tag || "").toUpperCase();
    return el;
  },
  getElementById(id) {
    if (!elements[id]) elements[id] = makeEl(id);
    return elements[id];
  },
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
  addEventListener(type, fn) {
    events[type] = events[type] || [];
    events[type].push(fn);
    logs.push(["documentAddEventListener", type]);
  }
};

const contextResponse = {
  result: "ok",
  api_identifier: "VM_STUB",
  owner_civilization_id: "00000000-0000-4000-8000-000000000001",
  companies: [
    {
      aicm_user_company_id: "11111111-1111-4111-8111-111111111111",
      company_name: "VM Test Company",
      business_domain: "diagnostic",
      company_status: "active"
    }
  ],
  departments: [
    {
      aicm_user_company_department_id: "22222222-2222-4222-8222-222222222222",
      aicm_user_company_id: "11111111-1111-4111-8111-111111111111",
      department_name: "開発部",
      department_status: "active"
    }
  ],
  sections: [
    {
      aicm_user_company_section_id: "33333333-3333-4333-8333-333333333333",
      aicm_user_company_department_id: "22222222-2222-4222-8222-222222222222",
      section_name: "UI課",
      section_status: "active"
    }
  ],
  placements: [],
  task_ledger: [],
  robot_catalog: []
};

const navigator = {
  clipboard: {
    async writeText(text) {
      logs.push(["clipboard.writeText", String(text || "").slice(0, 80)]);
    }
  }
};

const URLStub = {
  createObjectURL() {
    logs.push(["URL.createObjectURL"]);
    return "blob:vm";
  },
  revokeObjectURL(url) {
    logs.push(["URL.revokeObjectURL", url]);
  }
};

async function fetchStub(url, options) {
  logs.push(["fetch", String(url), options && options.method ? options.method : "GET"]);
  if (String(url).includes("/api/aicm/v2/context")) {
    return {
      ok: true,
      status: 200,
      async json() { return contextResponse; },
      async text() { return JSON.stringify(contextResponse); }
    };
  }

  if (String(url).includes("/api/aicm/v2/task-ledger/create")) {
    return {
      ok: true,
      status: 200,
      async json() { return { result: "ok", task_ledger: { id: "vm" } }; },
      async text() { return JSON.stringify({ result: "ok" }); }
    };
  }

  return {
    ok: false,
    status: 404,
    async json() { return { result: "error", error_message: "not found" }; },
    async text() { return "not found"; }
  };
}

const sandbox = {
  window: null,
  document,
  navigator,
  console: {
    log: (...args) => logs.push(["console.log", ...args]),
    error: (...args) => errors.push(["console.error", ...args]),
    warn: (...args) => logs.push(["console.warn", ...args])
  },
  fetch: fetchStub,
  Blob,
  URL: URLStub,
  setTimeout: (fn) => {
    if (typeof fn === "function") {
      try { fn(); } catch (e) { errors.push(["setTimeoutError", e && e.stack || String(e)]); }
    }
    return 1;
  },
  clearTimeout: () => {},
  Promise,
  Date,
  Array,
  Object,
  String,
  Number,
  Boolean,
  JSON,
  RegExp,
  Error,
  Map,
  Set
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;

async function run() {
  try {
    vm.createContext(sandbox);
    vm.runInContext(source, sandbox, { filename: coreFile });
    logs.push(["vm.runInContext", "ok"]);
  } catch (e) {
    errors.push(["vm.runInContext", e && e.stack || String(e)]);
  }

  if (events.DOMContentLoaded) {
    for (const fn of events.DOMContentLoaded) {
      try {
        const result = fn();
        if (result && typeof result.then === "function") await result;
        logs.push(["DOMContentLoaded", "ok"]);
      } catch (e) {
        errors.push(["DOMContentLoaded", e && e.stack || String(e)]);
      }
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 0));

  if (rootEvents.click && rootEvents.click.length) {
    const actionTargets = [
      "dashboard",
      "task-ledger"
    ];
    for (const screen of actionTargets) {
      for (const fn of rootEvents.click) {
        try {
          const target = makeEl("button");
          target.getAttribute = (name) => {
            if (name === "data-core-action") return "go";
            if (name === "data-screen") return screen;
            return "";
          };
          const result = fn({ target });
          if (result && typeof result.then === "function") await result;
          logs.push(["clickActionGo", screen, "ok"]);
        } catch (e) {
          errors.push(["clickActionGo", screen, e && e.stack || String(e)]);
        }
      }
    }
  }

  console.log("VM_ERROR_COUNT=" + errors.length);
  console.log("VM_LOG_COUNT=" + logs.length);
  console.log("ROOT_HTML_LENGTH=" + String(elements["aicm-root"].innerHTML || "").length);
  console.log("ROOT_CLICK_LISTENER_COUNT=" + ((rootEvents.click || []).length));
  console.log("ROOT_CHANGE_LISTENER_COUNT=" + ((rootEvents.change || []).length));
  console.log("");
  console.log("---- ERRORS ----");
  for (const item of errors) {
    console.log(JSON.stringify(item));
  }
  console.log("");
  console.log("---- LOGS HEAD ----");
  for (const item of logs.slice(0, 80)) {
    console.log(JSON.stringify(item));
  }
}

run().catch((e) => {
  console.log("VM_FATAL=" + (e && e.stack || String(e)));
});
