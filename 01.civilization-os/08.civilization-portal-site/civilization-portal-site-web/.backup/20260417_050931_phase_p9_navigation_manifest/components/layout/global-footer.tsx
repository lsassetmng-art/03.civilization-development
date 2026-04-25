import Link from "next/link";
import { SITE_CONFIG } from "../../config/site";
import { ROUTES } from "../../lib/routing/routes";

export function GlobalFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <p className="footer-title">{SITE_CONFIG.name}</p>
          <p className="footer-copy">
            Public information, authentication guidance, official OS entry, and launcher access.
          </p>
        </div>

        <div className="footer-links">
          <Link href={ROUTES.osCatalog} className="footer-link">
            OS Catalog
          </Link>
          <Link href={ROUTES.guide} className="footer-link">
            Guide
          </Link>
          <Link href={ROUTES.admin} className="footer-link">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
