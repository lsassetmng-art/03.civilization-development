import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "../../lib/routing/routes";

export const metadata: Metadata = {
  title: "Civilization | Civilization Portal Site",
  description: "Overview of Civilization from the portal surface.",
};

export default function Page() {
  return (
    <div className="page-stack">
      <section className="page-section">
        <article className="card">
          <p className="eyebrow">Civilization</p>
          <h1 className="card-title">What Civilization is</h1>
          <p className="card-copy">
            Civilization Portal Site is the official public entry surface that routes
            users to supported pages, OS entries, launcher flows, and support resources.
          </p>
          <div className="button-row">
            <Link href={ROUTES.guide} className="button-link">
              Read Guide
            </Link>
            <Link href={ROUTES.osCatalog} className="secondary-button">
              Open OS Catalog
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
