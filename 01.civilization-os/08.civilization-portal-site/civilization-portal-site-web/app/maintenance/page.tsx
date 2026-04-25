import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance | Civilization Portal Site",
  description: "Maintenance notice page.",
};

export default function Page() {
  return (
    <div className="page-stack">
      <section className="page-section">
        <article className="card">
          <p className="eyebrow">Maintenance</p>
          <h1 className="card-title">Maintenance notice</h1>
          <p className="card-copy">
            The requested route is temporarily under maintenance.
          </p>
        </article>
      </section>
    </div>
  );
}
