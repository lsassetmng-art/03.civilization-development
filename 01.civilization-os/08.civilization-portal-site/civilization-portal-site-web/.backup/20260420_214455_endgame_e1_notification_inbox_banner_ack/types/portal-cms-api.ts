import type { PortalSessionSummary } from "./auth";
import type { PortalApiMeta } from "./portal-api";

export type PortalCmsBlockTone = "info" | "warning" | "success";
export type PortalCmsSectionLayout = "stack" | "grid-2";

export type PortalCmsParagraphBlock = {
  kind: "paragraph";
  body: string;
};

export type PortalCmsBulletListBlock = {
  kind: "bullet_list";
  items: string[];
};

export type PortalCmsCalloutBlock = {
  kind: "callout";
  title: string;
  body: string;
  tone: PortalCmsBlockTone;
};

export type PortalCmsImageSlotBlock = {
  kind: "image_slot";
  assetCode: string;
  caption: string;
};

export type PortalCmsFileReferenceBlock = {
  kind: "file_reference";
  assetCode: string;
  label: string;
};

export type PortalCmsBlock =
  | PortalCmsParagraphBlock
  | PortalCmsBulletListBlock
  | PortalCmsCalloutBlock
  | PortalCmsImageSlotBlock
  | PortalCmsFileReferenceBlock;

export type PortalCmsSection = {
  id: string;
  sectionCode: string;
  title: string;
  layout: PortalCmsSectionLayout;
  blocks: PortalCmsBlock[];
};

export type PortalCmsPageDocument = {
  id: string;
  pageCode: "home" | "civilization" | "guide";
  eyebrow: string;
  title: string;
  description: string;
  lastUpdatedAt: string;
  sections: PortalCmsSection[];
};

export type PortalPublicCmsPageGetRequest = {
  pageCode: "home" | "civilization" | "guide";
};

export type PortalPublicCmsPageGetResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalCmsPageDocument;
  };
};

export type PortalAdminCmsPageListRequest = {
  scope: "admin";
  session: PortalSessionSummary;
};

export type PortalAdminCmsPageListResponse = {
  meta: PortalApiMeta;
  data: {
    items: PortalCmsPageDocument[];
  };
};

export type PortalAdminCmsPageUpsertRequest = {
  scope: "admin";
  session: PortalSessionSummary;
  pageCode: "home" | "civilization" | "guide";
  eyebrow: string;
  title: string;
  description: string;
  sections: PortalCmsSection[];
};

export type PortalAdminCmsPageUpsertResponse = {
  meta: PortalApiMeta;
  data: {
    item: PortalCmsPageDocument;
  };
};
