(function () {
  const backgrounds = {
    sunrise: "linear-gradient(135deg, #f59e0b, #ef4444)",
    forest: "linear-gradient(135deg, #10b981, #065f46)",
    night: "linear-gradient(135deg, #312e81, #0f172a)",
    ocean: "linear-gradient(135deg, #0ea5e9, #1d4ed8)"
  };

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function esc(str) {
    return String(str == null ? "" : str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function today() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function sum(nums) {
    return nums.reduce(function (a, b) { return a + b; }, 0);
  }

  function formatCurrencyJPY(value) {
    const n = Number(value || 0);
    return Number.isFinite(n) ? n.toLocaleString("ja-JP") : "0";
  }

  function statusChipClass(value) {
    if (value === "Ready" || value === "Resolved" || value === "Closed" || value === "Done" || value === "Low") {
      return "status-chip ok";
    }
    if (value === "High" || value === "Missing" || value === "Conflict" || value === "Failed") {
      return "status-chip warn";
    }
    return "status-chip";
  }

  function mountPersonaBackground(appKey) {
    const hero = document.getElementById("hero");
    const personaInput = document.getElementById("personaName");
    const backgroundSelect = document.getElementById("backgroundSelect");
    const saveShellBtn = document.getElementById("saveShellBtn");
    const resetShellBtn = document.getElementById("resetShellBtn");
    const shellStatus = document.getElementById("shellStatus");

    const shellKey = "lifeos_shell_" + appKey;

    function applyBackground(bg) {
      if (hero) {
        hero.style.background = backgrounds[bg] || backgrounds.sunrise;
      }
    }

    function loadShell() {
      const state = readJson(shellKey, { personaName: "", background: "sunrise" });
      if (personaInput) {
        personaInput.value = state.personaName || "";
      }
      if (backgroundSelect) {
        backgroundSelect.value = state.background || "sunrise";
      }
      applyBackground(backgroundSelect ? backgroundSelect.value : "sunrise");
      if (shellStatus) {
        shellStatus.textContent = state.personaName
          ? "Saved persona: " + state.personaName
          : "Persona not saved yet";
      }
    }

    function saveShell() {
      const state = {
        personaName: personaInput ? personaInput.value.trim() : "",
        background: backgroundSelect ? backgroundSelect.value : "sunrise"
      };
      writeJson(shellKey, state);
      applyBackground(state.background);
      if (shellStatus) {
        shellStatus.textContent = state.personaName
          ? "Saved persona: " + state.personaName
          : "Saved shell state";
      }
    }

    function resetShell() {
      localStorage.removeItem(shellKey);
      if (personaInput) {
        personaInput.value = "";
      }
      if (backgroundSelect) {
        backgroundSelect.value = "sunrise";
      }
      applyBackground("sunrise");
      if (shellStatus) {
        shellStatus.textContent = "Shell state reset";
      }
    }

    if (backgroundSelect) {
      backgroundSelect.addEventListener("change", function () {
        applyBackground(backgroundSelect.value);
      });
    }

    if (saveShellBtn) {
      saveShellBtn.addEventListener("click", saveShell);
    }

    if (resetShellBtn) {
      resetShellBtn.addEventListener("click", resetShell);
    }

    loadShell();
  }

  window.LifeWebCommon = {
    readJson: readJson,
    writeJson: writeJson,
    esc: esc,
    today: today,
    sum: sum,
    formatCurrencyJPY: formatCurrencyJPY,
    statusChipClass: statusChipClass,
    mountPersonaBackground: mountPersonaBackground
  };
})();

/* COMMONOS_BRIDGE_MERGE_START */
(function () {
  if (!window.LifeWebCommon) {
    window.LifeWebCommon = {};
  }

  if (!window.LifeCommonOSBridge) {
    window.LifeWebCommon.commonOS = {
      connected: false
    };
    return;
  }

  window.LifeWebCommon.commonOS = {
    connected: true,
    providerRoot: window.LifeCommonOSBridge.providerRoot,
    consumerRoot: window.LifeCommonOSBridge.consumerRoot,
    getTheme: function () {
      return window.LifeCommonOSBridge.getTheme();
    },
    adaptRecords: function (appKey, rows) {
      return window.LifeCommonOSBridge.adaptRecords(appKey, rows);
    },
    mapSummaryMetrics: function (appKey, rows) {
      return window.LifeCommonOSBridge.mapSummaryMetrics(appKey, rows);
    },
    mapListItems: function (appKey, rows) {
      return window.LifeCommonOSBridge.mapListItems(appKey, rows);
    },
    renderMetrics: function (metrics) {
      return window.LifeCommonOSBridge.renderMetrics(metrics);
    },
    renderList: function (items) {
      return window.LifeCommonOSBridge.renderList(items);
    },
    renderQueuePanel: function (state, message) {
      return window.LifeCommonOSBridge.renderQueuePanel(state, message);
    },
    queueStateLabel: function (state) {
      return window.LifeCommonOSBridge.queueStateLabel(state);
    },
    queueStateClass: function (state) {
      return window.LifeCommonOSBridge.queueStateClass(state);
    }
  };
})();
/* COMMONOS_BRIDGE_MERGE_END */
