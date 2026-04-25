import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signup | Civilization Portal Site",
  description: "Portal signup entry placeholder.",
};

export default function Page() {
  return (
    <div className="page-stack">
      <section className="page-section">
        <article className="card">
          <p className="eyebrow">Signup</p>
          <h1 className="card-title">Signup entry</h1>
          <p className="card-copy">
            This compile-safe wrapper is reserved for the canonical signup flow.
          </p>
        </article>
      </section>
    </div>
  );
}
