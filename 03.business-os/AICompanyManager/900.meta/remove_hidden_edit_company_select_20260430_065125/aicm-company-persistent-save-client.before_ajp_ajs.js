/* ============================================================
 * AICompanyManager company persistent save client
 * Phase AIK-AIN button-only clean version
 *
 * This file must NOT observe the whole UI.
 * It only attaches to:
 * - data-action="add-company"
 * - data-action="save-company"
 *
 * It must NOT touch:
 * - data-action="switch-company"
 * - data-screen navigation
 * - AI企業を表示
 * - AI企業設定
 * - dashboard tabs
 * ============================================================ */

(function (global) {
  "use strict";

  var MARK = "AICM_COMPANY_SAVE_CLIENT_BUTTON_ONLY_AIK_AIN_V1";
  var API_URL = global.AICM_COMPANY_WRITE_API_URL || "http://127.0.0.1:8796";
  var BOUND_ATTR = "data-aicm-company-save-bound";

  function byId(id) {
    return document.getElementById(id);
  }

  function value(id) {
    var el = byId(id);
    return el && typeof el.value === "string" ? el.value.trim() : "";
  }

  function isCompanySaveAction(action) {
    return action === "add-company" || action === "save-company";
  }

  function buildPayload(action) {
    if (action === "add-company") {
      return {
        action: "add-company",
        company_name: value("new-company-name"),
        business_domain: value("new-company-domain")
      };
    }

    if (action === "save-company") {
      return {
        action: "save-company",
        company_id: value("edit-company-select") || value("company-select"),
        company_name: value("edit-company-name"),
        business_domain: value("edit-company-domain"),
        company_status: "active"
      };
    }

    return {
      action: action || ""
    };
  }

  function toast(message) {
    var box = byId("aicm-company-save-client-toast");

    if (!box) {
      box = document.createElement("div");
      box.id = "aicm-company-save-client-toast";
      box.style.position = "fixed";
      box.style.left = "12px";
      box.style.right = "12px";
      box.style.bottom = "18px";
      box.style.zIndex = "9999";
      box.style.padding = "10px 12px";
      box.style.borderRadius = "12px";
      box.style.background = "#eef6ff";
      box.style.color = "#164e63";
      box.style.fontWeight = "700";
      box.style.boxShadow = "0 8px 24px rgba(15,23,42,.18)";
      document.body.appendChild(box);
    }

    box.textContent = message;
    clearTimeout(box.__aicmTimer);
    box.__aicmTimer = setTimeout(function () {
      if (box && box.parentNode) {
        box.parentNode.removeChild(box);
      }
    }, 1800);
  }

  function postCompanySave(action, payload) {
    if (!global.fetch) {
      toast("company save client: fetch unavailable");
      return;
    }

    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        source: "AICompanyManager",
        client_marker: MARK,
        action: action,
        payload: payload
      })
    }).then(function (response) {
      if (!response.ok) {
        toast("company save client: save request failed " + response.status);
        return null;
      }
      return response.json().catch(function () {
        return null;
      });
    }).then(function () {
      toast("company save client: save requested");
    }).catch(function (error) {
      toast("company save client: " + String(error && error.message ? error.message : error));
    });
  }

  function onCompanySaveClick(event) {
    var button = this;
    var action = button && button.getAttribute ? button.getAttribute("data-action") : "";

    if (!isCompanySaveAction(action)) {
      return;
    }

    if (event && event.preventDefault) {
      event.preventDefault();
    }

    /*
     * Do not stop propagation.
     * phase-de-dh local UI action may still need to run.
     * This client only adds persistence request for exact company save buttons.
     */
    postCompanySave(action, buildPayload(action));
  }

  function wireCompanySaveButtons(root) {
    var scope = root || document;
    var buttons;
    var i;

    if (!scope.querySelectorAll) {
      return;
    }

    buttons = scope.querySelectorAll('[data-action="add-company"],[data-action="save-company"]');

    for (i = 0; i < buttons.length; i += 1) {
      if (buttons[i].getAttribute(BOUND_ATTR) === "1") {
        continue;
      }

      buttons[i].setAttribute(BOUND_ATTR, "1");
      buttons[i].addEventListener("click", onCompanySaveClick, false);
    }
  }

  function start() {
    wireCompanySaveButtons(document);

    if (global.MutationObserver && document.body) {
      new MutationObserver(function (mutations) {
        var i;
        for (i = 0; i < mutations.length; i += 1) {
          if (mutations[i].addedNodes && mutations[i].addedNodes.length) {
            wireCompanySaveButtons(document);
            return;
          }
        }
      }).observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, false);
  } else {
    start();
  }

  global.AICM = global.AICM || {};
  global.AICM.CompanySaveClientButtonOnly = {
    marker: MARK,
    wire: wireCompanySaveButtons
  };
})(window);
