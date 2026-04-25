import { aiodApi } from "../assets/aiod_api_client.js";
import { renderList, setPre } from "../assets/aiod_render.js";

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const queue = await aiodApi.queue();
    const items = queue?.data?.items || [];
    renderList("queueBoardList", items, (item) => {
      return `${item.work_order_id} / ${item.supported_app_code} / ${item.lane_type} / ${item.work_order_status} / ${item.risk_class}`;
    });
    setPre("queueDebugBox", JSON.stringify(queue, null, 2));
  } catch (e) {
    setPre("queueDebugBox", `queue load error: ${e?.message || e}`);
  }
});
