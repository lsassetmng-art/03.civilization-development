export type PortalOsAccessLevel = "public" | "member" | "operator";

export type PortalOsCard = {
  code: string;
  name: string;
  category: string;
  tagline: string;
  summary: string;
  availability: string;
  accessLevel: PortalOsAccessLevel;
  featured: boolean;
  heroPoints: string[];
  launchUrl?: string;
  eligibility?: {
    minTier?: "none" | "free" | "personal" | "business" | "pro";
  };
};
