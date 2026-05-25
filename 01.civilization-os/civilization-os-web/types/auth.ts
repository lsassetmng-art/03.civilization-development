export type AuthReturnTarget = {
  requestedOsCode?: string;
  returnTarget?: string;
};

export type CivilizationAuthContractResponse = {
  ok: false;
  errorCode: "AUTH_PERSISTENCE_NOT_CONNECTED";
  message: string;
  nextRequiredPhase: string;
};
