/* AICM_ROBOT_PLACEMENT_SAVE_CLIENT_DISABLED_UNTIL_COMPANY_CANONICAL_V1 */
(function () {
  "use strict";

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function cleanupGenericDbSaveButtons() {
    var selectors = [
      ".aicm-db-save-button-v1",
      ".aicm-db-save-status-v1",
      ".aicm-db-save-button-v2",
      ".aicm-db-save-status-v2",
      ".aicm-db-save-button-v3",
      ".aicm-db-save-status-v3",
      ".aicm-role-save-status-v1",
      ".aicm-role-save-status-v2"
    ].join(",");

    document.querySelectorAll(selectors).forEach(function (node) {
      node.remove();
    });

    Array.prototype.slice.call(document.querySelectorAll("button")).forEach(function (button) {
      if (normalizeText(button.textContent) === "DB本保存") {
        button.remove();
      }
    });
  }

  function start() {
    cleanupGenericDbSaveButtons();

    window.AICM_ROBOT_PLACEMENT_SAVE_CLIENT_DISABLED_STATUS = {
      marker: "AICM_ROBOT_PLACEMENT_SAVE_CLIENT_DISABLED_UNTIL_COMPANY_CANONICAL_V1",
      reason: "company_save_route_must_be_canonical_first",
      db_save_buttons_removed: true,
      role_button_db_save_binding: false
    };

    var timer = null;
    var observer = new MutationObserver(function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(cleanupGenericDbSaveButtons, 250);
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
