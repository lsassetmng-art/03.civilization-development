import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Denied | Civilization Portal Site",
  description: "Access denied page.",
};

export default function Page() {
  return (
    <div className="page-stack">
      <section className="page-section">
        <article className="card">
          <p className="eyebrow">Access Denied</p>
          <h1 className="card-title">Access denied</h1>
          <p className="card-copy">
            The requested page is not available for the current session.
          </p>
        </article>
      </section>
    </div>
  );
}
