import { aiodApi } from "../assets/aiod_api_client.js";
import { renderList, setPre } from "../assets/aiod_render.js";

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const summaries = await aiodApi.summaryBatches();
    const items = summaries?.data?.items || [];
    renderList("summaryList", items, (item) => {
      return `${item.summary_batch_id} / ${item.batch_type} / ${item.batch_window_end_at}`;
    });
    setPre("summaryDebugBox", JSON.stringify(summaries, null, 2));
  } catch (e) {
    setPre("summaryDebugBox", `summary load error: ${e?.message || e}`);
  }
});
