import { aiodApi } from "./aiod_api_client.js";

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = String(value);
  }
}

function setPre(id, value) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = String(value);
  }
}

function renderList(id, items, mapper) {
  const node = document.getElementById(id);
  if (!node) {
    return;
  }
  node.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = mapper(item);
    node.appendChild(li);
  });
}

async function loadDashboard() {
  const [health, queue, reviewInbox, approvalInbox, failures, summaryBatches] = await Promise.all([
    aiodApi.health(),
    aiodApi.queue(),
    aiodApi.reviewInbox(),
    aiodApi.approvalInbox(),
    aiodApi.failures(),
    aiodApi.summaryBatches()
  ]);

  setPre("apiHealthBox", JSON.stringify(health, null, 2));

  const qItems = queue?.data?.items || [];
  const rItems = reviewInbox?.data?.items || [];
  const aItems = approvalInbox?.data?.items || [];
  const fItems = failures?.data?.items || [];
  const sItems = summaryBatches?.data?.items || [];

  setText("reviewPendingCount", rItems.length);
  setText("approvalPendingCount", aItems.length);
  setText("runningJobsCount", qItems.filter((x) => x.work_order_status === "running").length);
  setText("failedJobsCount", fItems.length);
  setText("summaryReadyCount", sItems.length);

  renderList("queueBoardList", qItems, (item) => {
    return `${item.work_order_id} / ${item.supported_app_code} / ${item.lane_type} / ${item.work_order_status} / ${item.risk_class}`;
  });

  renderList("reviewInboxList", rItems, (item) => {
    return `${item.review_request_id} / ${item.work_order_id} / ${item.supported_app_code} / ${item.review_reason_code}`;
  });

  renderList("approvalInboxList", aItems, (item) => {
    return `${item.approval_request_id} / ${item.work_order_id} / ${item.supported_app_code} / ${item.approval_reason_code}`;
  });

  renderList("failureList", fItems, (item) => {
    return `${item.failure_record_id} / ${item.work_order_id} / ${item.failure_code} / retryable=${item.retryable_flag}`;
  });

  renderList("summaryList", sItems, (item) => {
    return `${item.summary_batch_id} / ${item.batch_type} / ${item.batch_window_end_at}`;
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadDashboard();
  } catch (e) {
    setPre("apiHealthBox", `console load error: ${e?.message || e}`);
  }
});
