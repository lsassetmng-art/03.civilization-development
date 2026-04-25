import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "../../lib/routing/routes";

export const metadata: Metadata = {
  title: "Guide | Civilization Portal Site",
  description: "Portal-first guide for navigation, launcher, and support entry.",
};

export default function Page() {
  return (
    <div className="page-stack">
      <section className="page-section">
        <article className="card">
          <p className="eyebrow">Guide</p>
          <h1 className="card-title">How to use the portal</h1>
          <ul className="list">
            <li>Start from Home or Search.</li>
            <li>Use OS Catalog to browse supported OS entries.</li>
            <li>Open Launcher when signed in.</li>
            <li>Use Help, Policy, Terms, and Contact for support.</li>
          </ul>
          <div className="button-row">
            <Link href={ROUTES.help} className="button-link">
              Open Help
            </Link>
            <Link href={ROUTES.launcher} className="secondary-button">
              Open Launcher
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
