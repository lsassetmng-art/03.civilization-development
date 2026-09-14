export type PortalEntityType = "guest" | "human" | "persona" | "robot";

export type PortalContractTier = "none" | "free" | "pro" | "business";

export type PortalSessionSummary = {
  isLoggedIn: boolean;
  civilizationUserId?: string;
  displayName?: string;
  entityType: PortalEntityType;
  affiliations: string[];
  contractTier: PortalContractTier;
  betaFlags: string[];
  region?: string;
};

export type PortalReturnContext = {
  requestedOsCode?: string;
  returnTarget: string;
  requestTimestamp: string;
};
