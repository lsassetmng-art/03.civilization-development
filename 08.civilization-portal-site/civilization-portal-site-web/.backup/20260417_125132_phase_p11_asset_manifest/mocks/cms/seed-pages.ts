import type { PortalCmsPageDocument } from "../../types/portal-cms-api";

const nowIso = (): string => new Date().toISOString();

export const PORTAL_CMS_SEED_PAGES: PortalCmsPageDocument[] = [
  {
    id: "cms-home",
    pageCode: "home",
    eyebrow: "Official Web Entry",
    title: "Civilization Portal Site",
    description:
      "The official public entry for Civilization information, authentication guidance, OS catalog access, and post-login launcher routing.",
    lastUpdatedAt: nowIso(),
    sections: [
      {
        id: "cms-home-overview",
        sectionCode: "overview",
        title: "Portal role",
        layout: "stack",
        blocks: [
          {
            kind: "paragraph",
            body:
              "This portal is the only official web entry for Civilization web destinations. It explains the platform publicly, routes users into canonical authentication, and returns them to launcher-aware destinations.",
          },
        ],
      },
      {
        id: "cms-home-highlights",
        sectionCode: "highlights",
        title: "What the portal handles",
        layout: "grid-2",
        blocks: [
          {
            kind: "bullet_list",
            items: [
              "Public explanation of Civilization",
              "Official OS introduction and directory",
              "Portal-first navigation policy",
            ],
          },
          {
            kind: "callout",
            title: "Boundary rule",
            body:
              "Canonical sign-up and authentication remain owned by CivilizationOS, while the portal owns the public explanation layer and official web entry links.",
            tone: "info",
          },
        ],
      },
    ],
  },
  {
    id: "cms-civilization",
    pageCode: "civilization",
    eyebrow: "System Overview",
    title: "What Civilization is",
    description:
      "Civilization Portal Site explains Civilization publicly, but canonical sign-up and authentication stay in CivilizationOS.",
    lastUpdatedAt: nowIso(),
    sections: [
      {
        id: "cms-civilization-boundary",
        sectionCode: "boundary",
        title: "Responsibility split",
        layout: "grid-2",
        blocks: [
          {
            kind: "bullet_list",
            items: [
              "Portal handles public explanation",
              "Portal holds official OS web links",
              "Portal explains access and launch conditions",
            ],
          },
          {
            kind: "bullet_list",
            items: [
              "CivilizationOS owns canonical sign-up",
              "CivilizationOS owns canonical authentication",
              "CivilizationOS owns Civilization ID issuance",
            ],
          },
        ],
      },
      {
        id: "cms-civilization-note",
        sectionCode: "note",
        title: "Operating note",
        layout: "stack",
        blocks: [
          {
            kind: "callout",
            title: "No direct OS-to-OS web links",
            body:
              "The portal remains the single official web entry holder for OS destinations. This keeps access explanation, menu control, and return routing consistent.",
            tone: "warning",
          },
        ],
      },
    ],
  },
  {
    id: "cms-guide",
    pageCode: "guide",
    eyebrow: "Usage Guide",
    title: "How to use the portal",
    description:
      "Portal-first navigation, CivilizationOS-owned authentication, and launcher-based OS entry are the current operating model.",
    lastUpdatedAt: nowIso(),
    sections: [
      {
        id: "cms-guide-steps",
        sectionCode: "steps",
        title: "Basic flow",
        layout: "grid-2",
        blocks: [
          {
            kind: "bullet_list",
            items: [
              "Start from the portal",
              "Browse official OS entries",
              "Read access conditions before launch",
            ],
          },
          {
            kind: "bullet_list",
            items: [
              "Authenticate through CivilizationOS",
              "Return through the auth bridge",
              "Continue in the launcher or requested page",
            ],
          },
        ],
      },
      {
        id: "cms-guide-note",
        sectionCode: "note",
        title: "Current implementation note",
        layout: "stack",
        blocks: [
          {
            kind: "callout",
            title: "Mock bridge active",
            body:
              "The current implementation validates exact payload contracts and return routing before the real CivilizationOS bridge is connected.",
            tone: "success",
          },
        ],
      },
    ],
  },
];

export const findSeedCmsPage = (
  pageCode: "home" | "civilization" | "guide",
): PortalCmsPageDocument | undefined =>
  PORTAL_CMS_SEED_PAGES.find((item) => item.pageCode === pageCode);
