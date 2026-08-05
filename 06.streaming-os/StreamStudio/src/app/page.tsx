import {
  createStreamingCivilizationLoginContext,
  hasStreamingCivilizationLoginContextIdentity,
  isStreamingCivilizationLoginContextExpired
} from "../lib/civilization-login-context";

const previewContext = createStreamingCivilizationLoginContext({
  civilizationId: "streaming-preview-civilization",
  owner: "streaming-preview-owner",
  localeCode: "ja-jp",
  requestedOsCode: "streaming-os",
  returnTo: "/",
  afterLoginPath: "/",
  sessionRef: "streaming-preview-session"
});

const statusItems = [
  {
    label: "Identity boundary",
    value: hasStreamingCivilizationLoginContextIdentity(previewContext)
      ? "ready"
      : "missing"
  },
  {
    label: "Session window",
    value: isStreamingCivilizationLoginContextExpired(previewContext)
      ? "expired"
      : "active"
  },
  {
    label: "Locale",
    value: previewContext.localeCode
  },
  {
    label: "Language",
    value: previewContext.languageCode
  }
];

const moduleCards = [
  {
    title: "Creator Studio",
    description: "Channel, program, session, archive, and performer operations."
  },
  {
    title: "Viewer Surface",
    description: "Discovery, waiting room, watch page, history, and follow surface."
  },
  {
    title: "Moderation",
    description: "Review queue, restriction state, restoration flow, and reports."
  },
  {
    title: "Notification",
    description: "Creator, viewer, review, and platform event inbox."
  },
  {
    title: "Monetization",
    description: "Revenue summary, display currency, tipping summary, and settlement placeholder."
  }
];

export default function StreamStudioHome() {
  return (
    <main className="pageShell">
      <section className="hero">
        <p className="eyebrow">StreamingOS</p>
        <h1>StreamStudio frontend shell</h1>
        <p className="lead">
          This first UI entry binds the safe Civilization login context receiver
          to a static StreamStudio surface without DB, network, or browser
          storage side effects.
        </p>
      </section>

      <section className="contextPanel" aria-label="Civilization login context">
        <div>
          <p className="sectionLabel">Context receiver</p>
          <h2>Civilization boundary preview</h2>
        </div>
        <dl className="contextGrid">
          <div>
            <dt>Civilization ID</dt>
            <dd>{previewContext.civilizationId}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>{previewContext.owner}</dd>
          </div>
          <div>
            <dt>Requested OS</dt>
            <dd>{previewContext.requestedOsCode}</dd>
          </div>
          <div>
            <dt>Return path</dt>
            <dd>{previewContext.returnTo}</dd>
          </div>
          <div>
            <dt>After login path</dt>
            <dd>{previewContext.afterLoginPath}</dd>
          </div>
          <div>
            <dt>Session reference</dt>
            <dd>{previewContext.sessionRef}</dd>
          </div>
        </dl>
      </section>

      <section className="statusGrid" aria-label="Receiver status">
        {statusItems.map((item) => (
          <article className="statusCard" key={item.label}>
            <p>{item.label}</p>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="moduleGrid" aria-label="StreamingOS modules">
        {moduleCards.map((card) => (
          <article className="moduleCard" key={card.title}>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
