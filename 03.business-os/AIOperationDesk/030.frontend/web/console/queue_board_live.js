import { aiodApi } from "../assets/aiod_api_client.js";

const ui = window.AIODCommonOSConsole;

window.addEventListener("DOMContentLoaded", async () => {
  ui.mount();

  try {
    const queue = await aiodApi.queue();
    const items = queue?.data?.items || [];

    ui.renderList(
      "queueBoardList",
      items,
      (item) =>
        `${item.work_order_id} / ${item.supported_app_code} / ${item.lane_type} / ${item.work_order_status} / ${item.risk_class}`
    );

    ui.setPre("queueDebugBox", JSON.stringify(queue, null, 2));
  } catch (e) {
    ui.setPre(
      "queueDebugBox",
      `queue load error: ${e?.message || e}`
    );
  }
});
