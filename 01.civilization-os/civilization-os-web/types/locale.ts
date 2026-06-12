export type SupportedLocale = "ja" | "en";

export type PortalLocaleContext = {
  languageCode: SupportedLocale;
  source: "portal_query" | "default";
};

/* MULTILINGUAL_R2_R5A_LOCALE_TYPES */
export type CivilizationLocaleCode = "ja-jp" | "en-us";
export type CivilizationLanguageCode = "ja" | "en";
export type LocaleCode = CivilizationLocaleCode;
export type LanguageCode = CivilizationLanguageCode;
