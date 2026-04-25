import Link from "next/link";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { ROUTES } from "../../lib/routing/routes";

export function CivilizationPage() {
  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="System Overview"
        title="What Civilization is"
        description="Civilization Portal Site explains Civilization publicly, but canonical sign-up and authentication stay in CivilizationOS."
      />

      <section className="page-section">
        <div className="grid-2">
          <article className="card">
            <h2 className="section-title">Portal responsibilities</h2>
            <ul className="list">
              <li>Public explanation of Civilization</li>
              <li>Official introduction to each OS</li>
              <li>Single official web links to OS destinations</li>
              <li>Launcher entry after login</li>
              <li>Notice and maintenance presentation</li>
            </ul>
          </article>

          <article className="card">
            <h2 className="section-title">CivilizationOS responsibilities</h2>
            <ul className="list">
              <li>Canonical sign-up</li>
              <li>Canonical authentication</li>
              <li>Civilization ID issuance</li>
              <li>Main world entry after authentication</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="page-section">
        <article className="card">
          <h2 className="section-title">Boundary rule</h2>
          <p className="section-copy">
            OS-to-OS direct web links are not allowed. The portal remains the official
            holding point for web entry links, while CivilizationOS remains the canonical
            owner of sign-up and authentication.
          </p>
          <div className="button-row">
            <Link href={ROUTES.osCatalog} className="button-link">
              Browse OS Catalog
            </Link>
            <Link href={ROUTES.guide} className="secondary-link">
              Read Usage Guide
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
