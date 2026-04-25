import Link from "next/link";
import type { PortalNotificationCenterItem } from "../../types/portal-notification-api";

type NotificationCardProps = {
  item: PortalNotificationCenterItem;
  actionLabel?: string;
  onAction?: () => void;
};

export function NotificationCard({
  item,
  actionLabel,
  onAction,
}: NotificationCardProps) {
  return (
    <article className="card">
      <p className="eyebrow">
        {item.channel.toUpperCase()} / {item.tone.toUpperCase()}
      </p>
      <h3 className="card-title">{item.title}</h3>
      <p className="card-copy">{item.body}</p>

      <div className="chip-row">
        <span className="chip">{item.surface}</span>
        <span className="chip">{item.audience}</span>
        {item.ackRequired ? <span className="chip">ack</span> : null}
      </div>

      <div className="button-row">
        {item.href ? (
          <Link href={item.href} className="secondary-button">
            Open Link
          </Link>
        ) : null}
        {actionLabel && onAction ? (
          <button type="button" className="button-link" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
}
