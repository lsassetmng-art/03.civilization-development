import { aiodApi } from "../assets/aiod_api_client.js";

const ui = window.AIODCommonOSConsole;

window.addEventListener("DOMContentLoaded", async () => {
  ui.mount();

  try {
    const approval = await aiodApi.approvalInbox();
    const items = approval?.data?.items || [];

    ui.renderList(
      "approvalInboxList",
      items,
      (item) =>
        `${item.approval_request_id} / ${item.work_order_id} / ${item.supported_app_code} / ${item.approval_reason_code}`
    );

    ui.setPre(
      "approvalDebugBox",
      JSON.stringify(approval, null, 2)
    );
  } catch (e) {
    ui.setPre(
      "approvalDebugBox",
      `approval load error: ${e?.message || e}`
    );
  }
});
