"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { usePortalContext } from "@/components/usePortalContext";
import { appendAerialAccessTokenSignal, hasAerialAccessTokenClient } from "@/lib/aerial-access";
import { civilizationMenuCopy } from "@/lib/civilization-menu-copy";
import { withPortalLanguage } from "@/lib/portal-context";

function buildStoryHref(locale: string, search: string): string {
  const params = new URLSearchParams();
  params.set("language_code", locale);
  appendAerialAccessTokenSignal(params, search);
  return `/story-mode?${params.toString()}`;
}

export default function CivilizationMenuPage() {
  const portalContext = usePortalContext();
  const locale = portalContext.languageCode;
  const copy = civilizationMenuCopy(locale);
  const [hasAerialAccess, setHasAerialAccess] = useState(false);
  const [storyHref, setStoryHref] = useState(withPortalLanguage("/story-mode", locale));

  useEffect(() => {
    setHasAerialAccess(hasAerialAccessTokenClient(window.location.search));
    setStoryHref(buildStoryHref(locale, window.location.search));
  }, [locale]);

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = withPortalLanguage("/login", locale);
  }

  return (
    <AppShell locale={locale}>
      <section className="civ-menu-blue-stage" aria-label="civilization-menu">
        <div className="civ-menu-blue-map" data-ui-marker="civilization-menu-blue-concept">
          <Link className="civ-blue-node civ-blue-node-observe" href={withPortalLanguage("/global-map", locale)}>
            <span className="civ-blue-node-gloss" aria-hidden="true" />
            <span className="civ-blue-node-text">{copy.observeTitle}</span>
          </Link>

          <button className="civ-blue-node civ-blue-node-center" type="button" onClick={goBack}>
            <span className="civ-blue-node-gloss" aria-hidden="true" />
            <span className="civ-blue-node-text">{copy.civilizationTitle}</span>
          </button>

          {hasAerialAccess ? (
            <Link className="civ-blue-node civ-blue-node-cx" href={storyHref}>
              <span className="civ-blue-node-gloss" aria-hidden="true" />
              <span className="civ-blue-node-text">{copy.cxTitle}</span>
            </Link>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
