import Link from "next/link";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { ROUTES } from "../../lib/routing/routes";

export default function Page() {
  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="System State"
        title="Maintenance in progress"
        description="The requested route is currently protected by portal maintenance handling."
      />

      <section className="page-section">
        <article className="card">
          <p className="section-copy">
            Portal-side entry decisions can reroute requests here when an OS is temporarily unavailable.
          </p>
          <div className="button-row">
            <Link href={ROUTES.home} className="button-link">
              Return Home
            </Link>
            <Link href={ROUTES.osCatalog} className="secondary-link">
              Browse Other OS
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
