export type PortalEntityType = "guest" | "human" | "robot";
export type PortalContractTier = "none" | "free" | "personal" | "business" | "pro";

export type PortalSessionSummary = {
  isLoggedIn: boolean;
  civilizationUserId?: string;
  displayName?: string;
  entityType: PortalEntityType;
  affiliations: string[];
  contractTier: PortalContractTier;
  betaFlags: string[];
  region: string;
};

export type PortalReturnContext = {
  returnTarget: string;
  requestedOsCode?: string;
  requestTimestamp: string;
};

export const DEFAULT_PORTAL_SESSION: PortalSessionSummary = {
  isLoggedIn: false,
  entityType: "guest",
  affiliations: [],
  contractTier: "none",
  betaFlags: [],
  region: "JP",
};
