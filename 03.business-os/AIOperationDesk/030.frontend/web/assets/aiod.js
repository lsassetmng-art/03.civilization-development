const demoState = {
  dashboard: {
    reviewPending: 4,
    approvalPending: 2,
    runningJobs: 3,
    failedJobs: 1,
    summaryReady: 1
  },
  queue: [
    {
      work_order_id: "wo_demo_001",
      supported_app_code: "ERP",
      lane_type: "draft",
      work_order_status: "review_pending",
      risk_class: "medium"
    },
    {
      work_order_id: "wo_demo_002",
      supported_app_code: "BUSINESS_BUILDER",
      lane_type: "execution",
      work_order_status: "approval_pending",
      risk_class: "high"
    }
  ]
};

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = String(value);
  }
}

function renderDashboard() {
  setText("reviewPendingCount", demoState.dashboard.reviewPending);
  setText("approvalPendingCount", demoState.dashboard.approvalPending);
  setText("runningJobsCount", demoState.dashboard.runningJobs);
  setText("failedJobsCount", demoState.dashboard.failedJobs);
  setText("summaryReadyCount", demoState.dashboard.summaryReady);
}

function renderQueueList() {
  const list = document.getElementById("queueList");
  if (!list) {
    return;
  }

  list.innerHTML = "";

  demoState.queue.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.work_order_id} / ${item.supported_app_code} / ${item.lane_type} / ${item.work_order_status} / ${item.risk_class}`;
    list.appendChild(li);
  });
}

function bindResidentQuickForm() {
  const button = document.getElementById("stubResidentSubmit");
  const output = document.getElementById("stubResidentOutput");
  if (!button || !output) {
    return;
  }

  button.addEventListener("click", () => {
    const requestText = document.getElementById("requestText")?.value || "";
    const supportedAppCode = document.getElementById("supportedAppCode")?.value || "";
    const laneType = document.getElementById("laneType")?.value || "";
    output.textContent = [
      "stub request compiled",
      `supported_app_code=${supportedAppCode}`,
      `lane_type=${laneType}`,
      `request_text=${requestText}`
    ].join("\n");
  });
}

window.addEventListener("DOMContentLoaded", () => {
  renderDashboard();
  renderQueueList();
  bindResidentQuickForm();
});
