import { aiodApi } from "../assets/aiod_api_client.js";
import { setPre } from "../assets/aiod_render.js";

async function compile(surfaceType, supportedAppCode, laneType, requestText) {
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

  setPre("residentActionOutput", JSON.stringify(result, null, 2));
}

window.addEventListener("DOMContentLoaded", () => {
  const submit = document.getElementById("stubResidentSubmit");
  if (!submit) {
    return;
  }

  submit.addEventListener("click", async () => {
    try {
      const surfaceType = document.getElementById("surfaceType")?.value || "builder_resident_surface";
      const supportedAppCode = document.getElementById("supportedAppCode")?.value || "BUSINESS_BUILDER";
      const laneType = document.getElementById("laneType")?.value || "consult";
      const requestText = document.getElementById("requestText")?.value || "";
      await compile(surfaceType, supportedAppCode, laneType, requestText);
    } catch (e) {
      setPre("residentActionOutput", `builder resident error: ${e?.message || e}`);
    }
  });
});
