export type PortalNoticeItem = {
  slug: string;
  title: string;
  summary: string;
  level: "info" | "warning" | "maintenance";
  publishedOn: string;
};

export const HOME_NOTICES: PortalNoticeItem[] = [
  {
    slug: "portal-launch-structure",
    title: "Official entry policy remains portal-first.",
    summary:
      "All OS web links continue to be controlled through the portal. Direct OS-to-OS web links are not allowed.",
    level: "info",
    publishedOn: "2026-04-16",
  },
  {
    slug: "life-os-maintenance",
    title: "LifeOS entry is in maintenance mode.",
    summary:
      "The launcher and OS detail screens will route maintenance-eligible requests to the maintenance page.",
    level: "maintenance",
    publishedOn: "2026-04-16",
  },
  {
    slug: "staticart-beta-note",
    title: "StaticArtOS remains beta-gated.",
    summary:
      "Portal decisions for StaticArtOS will require login, a sufficient contract tier, and the beta flag.",
    level: "warning",
    publishedOn: "2026-04-16",
  },
];
