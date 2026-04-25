import Link from "next/link";
import type { PortalSearchResultItem } from "../../types/portal-search-api";

type SearchResultCardProps = {
  item: PortalSearchResultItem;
};

export function SearchResultCard({
  item,
}: SearchResultCardProps) {
  return (
    <article className="card">
      <p className="eyebrow">{item.kind.toUpperCase()}</p>
      <h3 className="card-title">{item.title}</h3>
      <p className="card-copy">{item.summary}</p>
      <p className="meta-text">Code: {item.code}</p>
      <div className="button-row">
        <Link href={item.href} className="button-link">
          Open
        </Link>
      </div>
    </article>
  );
}
