import { aiodApi } from "../assets/aiod_api_client.js";

const ui = window.AIODCommonOSConsole;

window.addEventListener("DOMContentLoaded", async () => {
  ui.mount();

  try {
    const review = await aiodApi.reviewInbox();
    const items = review?.data?.items || [];

    ui.renderList(
      "reviewInboxList",
      items,
      (item) =>
        `${item.review_request_id} / ${item.work_order_id} / ${item.supported_app_code} / ${item.review_reason_code}`
    );

    ui.setPre("reviewDebugBox", JSON.stringify(review, null, 2));
  } catch (e) {
    ui.setPre(
      "reviewDebugBox",
      `review load error: ${e?.message || e}`
    );
  }
});
