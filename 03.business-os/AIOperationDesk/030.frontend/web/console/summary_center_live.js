import { aiodApi } from "../assets/aiod_api_client.js";

const ui = window.AIODCommonOSConsole;

window.addEventListener("DOMContentLoaded", async () => {
  ui.mount();

  try {
    const summaries = await aiodApi.summaryBatches();
    const items = summaries?.data?.items || [];

    ui.renderList(
      "summaryList",
      items,
      (item) =>
        `${item.summary_batch_id} / ${item.batch_type} / ${item.batch_window_end_at}`
    );

    ui.setPre(
      "summaryDebugBox",
      JSON.stringify(summaries, null, 2)
    );
  } catch (e) {
    ui.setPre(
      "summaryDebugBox",
      `summary load error: ${e?.message || e}`
    );
  }
});
