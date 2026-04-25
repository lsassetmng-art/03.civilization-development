type PageTitleBlockProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function PageTitleBlock({
  eyebrow,
  title,
  description,
}: PageTitleBlockProps) {
  return (
    <section className="page-section">
      <article className="card">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="card-title">{title}</h1>
        {description ? <p className="card-copy">{description}</p> : null}
      </article>
    </section>
  );
}
