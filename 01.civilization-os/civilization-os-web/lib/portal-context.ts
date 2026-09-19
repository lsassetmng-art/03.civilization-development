import type { PortalLocaleContext, SupportedLocale } from "@/types/locale";
import type { AuthReturnTarget } from "@/types/auth";
import { defaultLocale, normalizeLocale } from "@/lib/i18n";

function normalizePortalLanguageInput(value: string | null): string | null {
  const normalized = value?.trim().toLowerCase().replace("_", "-");
  if (normalized === "en-us") return "en";
  if (normalized === "ja-jp") return "ja";
  return value;
}


export function readPortalContextFromSearch(search: string): PortalLocaleContext & AuthReturnTarget {
  const params = new URLSearchParams(search);

  const languageCode: SupportedLocale = normalizeLocale(
    normalizePortalLanguageInput(
      params.get("locale_code") ?? params.get("localeCode") ?? params.get("language_code") ?? params.get("locale") ?? params.get("lang")
    )
  );

  return {
    languageCode,
    source: languageCode === defaultLocale ? "default" : "portal_query",
    requestedOsCode: params.get("requested_os_code") ?? params.get("requestedOsCode") ?? undefined,
    returnTarget: params.get("return_target") ?? params.get("returnTarget") ?? undefined
  };
}

export function withPortalLanguage(path: string, languageCode: SupportedLocale): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}locale_code=${encodeURIComponent(languageCode === "en" ? "en-us" : "ja-jp")}&language_code=${encodeURIComponent(languageCode)}`;
}

export function resolvePostAuthTarget(target: AuthReturnTarget): string {
  if (target.returnTarget && target.returnTarget.startsWith("/")) return target.returnTarget;
  return "/global-map";
}
