import type { Metadata } from "next";
import Link from "next/link";
import { buildOsDetailRoute } from "../../lib/routing/routes";
import { OS_CATALOG } from "../../mocks/os/catalog";

export const metadata: Metadata = {
  title: "OS Catalog | Civilization Portal Site",
  description: "Official OS entry directory for Civilization.",
};

export default function Page() {
  return (
    <div className="page-stack">
      <section className="page-section">
        <article className="card">
          <p className="eyebrow">OS Catalog</p>
          <h1 className="card-title">Official OS entries</h1>
          <p className="card-copy">
            Browse official OS entries and open the detail page for each supported OS.
          </p>
        </article>
      </section>

      <section className="page-section">
        <div className="grid-3">
          {OS_CATALOG.map((item) => (
            <article key={item.code} className="card">
              <p className="eyebrow">{item.category}</p>
              <h3 className="card-title">{item.name}</h3>
              <p className="card-copy">{item.tagline}</p>
              <div className="button-row">
                <Link href={buildOsDetailRoute(item.code)} className="button-link">
                  View Detail
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
