import type { PortalOsCard } from "../../types/os";

export const OS_CATALOG: PortalOsCard[] = [
  {
    code: "civilization-os",
    name: "CivilizationOS",
    category: "Core",
    tagline: "The main civilization surface",
    summary: "Primary core OS for Civilization.",
    availability: "available",
    accessLevel: "public",
    featured: true,
    heroPoints: ["Core entry", "Shared governance", "Portal-linked"],
  },
  {
    code: "persona-os",
    name: "PersonaOS",
    category: "Identity",
    tagline: "Persona and identity management",
    summary: "Persona-side identity, snapshot, and persona-boundary surface.",
    availability: "available",
    accessLevel: "member",
    featured: true,
    heroPoints: ["Persona boundary", "Identity flow", "Snapshot aware"],
  },
  {
    code: "business-os",
    name: "BusinessOS",
    category: "Business",
    tagline: "Business-facing operational surface",
    summary: "Business and ERP-adjacent operational surface.",
    availability: "available",
    accessLevel: "member",
    featured: true,
    heroPoints: ["ERP linkage", "Business tools", "Operator aware"],
  },
  {
    code: "life-os",
    name: "LifeOS",
    category: "Life",
    tagline: "Life-oriented applications",
    summary: "Life-related tools and personal operational flows.",
    availability: "available",
    accessLevel: "member",
    featured: false,
    heroPoints: ["Life tools", "Personal flow", "Planner linked"],
  },
  {
    code: "streaming-os",
    name: "StreamingOS",
    category: "Media",
    tagline: "Streaming and viewer surfaces",
    summary: "Streaming viewer and creator-related routes.",
    availability: "available",
    accessLevel: "public",
    featured: false,
    heroPoints: ["Viewer flow", "Content access", "Media routes"],
  },
];

export const findOsByCode = (code: string): PortalOsCard | undefined =>
  OS_CATALOG.find((item) => item.code === code);
