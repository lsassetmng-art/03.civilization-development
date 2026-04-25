import Link from "next/link";
import { SITE_CONFIG } from "../../config/site";
import { ROUTES } from "../../lib/routing/routes";

const NAV_ITEMS = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.civilization, label: "Civilization" },
  { href: ROUTES.osCatalog, label: "OS Catalog" },
  { href: ROUTES.guide, label: "Guide" },
  { href: ROUTES.launcher, label: "Launcher" },
  { href: ROUTES.login, label: "Login" },
];

export function GlobalHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand-block">
          <Link href={ROUTES.home} className="brand-name">
            {SITE_CONFIG.name}
          </Link>
          <p className="brand-tagline">Official web entry for Civilization</p>
        </div>

        <nav className="nav-links" aria-label="Global navigation">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
