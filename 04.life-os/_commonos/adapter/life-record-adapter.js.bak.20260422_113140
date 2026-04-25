(function () {
  function normalizeRecord(appKey, raw) {
    var record = raw || {};
    return {
      appKey: appKey,
      title:
        record.planTitle ||
        record.issueTitle ||
        record.caseTitle ||
        record.company ||
        record.menu ||
        record.workout ||
        record.caseName ||
        record.title ||
        record.date ||
        "Untitled",
      primary:
        record.status ||
        record.planStatus ||
        record.stage ||
        record.itemType ||
        record.entryType ||
        record.type ||
        "",
      secondary:
        record.category ||
        record.issueType ||
        record.caseType ||
        record.priority ||
        record.horizon ||
        record.visibility ||
        "",
      amount:
        record.amount ||
        record.estimatedCost ||
        record.calories ||
        record.weight ||
        "",
      raw: record
    };
  }

  function normalizeRecords(appKey, rows) {
    return (rows || []).map(function (row) {
      return normalizeRecord(appKey, row);
    });
  }

  window.LifeCommonOSAdapter = {
    normalizeRecord: normalizeRecord,
    normalizeRecords: normalizeRecords
  };
})();
