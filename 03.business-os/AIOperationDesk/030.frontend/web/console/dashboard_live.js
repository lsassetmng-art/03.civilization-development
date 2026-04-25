import { aiodApi } from "../assets/aiod_api_client.js";
import { setText, setPre, renderList } from "../assets/aiod_render.js";

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
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadDashboard();
  } catch (e) {
    setPre("apiHealthBox", `dashboard load error: ${e?.message || e}`);
  }
});
