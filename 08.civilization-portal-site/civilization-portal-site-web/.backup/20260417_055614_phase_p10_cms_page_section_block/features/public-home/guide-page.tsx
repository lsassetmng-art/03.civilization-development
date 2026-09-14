import Link from "next/link";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { ROUTES } from "../../lib/routing/routes";

export function GuidePage() {
  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="Usage Guide"
        title="How to use the portal"
        description="Portal-first navigation, CivilizationOS-owned authentication, and launcher-based OS entry are the current operating model."
      />

      <section className="page-section">
        <div className="grid-3">
          <article className="card">
            <h2 className="section-title">1. Discover</h2>
            <p className="card-copy">
              Start on the public portal pages and browse the official OS catalog.
            </p>
          </article>

          <article className="card">
            <h2 className="section-title">2. Authenticate</h2>
            <p className="card-copy">
              When an OS requires login, the portal routes the user into the CivilizationOS
              authentication flow.
            </p>
          </article>

          <article className="card">
            <h2 className="section-title">3. Continue</h2>
            <p className="card-copy">
              After authentication, the portal resolves the saved return context and routes
              the user back to the requested destination.
            </p>
          </article>
        </div>
      </section>

      <section className="page-section">
        <article className="card">
          <h2 className="section-title">Important rule</h2>
          <p className="section-copy">
            This implementation currently uses a mock authentication bridge so the entry
            sequence can be validated before real CivilizationOS integration is wired in.
          </p>
          <div className="button-row">
            <Link href={ROUTES.login} className="button-link">
              Open Login Entry
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
