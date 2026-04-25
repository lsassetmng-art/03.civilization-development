import { aiodApi } from "../assets/aiod_api_client.js";
import { renderList, setPre } from "../assets/aiod_render.js";

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const approval = await aiodApi.approvalInbox();
    const items = approval?.data?.items || [];
    renderList("approvalInboxList", items, (item) => {
      return `${item.approval_request_id} / ${item.work_order_id} / ${item.supported_app_code} / ${item.approval_reason_code}`;
    });
    setPre("approvalDebugBox", JSON.stringify(approval, null, 2));
  } catch (e) {
    setPre("approvalDebugBox", `approval load error: ${e?.message || e}`);
  }
});
