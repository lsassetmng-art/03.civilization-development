export const CASUAL_CHAT_WORKER_DOMAIN = Object.freeze({
  appName: "CasualChatWorker",
  displayName: "雑談ワーカー",
  category: "03.business-os",
  workerTypes: ["Friend", "Lover"],
  durationMinutes: [30, 60, 90, 120],
  maxContractMinutes: 120,
  schemaBoundary: {
    contractTruth: "business",
    aiWorkerTruth: "aiworker",
    cxReference: "cx22073jw",
    commonPresentation: "app_common"
  }
});

export function isValidWorkerType(workerType) {
  return CASUAL_CHAT_WORKER_DOMAIN.workerTypes.includes(workerType);
}

export function isValidDurationMinutes(durationMinutes) {
  return CASUAL_CHAT_WORKER_DOMAIN.durationMinutes.includes(Number(durationMinutes));
}

export function assertValidContractInput(input) {
  if (!input || typeof input !== "object") {
    throw new Error("INVALID_INPUT");
  }

  if (!isValidWorkerType(input.workerType)) {
    throw new Error("INVALID_WORKER_TYPE");
  }

  if (!isValidDurationMinutes(input.durationMinutes)) {
    throw new Error("INVALID_DURATION_MINUTES");
  }

  if (Number(input.durationMinutes) > CASUAL_CHAT_WORKER_DOMAIN.maxContractMinutes) {
    throw new Error("CONTRACT_DURATION_EXCEEDED");
  }

  return true;
}
