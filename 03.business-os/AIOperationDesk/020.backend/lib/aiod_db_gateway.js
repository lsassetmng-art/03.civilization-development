import {
  fetchSupportedApps,
  fetchQueue,
  fetchFailures,
  fetchReviewInbox,
  fetchApprovalInbox,
  fetchSummaryBatches
} from "./aiod_db_gateway_stub.js";

import {
  getDbGatewayMode,
  fetchSupportedAppsPsql,
  fetchQueuePsql,
  fetchFailuresPsql,
  fetchReviewInboxPsql,
  fetchApprovalInboxPsql,
  fetchSummaryBatchesPsql
} from "./aiod_db_gateway_psql.js";

function mode() {
  return getDbGatewayMode();
}

export function getDataModeResolved() {
  return mode();
}

export async function fetchSupportedAppsGateway() {
  if (mode() === "db_psql") {
    return fetchSupportedAppsPsql();
  }
  return fetchSupportedApps();
}

export async function fetchQueueGateway() {
  if (mode() === "db_psql") {
    return fetchQueuePsql();
  }
  return fetchQueue();
}

export async function fetchFailuresGateway() {
  if (mode() === "db_psql") {
    return fetchFailuresPsql();
  }
  return fetchFailures();
}

export async function fetchReviewInboxGateway() {
  if (mode() === "db_psql") {
    return fetchReviewInboxPsql();
  }
  return fetchReviewInbox();
}

export async function fetchApprovalInboxGateway() {
  if (mode() === "db_psql") {
    return fetchApprovalInboxPsql();
  }
  return fetchApprovalInbox();
}

export async function fetchSummaryBatchesGateway() {
  if (mode() === "db_psql") {
    return fetchSummaryBatchesPsql();
  }
  return fetchSummaryBatches();
}
