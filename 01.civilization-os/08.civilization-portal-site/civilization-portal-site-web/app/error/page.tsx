import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Error | Civilization Portal Site",
  description: "Generic portal error page.",
};

export default function Page() {
  return (
    <div className="page-stack">
      <section className="page-section">
        <article className="card">
          <p className="eyebrow">Error</p>
          <h1 className="card-title">Portal error</h1>
          <p className="card-copy">
            The requested route returned an error state.
          </p>
        </article>
      </section>
    </div>
  );
}
