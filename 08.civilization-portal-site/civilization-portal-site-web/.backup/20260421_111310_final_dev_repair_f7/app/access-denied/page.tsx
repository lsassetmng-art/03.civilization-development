import Link from "next/link";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { ROUTES } from "../../lib/routing/routes";

export default function Page() {
  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="Access Result"
        title="Access denied"
        description="The current session does not satisfy the OS entry conditions for this route."
      />

      <section className="page-section">
        <article className="card">
          <p className="section-copy">
            Entry can be blocked because of login state, entity type, affiliation, contract tier,
            beta eligibility, or other policy conditions.
          </p>
          <div className="button-row">
            <Link href={ROUTES.osCatalog} className="button-link">
              Back to OS Catalog
            </Link>
            <Link href={ROUTES.launcher} className="secondary-link">
              Open Launcher
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
