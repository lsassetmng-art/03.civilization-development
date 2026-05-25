import type { CivilizationAuthContractResponse } from "@/types/auth";

export function authPersistenceNotConnectedResponse(): CivilizationAuthContractResponse {
  return {
    ok: false,
    errorCode: "AUTH_PERSISTENCE_NOT_CONNECTED",
    message: "CivilizationOS auth persistence is not connected in this phase. DB-backed session/Civilization ID requires the next approved DB design phase.",
    nextRequiredPhase: "CIVILIZATION_PHASE1_R4_AUTH_DB_CONTRACT_DESIGN"
  };
}
