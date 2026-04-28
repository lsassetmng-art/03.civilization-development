/* AICM_BUSINESSOS_DB_COMPANY_BINDING_SCREEN_SCOPED_PERSISTENT_V3 */
(function () {
  "use strict";

  var API_URL = "./api/aicm/structure-map";
  var CARD_ID = "aicm-businessos-db-company-binding-card";
  var SELECT_ID = "aicm-db-company-binding-select";
  var STORAGE_KEY = "aicm_businessos_db_company_binding_id";
  var TIMER = null;
  var OBSERVER = null;
  var COMPANIES = [];
  var FETCHED = false;
  var RENDERING = false;

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pick(row, keys) {
    var i;
    for (i = 0; i < keys.length; i += 1) {
      if (row && row[keys[i]] != null && row[keys[i]] !== "") return row[keys[i]];
    }
    return "";
  }

  function companyId(row) {
    return String(pick(row, ["company_id", "id", "aicm_company_id", "uuid"]));
  }

  function companyName(row) {
    return String(pick(row, ["company_name", "name", "display_name", "title"]));
  }

  function storedCompanyId() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "";
    } catch (error) {
      return "";
    }
  }

  function storeCompanyId(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value || "");
    } catch (error) {}
  }

  function localUiCompanyText() {
    var select = document.getElementById("company-select") || document.getElementById("edit-company-select");
    if (select && select.selectedIndex >= 0 && select.options && select.options[select.selectedIndex]) {
      return select.options[select.selectedIndex].textContent || "";
    }
    return "";
  }

  function dispatchChange(node) {
    try {
      node.dispatchEvent(new Event("change", { bubbles: true }));
    } catch (error) {
      var event = document.createEvent("Event");
      event.initEvent("change", true, true);
      node.dispatchEvent(event);
    }
  }

  function bodyText() {
    return (document.body && document.body.textContent ? document.body.textContent : "").replace(/\s+/g, " ");
  }

  function isSettingsScreen() {
    var text = bodyText();

    if (text.indexOf("AI企業設定") < 0) return false;
    if (text.indexOf("Presidentロボット") >= 0) return true;
    if (text.indexOf("会社事業方針をPresidentへ指示") >= 0) return true;
    if (text.indexOf("会社 変更・削除") >= 0) return true;

    return false;
  }

  function removeCardWhenWrongScreen() {
    var existing = document.getElementById(CARD_ID);
    if (existing && !isSettingsScreen()) {
      existing.parentNode.removeChild(existing);
    }
  }

  function findInsertPoint() {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".aicm-card"));
    var i;
    var text;

    for (i = 0; i < cards.length; i += 1) {
      text = (cards[i].textContent || "").replace(/\s+/g, " ");
      if (text.indexOf("Presidentロボット") >= 0 || text.indexOf("President robot") >= 0) {
        return cards[i];
      }
    }

    for (i = 0; i < cards.length; i += 1) {
      text = (cards[i].textContent || "").replace(/\s+/g, " ");
      if (text.indexOf("会社 変更・削除") >= 0 || text.indexOf("会社変更") >= 0) {
        return cards[i].nextElementSibling || cards[i];
      }
    }

    return null;
  }

  function selectedId(companies) {
    var stored = storedCompanyId();
    var i;
    var id;

    if (stored) {
      for (i = 0; i < companies.length; i += 1) {
        id = companyId(companies[i]);
        if (id === stored) return stored;
      }
    }

    if (companies.length === 1) {
      id = companyId(companies[0]);
      if (id) storeCompanyId(id);
      return id;
    }

    return "";
  }

  function render() {
    var existing;
    var insertPoint;
    var selected;
    var options;
    var html;
    var select;

    if (RENDERING) return;
    RENDERING = true;

    try {
      if (!isSettingsScreen()) {
        removeCardWhenWrongScreen();
        return;
      }

      if (!FETCHED) return;

      existing = document.getElementById(CARD_ID);
      insertPoint = findInsertPoint();

      if (!insertPoint && !existing) return;

      selected = selectedId(COMPANIES);

      options = ['<option value="">BusinessOS DB会社を選択</option>'].concat(COMPANIES.map(function (company) {
        var id = companyId(company);
        var name = companyName(company) || id;
        return '<option value="' + esc(id) + '"' + (id === selected ? " selected" : "") + '>' + esc(name + " / " + id) + '</option>';
      })).join("");

      html = [
        '<div class="aicm-card" id="' + CARD_ID + '" data-aicm-screen-scope="settings">',
        '<h2>BusinessOS DB会社バインド</h2>',
        '<p class="aicm-muted">永続保存前に、local UI会社ではなく BusinessOS DB の会社UUIDを明示選択します。</p>',
        '<div class="aicm-field"><label>BusinessOS DB会社</label><select id="' + SELECT_ID + '">' + options + '</select></div>',
        '<p class="aicm-muted">local UI会社: ' + esc(localUiCompanyText() || "未取得") + '</p>',
        '<p class="aicm-muted">DB会社候補: ' + esc(String(COMPANIES.length)) + '件 / DB保存なし / AI企業設定画面のみ表示</p>',
        '</div>'
      ].join("");

      if (existing) {
        existing.outerHTML = html;
      } else if (insertPoint) {
        insertPoint.insertAdjacentHTML("beforebegin", html);
      }

      select = document.getElementById(SELECT_ID);

      if (select) {
        select.onchange = function () {
          storeCompanyId(select.value || "");
          window.setTimeout(function () { dispatchChange(select); }, 50);
        };

        if (select.value) {
          storeCompanyId(select.value);
          select.setAttribute("data-aicm-db-company-binding-active", "true");
          window.setTimeout(function () { dispatchChange(select); }, 120);
        }
      }

      window.AICM_BUSINESSOS_DB_COMPANY_BINDING_STATUS = {
        ok: true,
        mode: "screen_scoped_persistent_v3",
        visible: !!document.getElementById(CARD_ID),
        screen_scope: "settings_only",
        company_count: COMPANIES.length,
        selected_company_id: select ? select.value : "",
        local_storage_company_id: storedCompanyId(),
        db_write: false,
        api_write: false
      };
    } finally {
      RENDERING = false;
    }
  }

  function fetchCompanies() {
    return fetch(API_URL, { cache: "no-store" })
      .then(function (res) {
        return res.json();
      })
      .then(function (body) {
        COMPANIES = body && Array.isArray(body.companies) ? body.companies : [];
        FETCHED = true;

        if (COMPANIES.length === 1) {
          storeCompanyId(companyId(COMPANIES[0]));
        }

        render();
      })
      .catch(function (error) {
        FETCHED = true;
        window.AICM_BUSINESSOS_DB_COMPANY_BINDING_STATUS = {
          ok: false,
          mode: "screen_scoped_persistent_v3",
          error: error && error.message ? error.message : String(error),
          db_write: false,
          api_write: false
        };
      });
  }

  function schedule(delay) {
    window.clearTimeout(TIMER);
    TIMER = window.setTimeout(function () {
      if (!FETCHED) {
        fetchCompanies();
      } else {
        render();
      }
    }, delay || 250);
  }

  function startObserver() {
    if (OBSERVER || !document.body || !window.MutationObserver) return;

    OBSERVER = new MutationObserver(function () {
      schedule(220);
    });

    OBSERVER.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  try {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        startObserver();
        schedule(300);
      });
    } else {
      startObserver();
      schedule(300);
    }

    window.addEventListener("load", function () {
      startObserver();
      schedule(400);
    });

    window.addEventListener("focus", function () {
      schedule(400);
    });

    document.addEventListener("click", function () {
      window.setTimeout(function () { schedule(250); }, 250);
    }, true);

    window.setTimeout(function () { schedule(800); }, 800);
    window.setTimeout(function () { schedule(1500); }, 1500);
    window.setTimeout(function () { schedule(3000); }, 3000);
  } catch (error) {
    window.AICM_BUSINESSOS_DB_COMPANY_BINDING_STATUS = {
      ok: false,
      mode: "screen_scoped_persistent_v3",
      error: error && error.message ? error.message : String(error)
    };
  }
}());
/* AICM_BUSINESSOS_DB_COMPANY_BINDING_SCREEN_SCOPED_PERSISTENT_V3_END */
