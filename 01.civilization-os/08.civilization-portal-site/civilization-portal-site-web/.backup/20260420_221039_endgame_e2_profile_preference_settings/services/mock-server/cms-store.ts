import { PORTAL_CMS_SEED_PAGES } from "../../mocks/cms/seed-pages";
import type {
  PortalCmsPageDocument,
  PortalCmsSection,
} from "../../types/portal-cms-api";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const nowIso = (): string => new Date().toISOString();

let pageDocuments: PortalCmsPageDocument[] = clone(PORTAL_CMS_SEED_PAGES);

const sortPages = (items: PortalCmsPageDocument[]): PortalCmsPageDocument[] =>
  [...items].sort((a, b) => a.pageCode.localeCompare(b.pageCode));

export const getPublicCmsPage = (
  pageCode: "home" | "civilization" | "guide",
): PortalCmsPageDocument | undefined =>
  clone(pageDocuments.find((item) => item.pageCode === pageCode));

export const listAdminCmsPages = (): PortalCmsPageDocument[] =>
  clone(sortPages(pageDocuments));

const normalizeSections = (sections: PortalCmsSection[]): PortalCmsSection[] =>
  sections.map((section, index) => ({
    ...section,
    id: section.id || crypto.randomUUID(),
    sectionCode: section.sectionCode || `section-${index + 1}`,
  }));

export const upsertCmsPage = (input: {
  pageCode: "home" | "civilization" | "guide";
  eyebrow: string;
  title: string;
  description: string;
  sections: PortalCmsSection[];
}): PortalCmsPageDocument => {
  const index = pageDocuments.findIndex((item) => item.pageCode === input.pageCode);

  const item: PortalCmsPageDocument = {
    id: index >= 0 ? pageDocuments[index].id : crypto.randomUUID(),
    pageCode: input.pageCode,
    eyebrow: input.eyebrow,
    title: input.title,
    description: input.description,
    lastUpdatedAt: nowIso(),
    sections: normalizeSections(input.sections),
  };

  if (index >= 0) {
    pageDocuments[index] = item;
  } else {
    pageDocuments = [...pageDocuments, item];
  }

  return clone(item);
};
