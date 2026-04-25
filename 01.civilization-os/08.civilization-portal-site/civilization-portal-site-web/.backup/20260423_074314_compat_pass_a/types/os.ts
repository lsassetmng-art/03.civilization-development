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
};
