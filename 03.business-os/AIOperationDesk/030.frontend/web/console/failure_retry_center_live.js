import { aiodApi } from "../assets/aiod_api_client.js";

const ui = window.AIODCommonOSConsole;

window.addEventListener("DOMContentLoaded", async () => {
  ui.mount();

  try {
    const failures = await aiodApi.failures();
    const items = failures?.data?.items || [];

    ui.renderList(
      "failureList",
      items,
      (item) =>
        `${item.failure_record_id} / ${item.work_order_id} / ${item.failure_code} / retryable=${item.retryable_flag}`
    );

    ui.setPre(
      "failureDebugBox",
      JSON.stringify(failures, null, 2)
    );
  } catch (e) {
    ui.setPre(
      "failureDebugBox",
      `failure load error: ${e?.message || e}`
    );
  }
});
