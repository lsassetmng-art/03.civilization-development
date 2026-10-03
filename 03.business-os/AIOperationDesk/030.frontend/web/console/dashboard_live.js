import { aiodApi } from "../assets/aiod_api_client.js";

const ui = window.AIODCommonOSConsole;

async function loadDashboard() {
  ui.mount();

  const [
    health,
    queue,
    reviewInbox,
    approvalInbox,
    failures,
    summaryBatches
  ] = await Promise.all([
    aiodApi.health(),
    aiodApi.queue(),
    aiodApi.reviewInbox(),
    aiodApi.approvalInbox(),
    aiodApi.failures(),
    aiodApi.summaryBatches()
  ]);

  ui.setPre(
    "apiHealthBox",
    JSON.stringify(health, null, 2)
  );

  const qItems = queue?.data?.items || [];
  const rItems = reviewInbox?.data?.items || [];
  const aItems = approvalInbox?.data?.items || [];
  const fItems = failures?.data?.items || [];
  const sItems = summaryBatches?.data?.items || [];

  ui.setText("reviewPendingCount", rItems.length);
  ui.setText("approvalPendingCount", aItems.length);

  ui.setText(
    "runningJobsCount",
    qItems.filter(
      (item) => item.work_order_status === "running"
    ).length
  );

  ui.setText("failedJobsCount", fItems.length);
  ui.setText("summaryReadyCount", sItems.length);

  ui.renderList(
    "queueBoardList",
    qItems,
    (item) =>
      `${item.work_order_id} / ${item.supported_app_code} / ${item.lane_type} / ${item.work_order_status} / ${item.risk_class}`
  );
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadDashboard();
  } catch (e) {
    ui.setPre(
      "apiHealthBox",
      `dashboard load error: ${e?.message || e}`
    );
  }
});
