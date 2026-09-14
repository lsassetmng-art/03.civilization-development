"use client";

import { useEffect, useState } from "react";
import {
  requestAdminNotificationCenterList,
  requestAdminNotificationCenterUpsert,
} from "../../services/portal-api/notification-client";
import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalNotificationCenterItem,
  PortalNotificationChannel,
  PortalNotificationAudience,
  PortalNotificationSurface,
  PortalNotificationTone,
  PortalNotificationVisibility,
} from "../../types/portal-notification-api";

type AdminNotificationPanelProps = {
  session: PortalSessionSummary;
  canOperate: boolean;
  onError: (message: string | null) => void;
  onAuditRefresh: () => Promise<void>;
};

const sortItems = (items: PortalNotificationCenterItem[]): PortalNotificationCenterItem[] =>
  [...items].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.title.localeCompare(b.title);
  });

export function AdminNotificationPanel({
  session,
  canOperate,
  onError,
  onAuditRefresh,
}: AdminNotificationPanelProps) {
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<PortalNotificationCenterItem[]>([]);

  const [code, setCode] = useState("launcher-announcement-review");
  const [channel, setChannel] = useState<PortalNotificationChannel>("announcement");
  const [surface, setSurface] = useState<PortalNotificationSurface>("launcher");
  const [audience, setAudience] = useState<PortalNotificationAudience>("member");
  const [title, setTitle] = useState("Launcher review notice");
  const [body, setBody] = useState("Please review your launcher shortcuts after major portal changes.");
  const [href, setHref] = useState("/me/launcher");
  const [tone, setTone] = useState<PortalNotificationTone>("warning");
  const [priority, setPriority] = useState("20");
  const [visibility, setVisibility] = useState<PortalNotificationVisibility>("visible");
  const [ackRequired, setAckRequired] = useState(true);
  const [dismissible, setDismissible] = useState(true);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!canOperate) {
        return;
      }

      try {
        setLoading(true);
        onError(null);

        const response = await requestAdminNotificationCenterList({
          scope: "admin",
          session,
        });

        if (!active) {
          return;
        }

        setItems(sortItems(response.data.items));
      } catch (error) {
        if (!active) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Notification center list could not be loaded.";

        onError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [canOperate, onError, session]);

  const handleSave = async () => {
    try {
      setBusy(true);
      onError(null);

      const parsedPriority = Number.parseInt(priority || "0", 10);

      const response = await requestAdminNotificationCenterUpsert({
        scope: "admin",
        session,
        code,
        channel,
        surface,
        audience,
        title,
        body,
        href: href || undefined,
        tone,
        priority: Number.isNaN(parsedPriority) ? 0 : parsedPriority,
        visibility,
        ackRequired,
        dismissible,
      });

      setItems((prev) => {
        const filtered = prev.filter((item) => item.code !== response.data.item.code);
        return sortItems([...filtered, response.data.item]);
      });

      await onAuditRefresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Notification center item could not be saved.";

      onError(message);
    } finally {
      setBusy(false);
    }
  };

  if (!canOperate) {
    return null;
  }

  return (
    <section className="page-section">
      <h2 className="section-title">Notification center control</h2>

      {loading ? (
        <article className="card">
          <p className="card-copy">Loading notification center items...</p>
        </article>
      ) : null}

      <article className="card">
        <div className="form-grid">
          <label className="field-block">
            <span className="label-text">Code</span>
            <input
              className="text-input"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="launcher-announcement-review"
            />
          </label>

          <label className="field-block">
            <span className="label-text">Channel</span>
            <select
              className="select-input"
              value={channel}
              onChange={(event) =>
                setChannel(event.target.value as PortalNotificationChannel)
              }
            >
              <option value="banner">banner</option>
              <option value="inbox">inbox</option>
              <option value="announcement">announcement</option>
            </select>
          </label>

          <label className="field-block">
            <span className="label-text">Surface</span>
            <select
              className="select-input"
              value={surface}
              onChange={(event) =>
                setSurface(event.target.value as PortalNotificationSurface)
              }
            >
              <option value="home">home</option>
              <option value="launcher">launcher</option>
            </select>
          </label>

          <label className="field-block">
            <span className="label-text">Audience</span>
            <select
              className="select-input"
              value={audience}
              onChange={(event) =>
                setAudience(event.target.value as PortalNotificationAudience)
              }
            >
              <option value="public">public</option>
              <option value="member">member</option>
              <option value="operator">operator</option>
            </select>
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Title</span>
            <input
              className="text-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Notification title"
            />
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Body</span>
            <textarea
              className="text-area"
              rows={4}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Notification body"
            />
          </label>

          <label className="field-block field-span-2">
            <span className="label-text">Href</span>
            <input
              className="text-input"
              value={href}
              onChange={(event) => setHref(event.target.value)}
              placeholder="/me/launcher"
            />
          </label>

          <label className="field-block">
            <span className="label-text">Tone</span>
            <select
              className="select-input"
              value={tone}
              onChange={(event) =>
                setTone(event.target.value as PortalNotificationTone)
              }
            >
              <option value="info">info</option>
              <option value="warning">warning</option>
              <option value="success">success</option>
            </select>
          </label>

          <label className="field-block">
            <span className="label-text">Priority</span>
            <input
              className="text-input"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              placeholder="20"
            />
          </label>

          <label className="field-block">
            <span className="label-text">Visibility</span>
            <select
              className="select-input"
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as PortalNotificationVisibility)
              }
            >
              <option value="visible">visible</option>
              <option value="hidden">hidden</option>
            </select>
          </label>

          <label className="field-block checkbox-field">
            <input
              type="checkbox"
              checked={ackRequired}
              onChange={(event) => setAckRequired(event.target.checked)}
            />
            <span className="label-text">Ack required</span>
          </label>

          <label className="field-block checkbox-field">
            <input
              type="checkbox"
              checked={dismissible}
              onChange={(event) => setDismissible(event.target.checked)}
            />
            <span className="label-text">Dismissible</span>
          </label>
        </div>

        <div className="button-row">
          <button
            type="button"
            className="button-link"
            onClick={handleSave}
            disabled={busy}
          >
            {busy ? "Saving..." : "Save Notification Item"}
          </button>
        </div>
      </article>

      <div className="grid-2">
        {items.map((item) => (
          <article key={item.id} className="card">
            <p className="eyebrow">
              {item.surface.toUpperCase()} / {item.channel.toUpperCase()}
            </p>
            <h3 className="card-title">{item.title}</h3>
            <p className="card-copy">{item.body}</p>
            <div className="chip-row">
              <span className="chip">{item.audience}</span>
              <span className="chip">priority:{item.priority}</span>
              <span className="chip">{item.visibility}</span>
              {item.ackRequired ? <span className="chip">ack</span> : null}
            </div>
            <p className="meta-text">{item.href || "no link"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
