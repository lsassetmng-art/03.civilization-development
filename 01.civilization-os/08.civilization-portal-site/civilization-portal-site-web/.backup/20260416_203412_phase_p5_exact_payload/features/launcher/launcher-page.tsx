"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTitleBlock } from "../../components/common/page-title-block";
import { StatusMessage } from "../../components/feedback/status-message";
import { HOME_NOTICES } from "../../mocks/notices/list";
import { OS_CATALOG } from "../../mocks/os/catalog";
import { PORTAL_LAUNCHER_STATE } from "../../mocks/launcher/state";
import { getPortalSessionSummary } from "../../services/civilization-auth/mock-session";
import { saveReturnContext } from "../../services/return-context/storage";
import { evaluateOsEntry } from "../../services/os-launch/evaluate-os-entry";
import type { PortalSessionSummary } from "../../types/auth";
import { ROUTES } from "../../lib/routing/routes";

export function LauncherPage() {
  const router = useRouter();
  const [session, setSession] = useState<PortalSessionSummary>({
    isLoggedIn: false,
    entityType: "guest",
    affiliations: [],
    contractTier: "none",
    betaFlags: [],
    region: "JP",
  });

  useEffect(() => {
    setSession(getPortalSessionSummary());
  }, []);

  const decisions = useMemo(
    () =>
      OS_CATALOG.map((os) => ({
        os,
        decision: evaluateOsEntry(os, session),
      })),
    [session],
  );

  const available = decisions.filter((item) => item.decision.result === "launchable");
  const unavailable = decisions.filter((item) => item.decision.result !== "launchable");

  const recent = PORTAL_LAUNCHER_STATE.recentCodes
    .map((code) => decisions.find((item) => item.os.code === code))
    .filter(Boolean);

  const recommended = PORTAL_LAUNCHER_STATE.recommendedCodes
    .map((code) => decisions.find((item) => item.os.code === code))
    .filter(Boolean);

  const handleLoginRequest = () => {
    saveReturnContext({
      returnTarget: ROUTES.launcher,
      requestTimestamp: new Date().toISOString(),
    });
    router.push(ROUTES.login);
  };

  const handleOpen = (target: string) => {
    router.push(target);
  };

  return (
    <div className="page-stack">
      <PageTitleBlock
        eyebrow="My Launcher"
        title="Launcher entry"
        description="After login, the portal becomes a practical launcher that explains what can be opened now and why some OS entries remain blocked."
      />

      <section className="page-section">
        <article className="card">
          <h2 className="section-title">Session summary</h2>
          <ul className="list">
            <li>Logged in: {session.isLoggedIn ? "yes" : "no"}</li>
            <li>Display name: {session.displayName ?? "guest"}</li>
            <li>Entity type: {session.entityType}</li>
            <li>Contract tier: {session.contractTier}</li>
            <li>
              Affiliations: {session.affiliations.length > 0 ? session.affiliations.join(", ") : "none"}
            </li>
          </ul>

          {!session.isLoggedIn ? (
            <div className="button-row">
              <button type="button" className="button-link" onClick={handleLoginRequest}>
                Login to Personalize Launcher
              </button>
            </div>
          ) : null}
        </article>
      </section>

      {!session.isLoggedIn ? (
        <StatusMessage
          title="Guest launcher mode"
          message="The launcher can still display entry decisions, but login-required and restricted OS entries will not open until a session exists."
          variant="warning"
        />
      ) : null}

      <section className="page-section">
        <div className="grid-2">
          <article className="card">
            <h2 className="section-title">Available now</h2>
            {available.length === 0 ? (
              <p className="card-copy">No OS is currently launchable for this session.</p>
            ) : (
              <div className="stack">
                {available.map((item) => (
                  <div key={item.os.code} className="inline-card">
                    <div>
                      <p className="inline-title">{item.os.name}</p>
                      <p className="inline-copy">{item.decision.reason}</p>
                    </div>
                    <button
                      type="button"
                      className="button-link"
                      onClick={() => handleOpen(item.decision.target)}
                    >
                      Open
                    </button>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="card">
            <h2 className="section-title">Blocked or delayed</h2>
            {unavailable.length === 0 ? (
              <p className="card-copy">No blocked entries.</p>
            ) : (
              <div className="stack">
                {unavailable.map((item) => (
                  <div key={item.os.code} className="inline-card">
                    <div>
                      <p className="inline-title">{item.os.name}</p>
                      <p className="inline-copy">{item.decision.reason}</p>
                    </div>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleOpen(item.decision.target)}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>

      <section className="page-section">
        <div className="grid-2">
          <article className="card">
            <h2 className="section-title">Recent OS</h2>
            <div className="stack">
              {recent.map((item) =>
                item ? (
                  <div key={item.os.code} className="inline-card">
                    <div>
                      <p className="inline-title">{item.os.name}</p>
                      <p className="inline-copy">{item.os.tagline}</p>
                    </div>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleOpen(item.decision.target)}
                    >
                      Open
                    </button>
                  </div>
                ) : null,
              )}
            </div>
          </article>

          <article className="card">
            <h2 className="section-title">Recommended OS</h2>
            <div className="stack">
              {recommended.map((item) =>
                item ? (
                  <div key={item.os.code} className="inline-card">
                    <div>
                      <p className="inline-title">{item.os.name}</p>
                      <p className="inline-copy">{item.os.summary}</p>
                    </div>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleOpen(item.decision.target)}
                    >
                      View
                    </button>
                  </div>
                ) : null,
              )}
            </div>
          </article>
        </div>
      </section>

      <section className="page-section">
        <article className="card">
          <h2 className="section-title">Notices for launcher users</h2>
          <div className="stack">
            {HOME_NOTICES.map((notice) => (
              <div key={notice.slug} className="inline-card">
                <div>
                  <p className="inline-title">{notice.title}</p>
                  <p className="inline-copy">{notice.summary}</p>
                </div>
                <span className="chip">{notice.level}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
