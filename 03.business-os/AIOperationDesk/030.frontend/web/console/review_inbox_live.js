import { aiodApi } from "../assets/aiod_api_client.js";
import { renderList, setPre } from "../assets/aiod_render.js";

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const review = await aiodApi.reviewInbox();
    const items = review?.data?.items || [];
    renderList("reviewInboxList", items, (item) => {
      return `${item.review_request_id} / ${item.work_order_id} / ${item.supported_app_code} / ${item.review_reason_code}`;
    });
    setPre("reviewDebugBox", JSON.stringify(review, null, 2));
  } catch (e) {
    setPre("reviewDebugBox", `review load error: ${e?.message || e}`);
  }
});
