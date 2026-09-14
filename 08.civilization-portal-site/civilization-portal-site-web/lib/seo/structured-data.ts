import type { PortalSeoPageDescriptor } from "../../types/portal-seo-api";

export const buildStructuredDataFromSeoDescriptor = (
  descriptor: PortalSeoPageDescriptor,
): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": descriptor.structuredType,
  name: descriptor.structuredName,
  description: descriptor.structuredDescription,
  url: descriptor.canonicalPath,
});
