import type { PortalOsCard } from "../../types/os";

export const OS_CATALOG: PortalOsCard[] = [
  {
    code: "civilization-os",
    name: "CivilizationOS",
    category: "Core OS",
    tagline: "The canonical identity and world entry OS.",
    summary:
      "Owns sign-up, authentication, Civilization ID issuance, and the main world entry point.",
    availability: "active",
    accessLevel: "public",
    featured: true,
    heroPoints: [
      "Canonical sign-up owner",
      "Canonical authentication owner",
      "Shared identity foundation for all OS",
    ],
    launchUrl: "/guide?launch=civilization-os&mode=portal-preview",
  },
  {
    code: "persona-os",
    name: "PersonaOS",
    category: "Identity OS",
    tagline: "Manage distributable personas and related assets.",
    summary:
      "Covers persona profile management, marketplace-ready persona distribution, and controlled asset eligibility.",
    availability: "active",
    accessLevel: "login-required",
    featured: true,
    heroPoints: [
      "Persona management",
      "Distribution workflow support",
      "Linked from the official portal only",
    ],
    launchUrl: "/guide?launch=persona-os&mode=portal-preview",
    eligibility: {
      requiredContractTier: "free",
    },
  },
  {
    code: "business-os",
    name: "BusinessOS",
    category: "Business OS",
    tagline: "Business operations and paid application hub.",
    summary:
      "Provides user-scoped business applications and selected ERP-connected paid options.",
    availability: "active",
    accessLevel: "restricted",
    featured: true,
    heroPoints: [
      "Business app hub",
      "ERP-connected paid options",
      "Operator-controlled access",
    ],
    launchUrl: "/guide?launch=business-os&mode=portal-preview",
    eligibility: {
      allowedEntityTypes: ["human"],
      requiredContractTier: "business",
      requiredAffiliation: "operator",
    },
  },
  {
    code: "game-os",
    name: "GameOS",
    category: "Entertainment OS",
    tagline: "Interactive game entry point inside Civilization.",
    summary:
      "Hosts game experiences and related world entry flows while staying behind the official portal.",
    availability: "active",
    accessLevel: "public",
    featured: false,
    heroPoints: [
      "Public discoverability",
      "Official entry only",
      "Portal-based catalog access",
    ],
    launchUrl: "/guide?launch=game-os&mode=portal-preview",
  },
  {
    code: "streaming-os",
    name: "StreamingOS",
    category: "Media OS",
    tagline: "Video watching, creator operations, and streaming access.",
    summary:
      "Supports viewer entry, creator-side operations, and portal-controlled launch routing.",
    availability: "active",
    accessLevel: "login-required",
    featured: true,
    heroPoints: [
      "Viewer and creator routes",
      "Portal launch decision support",
      "Membership-aware entry",
    ],
    launchUrl: "/guide?launch=streaming-os&mode=portal-preview",
    eligibility: {
      requiredContractTier: "free",
    },
  },
  {
    code: "life-os",
    name: "LifeOS",
    category: "Life OS",
    tagline: "Personal life applications and user-life data domain.",
    summary:
      "Represents the real-world life system and related personal apps in a distinct user-life domain.",
    availability: "maintenance",
    accessLevel: "login-required",
    featured: false,
    heroPoints: [
      "Personal life domain",
      "Separate from PersonaOS data",
      "Maintenance-safe routing",
    ],
    launchUrl: "/guide?launch=life-os&mode=portal-preview",
    eligibility: {
      requiredContractTier: "free",
    },
  },
  {
    code: "staticart-os",
    name: "StaticArtOS",
    category: "Creative OS",
    tagline: "Static visual art and digital publishing management.",
    summary:
      "Handles static works such as illustrations and books, with future review-based cloud eligibility paths.",
    availability: "active",
    accessLevel: "restricted",
    featured: false,
    heroPoints: [
      "Static art and book handling",
      "Review-gated cloud eligibility",
      "Knowledge-ready placement planning",
    ],
    launchUrl: "/guide?launch=staticart-os&mode=portal-preview",
    eligibility: {
      allowedEntityTypes: ["human"],
      requiredContractTier: "pro",
      betaFlag: "staticart-beta",
    },
  },
];

export const findOsByCode = (osCode: string): PortalOsCard | undefined =>
  OS_CATALOG.find((item) => item.code === osCode);
