import Link from "next/link";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { OS_CATALOG } from "../../mocks/os/catalog";
import { buildOsDetailRoute } from "../../lib/routing/routes";

const formatAvailability = (value: string): string =>
  value.replace("-", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const formatAccessLevel = (value: string): string =>
  value.replace("-", " ").replace(/\b\w/g, (char) => char.toUpperCase());

export function OsListPage() {
  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="OS Catalog"
        title="Official OS entry directory"
        description="The portal holds the only official web links for OS entry. Each OS detail page explains access conditions before launch."
      />

      <section className="page-section">
        <div className="grid-3">
          {OS_CATALOG.map((item) => (
            <article key={item.code} className="card">
              <p className="eyebrow">{item.category}</p>
              <h2 className="card-title">{item.name}</h2>
              <p className="card-copy">{item.summary}</p>

              <div className="chip-row">
                <span className="chip">{formatAvailability(item.availability)}</span>
                <span className="chip">{formatAccessLevel(item.accessLevel)}</span>
              </div>

              <ul className="list">
                {item.heroPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <div className="button-row">
                <Link href={buildOsDetailRoute(item.code)} className="button-link">
                  Open Detail
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
