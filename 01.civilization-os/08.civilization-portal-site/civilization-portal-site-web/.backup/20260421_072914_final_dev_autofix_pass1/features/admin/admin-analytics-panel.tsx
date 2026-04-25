"use client";

import { useEffect, useState } from "react";
import { AnalyticsMetricCard } from "../../components/common/analytics-metric-card";
import { requestAdminAnalyticsReportGet } from "../../services/portal-api/analytics-client";
import type { PortalSessionSummary } from "../../types/auth";
import type {
  PortalAnalyticsEventItem,
  PortalAnalyticsMetricItem,
} from "../../types/portal-analytics-api";

type AdminAnalyticsPanelProps = {
  session: PortalSessionSummary;
  canOperate: boolean;
  onError: (message: string | null) => void;
};

export function AdminAnalyticsPanel({
  session,
  canOperate,
  onError,
}: AdminAnalyticsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [rangeDays, setRangeDays] = useState("7");
  const [totalEvents, setTotalEvents] = useState(0);
  const [uniqueActors, setUniqueActors] = useState(0);
  const [bySurface, setBySurface] = useState<PortalAnalyticsMetricItem[]>([]);
  const [byAction, setByAction] = useState<PortalAnalyticsMetricItem[]>([]);
  const [byTargetKind, setByTargetKind] = useState<PortalAnalyticsMetricItem[]>([]);
  const [recentEvents, setRecentEvents] = useState<PortalAnalyticsEventItem[]>([]);

  const loadReport = async (daysText: string) => {
    if (!canOperate) {
      return;
    }

    try {
      setLoading(true);
      onError(null);

      const parsedRangeDays = Number.parseInt(daysText || "7", 10);

      const response = await requestAdminAnalyticsReportGet({
        scope: "admin",
        session,
        rangeDays: Number.isNaN(parsedRangeDays) ? 7 : parsedRangeDays,
        limit: 20,
      });

      setTotalEvents(response.data.summary.totalEvents);
      setUniqueActors(response.data.summary.uniqueActors);
      setBySurface(response.data.bySurface);
      setByAction(response.data.byAction);
      setByTargetKind(response.data.byTargetKind);
      setRecentEvents(response.data.recentEvents);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Analytics report could not be loaded.";

      onError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(rangeDays);
  }, [canOperate, session.civilizationUserId, rangeDays]);

  if (!canOperate) {
    return null;
  }

  return (
    <section className="page-section">
      <h2 className="section-title">Analytics and operator metrics</h2>

      <article className="card">
        <div className="form-grid">
          <label className="field-block">
            <span className="label-text">Range days</span>
            <input
              className="text-input"
              value={rangeDays}
              onChange={(event) => setRangeDays(event.target.value)}
              placeholder="7"
            />
          </label>
        </div>

        <div className="button-row">
          <button
            type="button"
            className="button-link"
            onClick={() => loadReport(rangeDays)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh Analytics Report"}
          </button>
        </div>
      </article>

      <div className="grid-3">
        <AnalyticsMetricCard
          title="Total events"
          value={totalEvents}
          meta={`Range ${rangeDays} day(s)`}
        />
        <AnalyticsMetricCard
          title="Unique actors"
          value={uniqueActors}
          meta="Guest/member/operator combined"
        />
        <AnalyticsMetricCard
          title="Recent events shown"
          value={recentEvents.length}
          meta="Recent event list below"
        />
      </div>

      <div className="grid-3">
        <article className="card">
          <h3 className="section-title">By surface</h3>
          {bySurface.length === 0 ? (
            <p className="card-copy">No data.</p>
          ) : (
            <div className="stack">
              {bySurface.map((item) => (
                <div key={item.key} className="inline-card">
                  <div>
                    <p className="inline-title">{item.key}</p>
                  </div>
                  <span className="chip">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="card">
          <h3 className="section-title">By action</h3>
          {byAction.length === 0 ? (
            <p className="card-copy">No data.</p>
          ) : (
            <div className="stack">
              {byAction.map((item) => (
                <div key={item.key} className="inline-card">
                  <div>
                    <p className="inline-title">{item.key}</p>
                  </div>
                  <span className="chip">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="card">
          <h3 className="section-title">By target kind</h3>
          {byTargetKind.length === 0 ? (
            <p className="card-copy">No data.</p>
          ) : (
            <div className="stack">
              {byTargetKind.map((item) => (
                <div key={item.key} className="inline-card">
                  <div>
                    <p className="inline-title">{item.key}</p>
                  </div>
                  <span className="chip">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>

      <article className="card">
        <h3 className="section-title">Recent events</h3>
        {recentEvents.length === 0 ? (
          <p className="card-copy">No tracked event is currently available.</p>
        ) : (
          <div className="stack">
            {recentEvents.map((item) => (
              <div key={item.id} className="inline-card">
                <div>
                  <p className="inline-title">
                    {item.surface} / {item.action} / {item.targetTitle}
                  </p>
                  <p className="inline-copy">
                    {item.actorType} / {item.targetKind}
                    {item.metadata ? ` / ${item.metadata}` : ""}
                  </p>
                </div>
                <span className="chip">{item.occurredAt}</span>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
