"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { usePortalContext } from "@/components/usePortalContext";
import { hasAerialAccessTokenClient } from "@/lib/aerial-access";
import { civilizationMenuCopy } from "@/lib/civilization-menu-copy";
import { withPortalLanguage } from "@/lib/portal-context";

export default function StoryModePage() {
  const portalContext = usePortalContext();
  const locale = portalContext.languageCode;
  const copy = civilizationMenuCopy(locale);
  const [hasAerialAccess, setHasAerialAccess] = useState(false);

  useEffect(() => {
    setHasAerialAccess(hasAerialAccessTokenClient(window.location.search));
  }, []);

  return (
    <AppShell locale={locale}>
      <section className="card story-mode-card">
        <p className="kicker">{copy.storyKicker}</p>
        {hasAerialAccess ? (
          <>
            <h1>{copy.storyTitle}</h1>
            <p>{copy.storyDescription}</p>
          </>
        ) : (
          <>
            <h1>{copy.storyLockedTitle}</h1>
            <p>{copy.storyLockedDescription}</p>
          </>
        )}

        <Link className="button" href={withPortalLanguage("/civilization-menu", locale)}>
          {copy.backToMenu}
        </Link>
      </section>
    </AppShell>
  );
}
