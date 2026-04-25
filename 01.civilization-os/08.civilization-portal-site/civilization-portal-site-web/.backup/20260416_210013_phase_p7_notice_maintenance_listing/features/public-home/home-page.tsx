import Link from "next/link";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { HOME_NOTICES } from "../../mocks/notices/list";
import { OS_CATALOG } from "../../mocks/os/catalog";
import { ROUTES, buildOsDetailRoute } from "../../lib/routing/routes";

export function HomePage() {
  const featured = OS_CATALOG.filter((item) => item.featured);

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="Official Web Entry"
        title="Civilization Portal Site"
        description="The official public entry for Civilization information, authentication guidance, OS catalog access, and post-login launcher routing."
      />

      <section className="hero-card">
        <div className="chip-row">
          <span className="chip">Public information</span>
          <span className="chip">Official OS links only</span>
          <span className="chip">Launcher-aware</span>
        </div>

        <p className="section-copy">
          This portal is the only official web entry to Civilization OS destinations.
          Sign-up and authentication remain owned by CivilizationOS, while this portal
          owns the public explanation layer, official OS introduction, and launcher-side
          entry routing.
        </p>

        <div className="button-row">
          <Link href={ROUTES.osCatalog} className="button-link">
            Explore OS Catalog
          </Link>
          <Link href={ROUTES.civilization} className="secondary-link">
            Read Civilization Overview
          </Link>
          <Link href={ROUTES.launcher} className="secondary-link">
            Open My Launcher
          </Link>
        </div>
      </section>

      <section className="page-section">
        <h2 className="section-title">Featured OS</h2>
        <div className="grid-3">
          {featured.map((item) => (
            <article key={item.code} className="card">
              <p className="eyebrow">{item.category}</p>
              <h3 className="card-title">{item.name}</h3>
              <p className="card-copy">{item.tagline}</p>
              <ul className="list">
                {item.heroPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <div className="button-row">
                <Link href={buildOsDetailRoute(item.code)} className="button-link">
                  View Detail
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section">
        <h2 className="section-title">Current Notices</h2>
        <div className="grid-3">
          {HOME_NOTICES.map((notice) => (
            <article key={notice.slug} className="card">
              <p className="eyebrow">{notice.level.toUpperCase()}</p>
              <h3 className="card-title">{notice.title}</h3>
              <p className="card-copy">{notice.summary}</p>
              <p className="meta-text">Published: {notice.publishedOn}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
