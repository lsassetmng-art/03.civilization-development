import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth Return | Civilization Portal Site",
  description: "Authentication return placeholder page.",
};

export default function Page() {
  return (
    <div className="page-stack">
      <section className="page-section">
        <article className="card">
          <p className="eyebrow">Auth Return</p>
          <h1 className="card-title">Authentication return</h1>
          <p className="card-copy">
            This compile-safe wrapper is reserved for the auth return flow.
          </p>
        </article>
      </section>
    </div>
  );
}
