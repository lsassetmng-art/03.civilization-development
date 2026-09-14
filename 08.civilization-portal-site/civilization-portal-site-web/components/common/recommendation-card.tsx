import Link from "next/link";
import type { PortalResolvedRecommendationItem } from "../../types/portal-recommendation-api";

type RecommendationCardProps = {
  item: PortalResolvedRecommendationItem;
};

export function RecommendationCard({
  item,
}: RecommendationCardProps) {
  return (
    <article className="card">
      <p className="eyebrow">
        {item.targetKind.toUpperCase()}
        {item.featured ? " / FEATURED" : ""}
      </p>
      <h3 className="card-title">{item.title}</h3>
      <p className="card-copy">{item.summary}</p>
      <p className="meta-text">Priority: {item.priority}</p>
      <div className="button-row">
        <Link href={item.href} className="button-link">
          Open
        </Link>
      </div>
    </article>
  );
}
