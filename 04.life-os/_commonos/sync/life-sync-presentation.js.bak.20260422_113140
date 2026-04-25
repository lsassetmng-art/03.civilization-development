(function () {
  function queueStateLabel(state) {
    switch (state) {
      case "pending": return "Pending";
      case "processing": return "Processing";
      case "retry_wait": return "Retry Wait";
      case "sent": return "Sent";
      case "failed": return "Failed";
      case "cancelled": return "Cancelled";
      case "conflict": return "Conflict";
      default: return "Unknown";
    }
  }

  function queueStateClass(state) {
    if (state === "sent") return "status-chip ok";
    if (state === "failed" || state === "conflict") return "status-chip warn";
    return "status-chip";
  }

  window.LifeCommonOSSync = {
    queueStateLabel: queueStateLabel,
    queueStateClass: queueStateClass
  };
})();
