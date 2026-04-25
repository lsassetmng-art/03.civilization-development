import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Civilization Portal Site",
  description: "Portal login entry placeholder.",
};

export default function Page() {
  return (
    <div className="page-stack">
      <section className="page-section">
        <article className="card">
          <p className="eyebrow">Login</p>
          <h1 className="card-title">Login entry</h1>
          <p className="card-copy">
            This compile-safe wrapper is reserved for the canonical login flow.
          </p>
        </article>
      </section>
    </div>
  );
}
