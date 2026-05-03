import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const MARK = "AICM_COMPANY_SAVE_CLIENT_EXACT_BUTTON_SCOPE_AHU_AHX_V1";

if (src.includes(MARK)) {
  console.log("already patched");
  process.exit(0);
}

const guard = [
  '    /* ' + MARK + ': company save client handles only exact save actions */',
  '    var aicmCompanySaveTarget = event && event.target && event.target.closest ? event.target.closest("[data-action]") : null;',
  '    var aicmCompanySaveAction = aicmCompanySaveTarget ? aicmCompanySaveTarget.getAttribute("data-action") : "";',
  '    if (aicmCompanySaveAction !== "add-company" && aicmCompanySaveAction !== "save-company") {',
  '      return;',
  '    }'
].join("\n");

let patched = false;

/*
 * Preferred patch:
 * Insert allowlist guard at the top of the existing document click handler.
 */
const patterns = [
  /(document\.addEventListener\s*\(\s*"click"\s*,\s*function\s*\(\s*event\s*\)\s*\{)/,
  /(document\.addEventListener\s*\(\s*'click'\s*,\s*function\s*\(\s*event\s*\)\s*\{)/,
  /(document\.addEventListener\s*\(\s*"click"\s*,\s*function\s*\(\s*e\s*\)\s*\{)/,
  /(document\.addEventListener\s*\(\s*'click'\s*,\s*function\s*\(\s*e\s*\)\s*\{)/
];

for (const re of patterns) {
  if (re.test(src)) {
    src = src.replace(re, function (m) {
      const varName = m.includes("(e)") ? "e" : "event";
      return m + "\n" + guard.replaceAll("event", varName);
    });
    patched = true;
    break;
  }
}

/*
 * Fallback:
 * If the file uses addEventListener with a named handler or unusual format,
 * install a very small self-scoping wrapper at the top of this file.
 * It wraps document/window click handlers registered by this file and allows
 * them to run only for add-company/save-company.
 */
if (!patched) {
  const wrapper = `
/* ${MARK}: fallback scoped listener wrapper */
(function () {
  "use strict";
  var originalAddEventListener = EventTarget.prototype.addEventListener;
  var restoreTimer = null;

  EventTarget.prototype.addEventListener = function (type, listener, options) {
    var target = this;
    var shouldWrap =
      type === "click" &&
      (target === document || target === window) &&
      typeof listener === "function";

    if (!shouldWrap) {
      return originalAddEventListener.call(target, type, listener, options);
    }

    var wrapped = function (event) {
      var el = event && event.target && event.target.closest ? event.target.closest("[data-action]") : null;
      var action = el ? el.getAttribute("data-action") : "";
      if (action !== "add-company" && action !== "save-company") {
        return;
      }
      return listener.apply(this, arguments);
    };

    return originalAddEventListener.call(target, type, wrapped, options);
  };

  restoreTimer = setTimeout(function () {
    EventTarget.prototype.addEventListener = originalAddEventListener;
  }, 0);
})();
`;
  src = wrapper + "\n" + src;
  patched = true;
  console.log("fallback wrapper applied");
} else {
  console.log("direct click handler guard applied");
}

fs.writeFileSync(file, src);
