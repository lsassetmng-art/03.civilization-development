"use client";
// MULTILINGUAL_R2_R6_PROVIDER_PORTAL_LOCALE_PATCH

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  PORTAL_DEFAULT_LOCALE,
  normalizePortalLocale,
  resolvePortalBrowserLocale,
  translatePortal,
  type PortalI18nKey,
  type PortalLocaleCode,
} from "../../lib/i18n/portal-i18n";

const PORTAL_LOCALE_STORAGE_KEY = "portal.locale";
const PORTAL_LANGUAGE_STORAGE_KEY = "portal.language";
const PORTAL_LEGACY_LOCALE_STORAGE_KEY = "civilization.portal.locale";

const PORTAL_COMPATIBILITY_STORAGE_KEYS = [
  PORTAL_LOCALE_STORAGE_KEY,
  PORTAL_LANGUAGE_STORAGE_KEY,
  PORTAL_LEGACY_LOCALE_STORAGE_KEY,
  "locale_code",
  "localeCode",
  "language_code",
  "languageCode",
  "locale",
] as const;

export type PortalLocaleSource = "saved" | "browser" | "default";

type PortalI18nContextValue = {
  locale: PortalLocaleCode;
  localeSource: PortalLocaleSource;
  browserLanguages: readonly string[];
  setLocale: (locale: PortalLocaleCode) => void;
  saveLocale: (locale: PortalLocaleCode) => void;
  clearSavedLocale: () => void;
  t: (key: PortalI18nKey) => string;
};

const getBrowserLanguages = (): readonly string[] => {
  if (typeof navigator === "undefined") {
    return [];
  }

  if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
    return navigator.languages.filter((item) => item.trim().length > 0);
  }

  return navigator.language ? [navigator.language] : [];
};

const toCanonicalStorageLocale = (locale: PortalLocaleCode): "ja-jp" | "en-us" =>
  locale === "en" ? "en-us" : "ja-jp";

const toLanguageStorageLocale = (locale: PortalLocaleCode): "ja" | "en" =>
  locale === "en" ? "en" : "ja";

const parseStoredLocaleCandidate = (value: string | null): PortalLocaleCode | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as {
        localeCode?: unknown;
        languageCode?: unknown;
      };

      const localeCandidate =
        typeof parsed.localeCode === "string" ? parsed.localeCode : null;
      const languageCandidate =
        typeof parsed.languageCode === "string" ? parsed.languageCode : null;

      if (localeCandidate) {
        return normalizePortalLocale(localeCandidate);
      }

      if (languageCandidate) {
        return normalizePortalLocale(languageCandidate);
      }
    } catch {
      return null;
    }
  }

  return normalizePortalLocale(trimmed);
};

const readSavedLocale = (): PortalLocaleCode | null => {
  if (typeof window === "undefined") {
    return null;
  }

  for (const key of PORTAL_COMPATIBILITY_STORAGE_KEYS) {
    try {
      const normalized = parseStoredLocaleCandidate(window.localStorage.getItem(key));

      if (normalized) {
        return normalized;
      }
    } catch {
      // localStorage may be unavailable. Continue to the next compatibility key.
    }
  }

  return null;
};

const writeDocumentLang = (locale: PortalLocaleCode): void => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.lang = locale;
};

const writeSavedLocale = (locale: PortalLocaleCode): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PORTAL_LOCALE_STORAGE_KEY, toCanonicalStorageLocale(locale));
  window.localStorage.setItem(PORTAL_LANGUAGE_STORAGE_KEY, toLanguageStorageLocale(locale));
};

const clearSavedLocaleStorage = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  for (const key of PORTAL_COMPATIBILITY_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
  }
};

const PortalI18nContext = createContext<PortalI18nContextValue>({
  locale: PORTAL_DEFAULT_LOCALE,
  localeSource: "default",
  browserLanguages: [],
  setLocale: () => undefined,
  saveLocale: () => undefined,
  clearSavedLocale: () => undefined,
  t: (key) => translatePortal(key, PORTAL_DEFAULT_LOCALE),
});

export const PortalI18nProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [locale, setLocaleState] = useState<PortalLocaleCode>(PORTAL_DEFAULT_LOCALE);
  const [localeSource, setLocaleSource] =
    useState<PortalLocaleSource>("default");
  const [browserLanguages, setBrowserLanguages] = useState<readonly string[]>([]);

  useEffect(() => {
    const savedLocale = readSavedLocale();
    const detectedBrowserLanguages = getBrowserLanguages();
    const browserLocale = resolvePortalBrowserLocale();

    setBrowserLanguages(detectedBrowserLanguages);

    if (savedLocale) {
      setLocaleState(savedLocale);
      setLocaleSource("saved");
      writeDocumentLang(savedLocale);
      return;
    }

    setLocaleState(browserLocale);
    setLocaleSource(detectedBrowserLanguages.length > 0 ? "browser" : "default");
    writeDocumentLang(browserLocale);
  }, []);

  const setLocale = (nextLocale: PortalLocaleCode): void => {
    const normalizedLocale = normalizePortalLocale(nextLocale);
    setLocaleState(normalizedLocale);
    writeDocumentLang(normalizedLocale);
  };

  const saveLocale = (nextLocale: PortalLocaleCode): void => {
    const normalizedLocale = normalizePortalLocale(nextLocale);
    writeSavedLocale(normalizedLocale);
    setLocaleState(normalizedLocale);
    setLocaleSource("saved");
    writeDocumentLang(normalizedLocale);
  };

  const clearSavedLocale = (): void => {
    clearSavedLocaleStorage();

    const detectedBrowserLanguages = getBrowserLanguages();
    const browserLocale = resolvePortalBrowserLocale();

    setBrowserLanguages(detectedBrowserLanguages);
    setLocaleState(browserLocale);
    setLocaleSource(detectedBrowserLanguages.length > 0 ? "browser" : "default");
    writeDocumentLang(browserLocale);
  };

  const value = useMemo<PortalI18nContextValue>(
    () => ({
      locale,
      localeSource,
      browserLanguages,
      setLocale,
      saveLocale,
      clearSavedLocale,
      t: (key) => translatePortal(key, locale),
    }),
    [locale, localeSource, browserLanguages],
  );

  return (
    <PortalI18nContext.Provider value={value}>
      {children}
    </PortalI18nContext.Provider>
  );
};

export const usePortalI18n = (): PortalI18nContextValue =>
  useContext(PortalI18nContext);
