import { aiodApi } from "../assets/aiod_api_client.js";

const ui = window.AIODCommonOSResident;

async function compile(
  surfaceType,
  supportedAppCode,
  laneType,
  requestText
) {
  const result = await aiodApi.compileRequest({
    request_channel: "text",
    request_text: requestText,
    voice_transcript: null,
    requested_start_at: null,
    supported_app_code: supportedAppCode,
    lane_type: laneType,
    priority_level: "normal",
    source_surface_type: surfaceType,
    resident_context_snapshot: {
      current_screen_code: "ERP_VOUCHER_DETAIL",
      current_module_code: "ERP_ACCOUNTING",
      current_record_ref: "erp_record_demo_001",
      current_field_code: "field_demo",
      current_company_ref: "demo_company",
      latest_error_code: null,
      entered_value_json: {},
      permission_context_json: {}
    },
    attachments: []
  });

  ui.setOutput(JSON.stringify(result, null, 2));
}

window.addEventListener("DOMContentLoaded", () => {
  ui.mount();

  ui.onClick("stubResidentSubmit", async () => {
    try {
      const surfaceType = ui.value(
        "surfaceType",
        "erp_resident_surface"
      );

      const supportedAppCode = ui.value(
        "supportedAppCode",
        "ERP"
      );

      const laneType = ui.value(
        "laneType",
        "consult"
      );

      const requestText = ui.value(
        "requestText",
        ""
      );

      await compile(
        surfaceType,
        supportedAppCode,
        laneType,
        requestText
      );
    } catch (e) {
      ui.setOutput(
        `erp resident error: ${e?.message || e}`
      );
    }
  });
});
