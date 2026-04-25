export type PortalNoticeLevel = "info" | "warning" | "success";

export type PortalNoticeItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  level: PortalNoticeLevel;
  visibility: "public" | "member" | "operator";
  publishedOn: string;
  lastUpdatedAt: string;
};
