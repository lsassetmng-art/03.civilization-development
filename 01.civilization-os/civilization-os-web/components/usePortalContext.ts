"use client";

import { useEffect, useState } from "react";
import type { PortalLocaleContext } from "@/types/locale";
import type { AuthReturnTarget } from "@/types/auth";
import { defaultLocale } from "@/lib/i18n";
import { readPortalContextFromSearch } from "@/lib/portal-context";

export function usePortalContext(): PortalLocaleContext & AuthReturnTarget {
  const [context, setContext] = useState<PortalLocaleContext & AuthReturnTarget>({
    languageCode: defaultLocale,
    source: "default"
  });

  useEffect(() => {
    setContext(readPortalContextFromSearch(window.location.search));
  }, []);

  return context;
}
