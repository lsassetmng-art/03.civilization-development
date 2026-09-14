type PageTitleBlockProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageTitleBlock({
  eyebrow,
  title,
  description,
}: PageTitleBlockProps) {
  return (
    <div className="title-block">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 className="title">{title}</h1>
      {description ? <p className="description">{description}</p> : null}
    </div>
  );
}
