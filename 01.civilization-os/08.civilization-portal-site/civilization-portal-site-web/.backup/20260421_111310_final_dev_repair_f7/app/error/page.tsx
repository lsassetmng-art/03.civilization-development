import Link from "next/link";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { ROUTES } from "../../lib/routing/routes";

export default function Page() {
  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="Portal Error"
        title="Unable to continue"
        description="The portal could not resolve the requested entry because the route or launch data is incomplete."
      />

      <section className="page-section">
        <article className="card">
          <p className="section-copy">
            This page is used by the current minimal implementation when launch data cannot be resolved safely.
          </p>
          <div className="button-row">
            <Link href={ROUTES.home} className="button-link">
              Go Home
            </Link>
            <Link href={ROUTES.osCatalog} className="secondary-link">
              Open OS Catalog
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
