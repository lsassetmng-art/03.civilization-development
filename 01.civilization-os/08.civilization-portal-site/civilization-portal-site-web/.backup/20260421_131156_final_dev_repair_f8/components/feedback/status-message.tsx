type StatusVariant = "info" | "success" | "warning" | "danger";

type StatusMessageProps = {
  title: string;
  message: string;
  variant?: StatusVariant;
};

const VARIANT_CLASS: Record<StatusVariant, string> = {
  info: "status-info",
  success: "status-success",
  warning: "status-warning",
  danger: "status-danger",
};

export function StatusMessage({
  title,
  message,
  variant = "info",
}: StatusMessageProps) {
  return (
    <div className={`status-box ${VARIANT_CLASS[variant]}`}>
      <p className="status-title">{title}</p>
      <p className="status-copy">{message}</p>
    </div>
  );
}
