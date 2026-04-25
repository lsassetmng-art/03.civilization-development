import { jsonResponse } from "../aiod_http_response.js";
import { getDataModeResolved } from "../../lib/aiod_db_gateway.js";

export function handleHealthRoute() {
  return jsonResponse({
    ok: true,
    data: {
      app: "AIOperationDesk",
      mode: getDataModeResolved(),
      status: "stub_ready"
    }
  });
}
