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
      current_screen_code: "BUILDER_ASSET_DETAIL",
      current_module_code: "BUILDER_LAYOUT",
      current_record_ref: "builder_asset_demo_001",
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
        "builder_resident_surface"
      );

      const supportedAppCode = ui.value(
        "supportedAppCode",
        "BUSINESS_BUILDER"
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
        `builder resident error: ${e?.message || e}`
      );
    }
  });
});
