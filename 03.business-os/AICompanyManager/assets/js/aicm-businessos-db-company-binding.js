/* AICM_BUSINESSOS_DB_COMPANY_BINDING_V1 */
(function () {
  "use strict";

  var API_URL = "./api/aicm/structure-map";
  var CARD_ID = "aicm-businessos-db-company-binding-card";
  var SELECT_ID = "aicm-db-company-binding-select";
  var STORAGE_KEY = "aicm_businessos_db_company_binding_id";
  var TIMER = null;

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

    return cards.length ? cards[0] : document.body.firstChild;
  }

  function selectedStoredId(companies) {
    var stored = "";
    var i;

    try {
      stored = localStorage.getItem(STORAGE_KEY) || "";
    } catch (error) {
      stored = "";
    }

    if (stored) {
      for (i = 0; i < companies.length; i += 1) {
        if (companyId(companies[i]) === stored) return stored;
      }
    }

    if (companies.length === 1) return companyId(companies[0]);

    return "";
  }

  function render(companies) {
    var existing = document.getElementById(CARD_ID);
    var insertPoint;
    var selected = selectedStoredId(companies);
    var options;
    var html;
    var card;
    var select;

    options = ['<option value="">BusinessOS DB会社を選択</option>'].concat(companies.map(function (company) {
      var id = companyId(company);
      var name = companyName(company) || id;
      return '<option value="' + esc(id) + '"' + (id === selected ? " selected" : "") + '>' + esc(name + " / " + id) + '</option>';
    })).join("");

    html = [
      '<div class="aicm-card" id="' + CARD_ID + '">',
      '<h2>BusinessOS DB会社バインド</h2>',
      '<p class="aicm-muted">永続保存前に、local UI会社ではなく BusinessOS DB の会社UUIDを明示選択します。</p>',
      '<div class="aicm-field"><label>BusinessOS DB会社</label><select id="' + SELECT_ID + '">' + options + '</select></div>',
      '<p class="aicm-muted">local UI会社: ' + esc(localUiCompanyText() || "未取得") + '</p>',
      '<p class="aicm-muted">DB会社候補: ' + esc(String(companies.length)) + '件 / DB保存なし</p>',
      '</div>'
    ].join("");

    if (existing) {
      existing.outerHTML = html;
    } else {
      insertPoint = findInsertPoint();
      if (insertPoint && insertPoint.parentNode) {
        insertPoint.insertAdjacentHTML("beforebegin", html);
      } else {
        document.body.insertAdjacentHTML("afterbegin", html);
      }
    }

    card = document.getElementById(CARD_ID);
    select = document.getElementById(SELECT_ID);

    if (select) {
      select.addEventListener("change", function () {
        try {
          localStorage.setItem(STORAGE_KEY, select.value || "");
        } catch (error) {}
        window.setTimeout(function () { dispatchChange(select); }, 40);
      }, false);

      if (select.value) {
        select.setAttribute("data-aicm-db-company-binding-active", "true");
        window.setTimeout(function () { dispatchChange(select); }, 120);
      }
    }

    window.AICM_BUSINESSOS_DB_COMPANY_BINDING_STATUS = {
      ok: true,
      company_count: companies.length,
      selected_company_id: select ? select.value : "",
      db_write: false,
      api_write: false
    };
  }

  function fetchAndRender() {
    fetch(API_URL, { cache: "no-store" })
      .then(function (res) {
        return res.json();
      })
      .then(function (body) {
        var companies = body && Array.isArray(body.companies) ? body.companies : [];
        render(companies);
      })
      .catch(function (error) {
        window.AICM_BUSINESSOS_DB_COMPANY_BINDING_STATUS = {
          ok: false,
          error: error && error.message ? error.message : String(error)
        };
      });
  }

  function schedule() {
    window.clearTimeout(TIMER);
    TIMER = window.setTimeout(fetchAndRender, 300);
  }

  try {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", schedule);
    } else {
      schedule();
    }

    window.addEventListener("load", schedule);
    window.addEventListener("focus", schedule);
  } catch (error) {
    window.AICM_BUSINESSOS_DB_COMPANY_BINDING_STATUS = {
      ok: false,
      error: error && error.message ? error.message : String(error)
    };
  }
}());
/* AICM_BUSINESSOS_DB_COMPANY_BINDING_V1_END */
