import {
  createStreamingCivilizationLoginContext,
  hasStreamingCivilizationLoginContextIdentity,
  isStreamingCivilizationLoginContextExpired,
} from "../../lib/civilization-login-context";

const creatorContext = createStreamingCivilizationLoginContext({
  civilizationId: "streaming-demo-creator",
  owner: "streaming-demo-owner",
  localeCode: "ja-jp",
  requestedOsCode: "streaming-os",
  returnTo: "/creator",
  afterLoginPath: "/creator",
});

const creatorStats = [
  { label: "チャンネル", value: "未作成", detail: "R11 Channel Management で接続" },
  { label: "番組", value: "未編成", detail: "R12 Program Management で接続" },
  { label: "配信", value: "待機中", detail: "R13 Session Operation で接続" },
  { label: "アーカイブ", value: "未登録", detail: "R14 Archive / Upload で接続" },
];

const creatorActions = [
  {
    title: "チャンネル管理",
    description: "チャンネル名、説明、公開状態、所有者境界を管理する入口。",
    route: "/creator/channel",
  },
  {
    title: "番組管理",
    description: "番組枠、予定、説明、配信前の準備状態を管理する入口。",
    route: "/creator/programs",
  },
  {
    title: "配信操作",
    description: "開始前確認、待機室、配信セッション状態を管理する入口。",
    route: "/creator/session",
  },
  {
    title: "アーカイブ / アップロード",
    description: "配信後の保存、アップロード、外部公開前の整理を行う入口。",
    route: "/creator/archive",
  },
];

export default function CreatorMyPage() {
  const hasIdentity = hasStreamingCivilizationLoginContextIdentity(creatorContext);
  const isExpired = isStreamingCivilizationLoginContextExpired(creatorContext);

  return (
    <main className="main-shell">
      <section className="hero-card">
        <p className="eyebrow">StreamingOS / Creator</p>
        <h1>Creator My Page</h1>
        <p className="hero-copy">
          StreamStudio のクリエイター用マイページです。チャンネル、番組、配信、アーカイブの各入口を
          ログイン文脈と分離した静的スケルトンとして配置します。
        </p>
        <div className="status-grid">
          <div className="status-card">
            <span className="status-label">Civilization Context</span>
            <strong>{hasIdentity ? "linked" : "missing"}</strong>
            <span>{creatorContext.civilizationId}</span>
          </div>
          <div className="status-card">
            <span className="status-label">Session</span>
            <strong>{isExpired ? "expired" : "preview"}</strong>
            <span>{creatorContext.localeCode}</span>
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <p className="eyebrow">Overview</p>
          <h2>Creator status</h2>
        </div>
        <div className="metric-grid">
          {creatorStats.map((item) => (
            <article className="metric-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <p className="eyebrow">Next entries</p>
          <h2>Creator operations</h2>
        </div>
        <div className="action-list">
          {creatorActions.map((action) => (
            <article className="action-card" key={action.title}>
              <div>
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
              <code>{action.route}</code>
            </article>
          ))}
        </div>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <p className="eyebrow">Boundary</p>
          <h2>R10 skeleton constraints</h2>
        </div>
        <ul className="check-list">
          <li>DB接続なし</li>
          <li>API POSTなし</li>
          <li>ブラウザ保存領域への書込なし</li>
          <li>Supabase Function 変更なし</li>
          <li>Creator操作の実データ接続は R11 以降</li>
        </ul>
      </section>
    </main>
  );
}
