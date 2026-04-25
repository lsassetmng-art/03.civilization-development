import { aiodApi } from "../assets/aiod_api_client.js";
import { renderList, setPre } from "../assets/aiod_render.js";

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const failures = await aiodApi.failures();
    const items = failures?.data?.items || [];
    renderList("failureList", items, (item) => {
      return `${item.failure_record_id} / ${item.work_order_id} / ${item.failure_code} / retryable=${item.retryable_flag}`;
    });
    setPre("failureDebugBox", JSON.stringify(failures, null, 2));
  } catch (e) {
    setPre("failureDebugBox", `failure load error: ${e?.message || e}`);
  }
});
