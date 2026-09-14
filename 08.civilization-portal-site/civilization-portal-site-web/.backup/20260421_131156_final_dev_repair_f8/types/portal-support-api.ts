import type { PortalSessionSummary } from "./auth";
import type { PortalApiMeta } from "./portal-api";

export type PortalSupportSurface =
  | "help"
  | "policy"
  | "terms"
  | "contact"
  | "home"
  | "launcher";

export type PortalHelpArticleItem = {
  id: string;
  code: string;
  title: string;
  summary: string;
  body: string;
  category: string;
  href: string;
  priority: number;
  lastUpdatedAt: string;
};

export type PortalPolicyDocumentItem = {
  id: string;
  code: string;
  title: string;
  summary: string;
  body: string;
  versionLabel: string;
  effectiveDate: string;
  href: string;
  priority: number;
  lastUpdatedAt: string;
};

export type PortalContactChannelItem = {
  id: string;
  code: string;
  title: string;
  description: string;
  channelType: "form" | "email" | "guide";
  href?: string;
  availability: string;
  priority: number;
  lastUpdatedAt: string;
};

export type PortalSupportContactTicket = {
  id: string;
  category: "general" | "policy" | "technical" | "account";
  subject: string;
  body: string;
  replyEmail?: string;
  status: "received";
  submittedAt: string;
};

export type PortalPublicSupportCenterGetRequest = {
  surface: PortalSupportSurface;
  session: PortalSessionSummary;
};

export type PortalPublicSupportCenterGetResponse = {
  meta: PortalApiMeta;
  data: {
    helpArticles: PortalHelpArticleItem[];
    policyDocuments: PortalPolicyDocumentItem[];
    termsDocuments: PortalPolicyDocumentItem[];
    contactChannels: PortalContactChannelItem[];
  };
};

export type PortalPublicSupportContactSubmitRequest = {
  session: PortalSessionSummary;
  category: "general" | "policy" | "technical" | "account";
  subject: string;
  body: string;
  replyEmail?: string;
};

export type PortalPublicSupportContactSubmitResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalSupportContactTicket;
  };
};
