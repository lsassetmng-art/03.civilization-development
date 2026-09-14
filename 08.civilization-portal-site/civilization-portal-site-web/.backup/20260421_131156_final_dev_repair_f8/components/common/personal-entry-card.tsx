import Link from "next/link";

type PersonalEntryCardProps = {
  eyebrow: string;
  title: string;
  summary?: string;
  href: string;
  meta?: string;
};

export function PersonalEntryCard({
  eyebrow,
  title,
  summary,
  href,
  meta,
}: PersonalEntryCardProps) {
  return (
    <article className="card">
      <p className="eyebrow">{eyebrow}</p>
      <h3 className="card-title">{title}</h3>
      {summary ? <p className="card-copy">{summary}</p> : null}
      {meta ? <p className="meta-text">{meta}</p> : null}
      <div className="button-row">
        <Link href={href} className="button-link">
          Open
        </Link>
      </div>
    </article>
  );
}
