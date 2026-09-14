export type HomeNoticeItem = {
  slug: string;
  title: string;
  summary: string;
  level: "info" | "warning" | "success";
  publishedOn: string;
};

export const HOME_NOTICES: HomeNoticeItem[] = [
  {
    slug: "portal-entry",
    title: "Portal entry active",
    summary: "The portal is the official public web entry for supported Civilization routes.",
    level: "info",
    publishedOn: "2026-04-21",
  },
  {
    slug: "launcher-available",
    title: "Launcher entry available",
    summary: "Signed-in users can continue into the launcher-aware flow.",
    level: "success",
    publishedOn: "2026-04-21",
  },
  {
    slug: "support-center",
    title: "Support center ready",
    summary: "Help, policy, terms, and contact pages are available from the portal.",
    level: "warning",
    publishedOn: "2026-04-21",
  },
];
