import {
  listSupportedApps,
  listQueue,
  listFailures,
  listReviewInbox,
  listApprovalInbox,
  listSummaryBatches
} from "./aiod_mock_store.js";

function mode() {
  return (globalThis.Deno?.env?.get?.("AIOD_DATA_MODE") || "mock").toLowerCase();
}

export function getDataMode() {
  return mode();
}

export async function fetchSupportedApps() {
  return {
    data_mode: mode(),
    items: listSupportedApps()
  };
}

export async function fetchQueue() {
  return {
    data_mode: mode(),
    items: listQueue()
  };
}

export async function fetchFailures() {
  return {
    data_mode: mode(),
    items: listFailures()
  };
}

export async function fetchReviewInbox() {
  return {
    data_mode: mode(),
    items: listReviewInbox()
  };
}

export async function fetchApprovalInbox() {
  return {
    data_mode: mode(),
    items: listApprovalInbox()
  };
}

export async function fetchSummaryBatches() {
  return {
    data_mode: mode(),
    items: listSummaryBatches()
  };
}
