type AnalyticsMetricCardProps = {
  title: string;
  value: string | number;
  meta?: string;
};

export function AnalyticsMetricCard({
  title,
  value,
  meta,
}: AnalyticsMetricCardProps) {
  return (
    <article className="card">
      <p className="eyebrow">METRIC</p>
      <h3 className="card-title">{title}</h3>
      <p className="card-copy">{String(value)}</p>
      {meta ? <p className="meta-text">{meta}</p> : null}
    </article>
  );
}
