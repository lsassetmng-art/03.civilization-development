import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalContactChannelItem,
  PortalHelpArticleItem,
  PortalPolicyDocumentItem,
  PortalSupportContactTicket,
} from "../../types/portal-support-api";

const nowIso = (): string => new Date().toISOString();
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const helpArticles: PortalHelpArticleItem[] = [
  {
    id: "help-001",
    code: "help-portal-entry",
    title: "How to start from the portal",
    summary: "Use the portal as the official public entry for Civilization web surfaces.",
    body: "Start from the portal, review OS entries, and continue through the official launcher-aware flow.",
    category: "getting-started",
    href: "/help",
    priority: 10,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "help-002",
    code: "help-launcher",
    title: "How to use the launcher",
    summary: "The launcher evaluates what can be opened for the current session.",
    body: "Login state, contract tier, affiliation, and portal settings all influence launcher decisions.",
    category: "launcher",
    href: "/help",
    priority: 20,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "help-003",
    code: "help-search",
    title: "How search and recommendations work",
    summary: "Search results and recommendations help route you to the right entry point.",
    body: "Search queries, recommendation rules, and support pages work together to guide users to supported routes.",
    category: "navigation",
    href: "/help",
    priority: 30,
    lastUpdatedAt: nowIso(),
  },
];

const policyDocuments: PortalPolicyDocumentItem[] = [
  {
    id: "policy-001",
    code: "policy-privacy",
    title: "Privacy overview",
    summary: "How portal usage information and operational data are handled.",
    body: "The portal records operational information needed for navigation, support, and service improvement within approved system boundaries.",
    versionLabel: "v1.0",
    effectiveDate: "2026-04-21",
    href: "/policy",
    priority: 10,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "policy-002",
    code: "policy-support",
    title: "Support handling policy",
    summary: "How submitted support requests are accepted and routed.",
    body: "Support requests are received through approved contact flows and handled according to category, urgency, and operational scope.",
    versionLabel: "v1.0",
    effectiveDate: "2026-04-21",
    href: "/policy",
    priority: 20,
    lastUpdatedAt: nowIso(),
  },
];

const termsDocuments: PortalPolicyDocumentItem[] = [
  {
    id: "terms-001",
    code: "terms-service",
    title: "Portal terms of use",
    summary: "The portal is the official public entry for supported web routes.",
    body: "Users should access supported public routes through the portal and follow official sign-in, launcher, and support flows.",
    versionLabel: "v1.0",
    effectiveDate: "2026-04-21",
    href: "/terms",
    priority: 10,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "terms-002",
    code: "terms-availability",
    title: "Availability and operational terms",
    summary: "Features and routes may change based on service state and session conditions.",
    body: "Availability depends on system status, user state, contract rules, and operational decisions.",
    versionLabel: "v1.0",
    effectiveDate: "2026-04-21",
    href: "/terms",
    priority: 20,
    lastUpdatedAt: nowIso(),
  },
];

const contactChannels: PortalContactChannelItem[] = [
  {
    id: "contact-001",
    code: "contact-form",
    title: "Support request form",
    description: "Submit general, policy, technical, or account questions through the portal form.",
    channelType: "form",
    href: "/contact",
    availability: "Available anytime",
    priority: 10,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "contact-002",
    code: "contact-help-guide",
    title: "Help and guide first",
    description: "Check Help and Policy pages before submitting a request.",
    channelType: "guide",
    href: "/help",
    availability: "Available anytime",
    priority: 20,
    lastUpdatedAt: nowIso(),
  },
  {
    id: "contact-003",
    code: "contact-email",
    title: "Support contact mailbox",
    description: "Use the formal support mailbox when reply tracking is needed.",
    channelType: "email",
    href: "mailto:support@example.invalid",
    availability: "Business review flow",
    priority: 30,
    lastUpdatedAt: nowIso(),
  },
];

let submittedTickets: PortalSupportContactTicket[] = [];

const sortByPriority = <T extends { priority: number; title: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.title.localeCompare(b.title);
  });

export const getSupportCenter = (_input: {
  surface: "help" | "policy" | "terms" | "contact" | "home" | "launcher";
  session: PortalSessionSummary;
}): {
  helpArticles: PortalHelpArticleItem[];
  policyDocuments: PortalPolicyDocumentItem[];
  termsDocuments: PortalPolicyDocumentItem[];
  contactChannels: PortalContactChannelItem[];
} => ({
  helpArticles: clone(sortByPriority(helpArticles)),
  policyDocuments: clone(sortByPriority(policyDocuments)),
  termsDocuments: clone(sortByPriority(termsDocuments)),
  contactChannels: clone(sortByPriority(contactChannels)),
});

export const submitSupportContact = (input: {
  session: PortalSessionSummary;
  category: "general" | "policy" | "technical" | "account";
  subject: string;
  body: string;
  replyEmail?: string;
}): PortalSupportContactTicket => {
  const ticket: PortalSupportContactTicket = {
    id: crypto.randomUUID(),
    category: input.category,
    subject: input.subject,
    body: input.body,
    replyEmail: input.replyEmail || undefined,
    status: "received",
    submittedAt: nowIso(),
  };

  submittedTickets = [ticket, ...submittedTickets].slice(0, 200);
  return clone(ticket);
};
