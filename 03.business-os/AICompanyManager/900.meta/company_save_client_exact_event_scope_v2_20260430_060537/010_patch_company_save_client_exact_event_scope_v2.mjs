import fs from "node:fs";

const file = process.argv[2];
let src = fs.readFileSync(file, "utf8");

const MARK = "AICM_COMPANY_SAVE_CLIENT_EXACT_EVENT_SCOPE_AHY_AIB_V2";

if (src.includes(MARK)) {
  console.log("already patched");
  process.exit(0);
}

/*
 * This wrapper is scoped to this file load.
 * It wraps document/window handlers registered by the company save client
 * and lets them run only when the touched/clicked element is an exact
 * company save action.
 *
 * Allowed:
 *   data-action="add-company"
 *   data-action="save-company"
 *
 * Ignored:
 *   data-action="switch-company"
 *   data-screen="settings"
 *   dashboard tabs
 *   all other navigation / UI clicks
 */
const prefix = [
  "/* " + MARK + " */",
  "(function (global) {",
  "  \"use strict\";",
  "  var originalAddEventListener = EventTarget.prototype.addEventListener;",
  "  var scopedEventTypes = { click: true, touchend: true, pointerup: true, submit: true, touchstart: true };",
  "",
  "  function nearestAction(event) {",
  "    var target = event && event.target ? event.target : null;",
  "    if (!target || !target.closest) return \"\";",
  "    var actionEl = target.closest(\"[data-action]\");",
  "    if (!actionEl || !actionEl.getAttribute) return \"\";",
  "    return actionEl.getAttribute(\"data-action\") || \"\";",
  "  }",
  "",
  "  function isCompanySaveEvent(event) {",
  "    var action = nearestAction(event);",
  "    return action === \"add-company\" || action === \"save-company\";",
  "  }",
  "",
  "  EventTarget.prototype.addEventListener = function (type, listener, options) {",
  "    var target = this;",
  "    var shouldScope =",
  "      scopedEventTypes[type] === true &&",
  "      (target === document || target === window) &&",
  "      typeof listener === \"function\";",
  "",
  "    if (!shouldScope) {",
  "      return originalAddEventListener.call(target, type, listener, options);",
  "    }",
  "",
  "    var wrapped = function (event) {",
  "      if (!isCompanySaveEvent(event)) {",
  "        return;",
  "      }",
  "      return listener.apply(this, arguments);",
  "    };",
  "",
  "    return originalAddEventListener.call(target, type, wrapped, options);",
  "  };",
  "",
  "  global.__AICM_RESTORE_COMPANY_SAVE_CLIENT_SCOPE__ = function () {",
  "    EventTarget.prototype.addEventListener = originalAddEventListener;",
  "  };",
  "})(window);",
  ""
].join("\n");

const suffix = [
  "",
  "/* " + MARK + "_RESTORE */",
  "(function (global) {",
  "  \"use strict\";",
  "  if (global.__AICM_RESTORE_COMPANY_SAVE_CLIENT_SCOPE__) {",
  "    global.__AICM_RESTORE_COMPANY_SAVE_CLIENT_SCOPE__();",
  "    try { delete global.__AICM_RESTORE_COMPANY_SAVE_CLIENT_SCOPE__; } catch (error) {}",
  "  }",
  "})(window);",
  ""
].join("\n");

src = prefix + src + suffix;

fs.writeFileSync(file, src);
console.log("company save client event scope v2 applied");
