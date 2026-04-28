/* AICM_WORKER_CHANGE_BUSINESSOS_DB_CANDIDATE_NORMALIZER_V2_FORCE_CLONE */
(function () {
  "use strict";

  var MARKER = "AICM_WORKER_CHANGE_BUSINESSOS_DB_CANDIDATE_NORMALIZER_V2_FORCE_CLONE";
  var WORKER_MODEL_RE = /(HD-R3|BYD1-001|BYD1-002|BYD1-003|MG-NORN-001|MG-NORN-002|MG-NORN-003)/;
  var LEGACY_RE = /(Worker Alpha|Worker Beta)/;

  function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ""));
  }

  function optionText(option) {
    return String(option && option.textContent ? option.textContent : "");
  }

  function isLegacyOption(option) {
    return LEGACY_RE.test(optionText(option)) || /^aiw-worker-/i.test(String(option && option.value ? option.value : ""));
  }

  function isBusinessOsWorkerOption(option) {
    var text = optionText(option);
    var value = String(option && option.value ? option.value : "");

    if (!isUuid(value)) return false;
    if (text.indexOf("BusinessOS DB") < 0) return false;
    if (text.indexOf("Worker配置") >= 0) return true;
    if (text.indexOf("対応:") >= 0 && text.indexOf("Worker") >= 0) return true;
    if (WORKER_MODEL_RE.test(text)) return true;

    return false;
  }

  function hasLegacyOptions(select) {
    var i;

    if (!select || !select.options) return false;

    for (i = 0; i < select.options.length; i += 1) {
      if (isLegacyOption(select.options[i])) return true;
    }

    return false;
  }

  function surroundingText(el) {
    var cur = el;
    var text = "";
    var depth = 0;

    while (cur && cur !== document.body && depth < 8) {
      text += " " + String(cur.textContent || "");
      cur = cur.parentElement;
      depth += 1;
    }

    return text;
  }

  function isWorkerChangeSelect(select) {
    var text;

    if (!select || select.tagName !== "SELECT") return false;

    text = surroundingText(select);

    if (hasLegacyOptions(select)) return true;
    if (text.indexOf("Workerロボット変更") >= 0) return true;
    if (text.indexOf("この配置を変更") >= 0 && text.indexOf("@Worker") >= 0) return true;

    return false;
  }

  function collectDbWorkerOptions() {
    var selects = Array.prototype.slice.call(document.querySelectorAll("select"));
    var seen = {};
    var out = [];
    var i;
    var j;
    var select;
    var option;
    var key;

    for (i = 0; i < selects.length; i += 1) {
      select = selects[i];

      for (j = 0; j < select.options.length; j += 1) {
        option = select.options[j];

        if (!isBusinessOsWorkerOption(option)) continue;

        key = String(option.value || "");
        if (seen[key]) continue;
        seen[key] = true;

        out.push({
          value: key,
          text: optionText(option)
        });
      }
    }

    out.sort(function (a, b) {
      return a.text.localeCompare(b.text);
    });

    return out;
  }

  function normalizeOne(select, candidates) {
    var current = String(select.value || "");
    var signature = candidates.map(function (x) { return x.value + ":" + x.text; }).join("|");
    var changed = false;
    var i;
    var option;
    var foundCurrent = false;

    if (!isWorkerChangeSelect(select)) return false;
    if (!candidates.length) return false;

    if (
      select.getAttribute("data-aicm-worker-change-force-db-clone") === signature &&
      !hasLegacyOptions(select)
    ) {
      return false;
    }

    while (select.firstChild) {
      select.removeChild(select.firstChild);
      changed = true;
    }

    option = document.createElement("option");
    option.value = "";
    option.textContent = "BusinessOS DB候補を選択";
    select.appendChild(option);

    for (i = 0; i < candidates.length; i += 1) {
      option = document.createElement("option");
      option.value = candidates[i].value;
      option.textContent = candidates[i].text;
      option.setAttribute("data-source", "BusinessOS DB");
      option.setAttribute("data-role", "Worker");
      option.setAttribute("data-aicm-worker-change-option", "1");

      if (current && current === candidates[i].value) {
        option.selected = true;
        foundCurrent = true;
      }

      select.appendChild(option);
    }

    if (!foundCurrent) select.value = "";

    select.setAttribute("data-aicm-worker-change-force-db-clone", signature);
    select.setAttribute("data-aicm-worker-change-normalized", "BusinessOS DB only");

    return true;
  }

  function normalizeAll() {
    var candidates = collectDbWorkerOptions();
    var selects = Array.prototype.slice.call(document.querySelectorAll("select"));
    var changed = 0;
    var targetCount = 0;
    var legacyRemaining = 0;
    var i;

    for (i = 0; i < selects.length; i += 1) {
      if (!isWorkerChangeSelect(selects[i])) continue;
      targetCount += 1;
      if (normalizeOne(selects[i], candidates)) changed += 1;
      if (hasLegacyOptions(selects[i])) legacyRemaining += 1;
    }

    window.AICM_WORKER_CHANGE_BUSINESSOS_DB_CANDIDATE_NORMALIZER_STATUS = {
      marker: MARKER,
      result: legacyRemaining === 0 && targetCount > 0 && candidates.length > 0 ? "OK" : "CHECK",
      candidate_count: candidates.length,
      target_select_count: targetCount,
      changed: changed,
      legacy_remaining_select_count: legacyRemaining,
      policy: "Worker change selects clone BusinessOS DB Worker options",
      local_worker_alpha_beta: "excluded"
    };
  }

  function normalizeEventTarget(event) {
    var select = event && event.target && event.target.closest ? event.target.closest("select") : null;
    var candidates;

    if (!select) return;
    if (!isWorkerChangeSelect(select)) return;

    candidates = collectDbWorkerOptions();
    normalizeOne(select, candidates);
  }

  function schedule() {
    normalizeAll();
    window.setTimeout(normalizeAll, 50);
    window.setTimeout(normalizeAll, 150);
    window.setTimeout(normalizeAll, 400);
    window.setTimeout(normalizeAll, 900);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule);
  } else {
    schedule();
  }

  ["pointerdown", "touchstart", "mousedown", "focus", "click", "change"].forEach(function (name) {
    document.addEventListener(name, normalizeEventTarget, true);
    document.addEventListener(name, schedule, true);
  });

  if (window.MutationObserver) {
    new MutationObserver(function () {
      schedule();
    }).observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  window.setInterval(normalizeAll, 500);
}());
