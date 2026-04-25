import {
  handleRequestIntake,
  handleErpProvisionalVoucher,
  handleRetrySchedule
} from "../edge/aiod_handlers_stub.js";

import {
  createOperationRequestPsql,
  createProvisionalVoucherPsql,
  scheduleRetryPsql
} from "./aiod_request_gateway_psql.js";

function mode() {
  return (globalThis.Deno?.env?.get?.("AIOD_DATA_MODE") || "mock").toLowerCase();
}

export async function createOperationRequestGateway(payload) {
  if (mode() === "db_psql") {
    return {
      ok: true,
      data: await createOperationRequestPsql(payload)
    };
  }
  return handleRequestIntake(payload);
}

export async function createProvisionalVoucherGateway(payload) {
  if (mode() === "db_psql") {
    return {
      ok: true,
      data: await createProvisionalVoucherPsql(payload)
    };
  }
  return handleErpProvisionalVoucher(payload);
}

export async function scheduleRetryGateway(payload) {
  if (mode() === "db_psql") {
    return {
      ok: true,
      data: await scheduleRetryPsql(payload)
    };
  }
  return handleRetrySchedule(payload);
}
