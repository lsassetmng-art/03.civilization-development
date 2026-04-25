(function () {
  function getAdapter() {
    return window.LifeCommonOSAdapter || {};
  }

  function getMapper() {
    return window.LifeCommonOSMapper || {};
  }

  function getPresenter() {
    return window.LifeCommonOSPresenter || {};
  }

  function getSync() {
    return window.LifeCommonOSSync || {};
  }

  function getTheme() {
    return window.LifeCommonOSTheme || {};
  }

  window.LifeCommonOSBridge = {
    providerRoot: "/data/data/com.termux/files/home/03.civilization-development/12.common-os",
    consumerRoot: "/data/data/com.termux/files/home/03.civilization-development/04.life-os/_commonos",
    getTheme: function () {
      return getTheme();
    },
    adaptRecords: function (appKey, rows) {
      if (getAdapter().normalizeRecords) {
        return getAdapter().normalizeRecords(appKey, rows);
      }
      return rows || [];
    },
    mapSummaryMetrics: function (appKey, rows) {
      if (getMapper().mapSummaryMetrics) {
        return getMapper().mapSummaryMetrics(appKey, rows);
      }
      return [];
    },
    mapListItems: function (appKey, rows) {
      if (getMapper().mapListItems) {
        return getMapper().mapListItems(appKey, rows);
      }
      return [];
    },
    renderMetrics: function (metrics) {
      if (getPresenter().renderMetrics) {
        return getPresenter().renderMetrics(metrics);
      }
      return "";
    },
    renderList: function (items) {
      if (getPresenter().renderList) {
        return getPresenter().renderList(items);
      }
      return "";
    },
    renderQueuePanel: function (state, message) {
      if (getPresenter().renderQueuePanel) {
        return getPresenter().renderQueuePanel(state, message);
      }
      return "";
    },
    queueStateLabel: function (state) {
      if (getSync().queueStateLabel) {
        return getSync().queueStateLabel(state);
      }
      return state || "unknown";
    },
    queueStateClass: function (state) {
      if (getSync().queueStateClass) {
        return getSync().queueStateClass(state);
      }
      return "status-chip";
    }
  };
})();
