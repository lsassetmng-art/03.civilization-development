type StatusVariant = "info" | "success" | "warning" | "danger";

type StatusMessageProps = {
  title: string;
  message: string;
  variant: StatusVariant;
};

export function StatusMessage({
  title,
  message,
  variant,
}: StatusMessageProps) {
  return (
    <article className={`card status-${variant}`}>
      <p className="eyebrow">{variant.toUpperCase()}</p>
      <h3 className="card-title">{title}</h3>
      <p className="card-copy">{message}</p>
    </article>
  );
}
