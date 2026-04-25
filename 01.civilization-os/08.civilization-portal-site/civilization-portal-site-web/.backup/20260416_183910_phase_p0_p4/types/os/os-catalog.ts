export type OsCatalogItem = {
  osCode: string;
  osName: string;
  headline: string;
  shortDescription: string;
  status: "available" | "login_required" | "maintenance" | "planned";
  eligibilitySummary: string;
};
