export const CASUAL_CHAT_WORKER_API = Object.freeze({
  listWorkers: "/api/v1/business/casual-chat-worker/workers",
  workerDetail: "/api/v1/business/casual-chat-worker/worker/detail",
  freeTicketBalance: "/api/v1/business/casual-chat-worker/free-ticket/balance",
  contractQuote: "/api/v1/business/casual-chat-worker/contract/quote",
  contractConfirm: "/api/v1/business/casual-chat-worker/contract/confirm",
  sessionMessage: "/api/v1/business/casual-chat-worker/session/message",
  sessionEnd: "/api/v1/business/casual-chat-worker/session/end",
  usageHistory: "/api/v1/business/casual-chat-worker/usage/history"
});

export async function listWorkers(client, params) {
  return client.get(CASUAL_CHAT_WORKER_API.listWorkers, params);
}

export async function getWorkerDetail(client, params) {
  return client.get(CASUAL_CHAT_WORKER_API.workerDetail, params);
}

export async function getFreeTicketBalance(client, params) {
  return client.get(CASUAL_CHAT_WORKER_API.freeTicketBalance, params);
}

export async function quoteContract(client, body) {
  return client.post(CASUAL_CHAT_WORKER_API.contractQuote, body);
}

export async function confirmContract(client, body) {
  return client.post(CASUAL_CHAT_WORKER_API.contractConfirm, body);
}

export async function sendSessionMessage(client, body) {
  return client.post(CASUAL_CHAT_WORKER_API.sessionMessage, body);
}

export async function endSession(client, body) {
  return client.post(CASUAL_CHAT_WORKER_API.sessionEnd, body);
}

export async function getUsageHistory(client, params) {
  return client.get(CASUAL_CHAT_WORKER_API.usageHistory, params);
}
