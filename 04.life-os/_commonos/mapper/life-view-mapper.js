(function () {
  function mapSummaryMetrics(appKey, rows) {
    var items = rows || [];
    return [
      { label: "Records", value: String(items.length) },
      { label: "App", value: appKey },
      { label: "Has Data", value: items.length > 0 ? "Yes" : "No" }
    ];
  }

  function mapListItems(appKey, rows) {
    return (rows || []).map(function (row) {
      return {
        title:
          row.title ||
          row.planTitle ||
          row.issueTitle ||
          row.caseTitle ||
          row.company ||
          row.caseName ||
          row.menu ||
          row.workout ||
          row.date ||
          "Untitled",
        chips: [
          row.status || row.planStatus || row.stage || row.itemType || row.entryType || "",
          row.priority || row.category || row.issueType || row.caseType || ""
        ].filter(Boolean),
        body: JSON.stringify(row, null, 2)
      };
    });
  }

  window.LifeCommonOSMapper = {
    mapSummaryMetrics: mapSummaryMetrics,
    mapListItems: mapListItems
  };
})();
