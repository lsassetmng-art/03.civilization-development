import type { PortalContractTier, PortalEntityType } from "./auth";

export type PortalOsAvailability = "active" | "coming-soon" | "maintenance";

export type PortalOsAccessLevel = "public" | "login-required" | "restricted";

export type PortalOsEligibility = {
  allowedEntityTypes?: PortalEntityType[];
  requiredContractTier?: PortalContractTier;
  requiredAffiliation?: string;
  betaFlag?: string;
};

export type PortalOsCard = {
  code: string;
  name: string;
  category: string;
  tagline: string;
  summary: string;
  availability: PortalOsAvailability;
  accessLevel: PortalOsAccessLevel;
  featured: boolean;
  heroPoints: string[];
  launchUrl: string;
  eligibility?: PortalOsEligibility;
};
