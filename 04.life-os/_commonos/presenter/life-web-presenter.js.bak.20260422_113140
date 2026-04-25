(function () {
  function esc(str) {
    return String(str == null ? "" : str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function renderMetrics(metrics) {
    return (metrics || []).map(function (metric) {
      return (
        '<div class="metric">' +
          '<div class="label">' + esc(metric.label) + '</div>' +
          '<div class="value">' + esc(metric.value) + '</div>' +
        '</div>'
      );
    }).join("");
  }

  function renderList(items) {
    if (!items || !items.length) {
      return '<div class="state-empty">No records</div>';
    }

    return items.map(function (item) {
      var chips = (item.chips || []).map(function (chip) {
        return '<span class="status-chip">' + esc(chip) + '</span>';
      }).join(" ");

      return (
        '<div class="item">' +
          '<div class="head"><span>' + esc(item.title) + '</span><span>' + chips + '</span></div>' +
          '<div class="sub">' + esc(item.body || "") + '</div>' +
        '</div>'
      );
    }).join("");
  }

  function renderQueuePanel(queueState, message) {
    return (
      '<div class="queue-panel">' +
        '<div class="head"><span>Queue</span><span class="status-chip">' + esc(queueState || "pending") + '</span></div>' +
        '<div class="sub">' + esc(message || "Queue presentation connected") + '</div>' +
      '</div>'
    );
  }

  window.LifeCommonOSPresenter = {
    renderMetrics: renderMetrics,
    renderList: renderList,
    renderQueuePanel: renderQueuePanel
  };
})();
