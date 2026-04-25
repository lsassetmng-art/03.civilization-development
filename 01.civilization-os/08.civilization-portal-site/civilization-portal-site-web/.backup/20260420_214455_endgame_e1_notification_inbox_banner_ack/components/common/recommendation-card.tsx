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
      <p className="eyebrow">{item.targetKind.toUpperCase()}</p>
      <h3 className="card-title">{item.title}</h3>
      <p className="card-copy">{item.summary}</p>

      <div className="chip-row">
        <span className="chip">score:{item.score}</span>
        <span className="chip">{item.audience}</span>
        {item.featured ? <span className="chip">featured</span> : null}
      </div>

      <p className="meta-text">{item.reason}</p>

      <div className="button-row">
        <Link href={item.href} className="button-link">
          Open Recommendation
        </Link>
      </div>
    </article>
  );
}
