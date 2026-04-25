import { aiodApi } from "./aiod_api_client.js";

function setOutput(text) {
  const node = document.getElementById("residentActionOutput");
  if (node) {
    node.textContent = text;
  }
}

async function compileStubRequest(surfaceType, supportedAppCode, laneType, requestText) {
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
      current_screen_code: surfaceType === "erp_resident_surface" ? "ERP_VOUCHER_DETAIL" : "BUILDER_ASSET_DETAIL",
      current_module_code: surfaceType === "erp_resident_surface" ? "ERP_ACCOUNTING" : "BUILDER_LAYOUT",
      current_record_ref: surfaceType === "erp_resident_surface" ? "erp_record_demo_001" : "builder_asset_demo_001",
      current_field_code: "field_demo",
      current_company_ref: "demo_company",
      latest_error_code: null,
      entered_value_json: {},
      permission_context_json: {}
    },
    attachments: []
  });

  setOutput(JSON.stringify(result, null, 2));
}

window.addEventListener("DOMContentLoaded", () => {
  const submit = document.getElementById("stubResidentSubmit");
  if (!submit) {
    return;
  }

  submit.addEventListener("click", async () => {
    const surfaceType = document.getElementById("surfaceType")?.value || "erp_resident_surface";
    const supportedAppCode = document.getElementById("supportedAppCode")?.value || "ERP";
    const laneType = document.getElementById("laneType")?.value || "consult";
    const requestText = document.getElementById("requestText")?.value || "";

    try {
      await compileStubRequest(surfaceType, supportedAppCode, laneType, requestText);
    } catch (e) {
      setOutput(`resident load error: ${e?.message || e}`);
    }
  });
});
