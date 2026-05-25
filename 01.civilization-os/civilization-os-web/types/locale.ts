export type SupportedLocale = "ja" | "en";

export type PortalLocaleContext = {
  languageCode: SupportedLocale;
  source: "portal_query" | "default";
};
