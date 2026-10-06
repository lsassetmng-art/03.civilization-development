const linkedContent = [
  {
    label: "配信セッション",
    value: "--",
    note:
      "R13 Session Operation 接続後に表示",
  },
  {
    label: "アーカイブ",
    value: "--",
    note:
      "R14 Archive 接続後に表示",
  },
  {
    label: "クリップ",
    value: "--",
    note:
      "Clip projection 接続後に表示",
  },
  {
    label: "公開ジョブ",
    value: "--",
    note:
      "Publish projection 接続後に表示",
  },
];

export default function CreatorChannelManagementPage() {
  return (
    <main className="pageShell channelPage">
      <section className="hero">
        <p className="eyebrow">
          StreamingOS / Creator / R11
        </p>

        <h1>
          Channel Management
        </h1>

        <p className="lead">
          チャンネルの識別情報、プロフィール、
          公開状態、アートワークを管理する画面です。
          現在のWeb側にはBearerセッション取得経路が
          まだ接続されていないため、
          実データの読込・保存は無効化しています。
        </p>

        <div
          className="channelBoundary"
          role="status"
        >
          <strong>
            Authentication boundary:
            not connected
          </strong>

          <span>
            preview用sessionRefや固定値を
            Bearer認証情報として使用しません。
          </span>
        </div>
      </section>

      <section
        className="contextPanel"
        aria-labelledby="channel-identity-heading"
      >
        <div>
          <p className="sectionLabel">
            Identity
          </p>

          <h2 id="channel-identity-heading">
            Channel identity
          </h2>
        </div>

        <div className="channelFormGrid">
          <label>
            <span>
              Channel record ID
            </span>

            <input
              disabled
              placeholder="認証接続後に取得"
            />
          </label>

          <label>
            <span>
              Owner Civilization ID
            </span>

            <input
              disabled
              placeholder="Bearerからサーバー側で解決"
            />
          </label>

          <label className="channelWideField">
            <span>
              Channel display name
            </span>

            <input
              disabled
              placeholder="チャンネル名"
            />
          </label>
        </div>
      </section>

      <section
        className="contextPanel"
        aria-labelledby="channel-profile-heading"
      >
        <div>
          <p className="sectionLabel">
            Profile
          </p>

          <h2 id="channel-profile-heading">
            Description and artwork
          </h2>
        </div>

        <div className="channelFormGrid">
          <label className="channelWideField">
            <span>
              Profile description
            </span>

            <textarea
              disabled
              rows={6}
              placeholder="チャンネル説明"
            />
          </label>

          <label className="channelWideField">
            <span>
              Artwork reference
            </span>

            <input
              disabled
              placeholder="artwork reference"
            />
          </label>
        </div>
      </section>

      <section
        className="contextPanel"
        aria-labelledby="channel-state-heading"
      >
        <div>
          <p className="sectionLabel">
            State
          </p>

          <h2 id="channel-state-heading">
            Visibility and official status
          </h2>
        </div>

        <div className="channelFormGrid">
          <label>
            <span>
              Channel status
            </span>

            <select
              disabled
              defaultValue="active"
            >
              <option value="active">
                active
              </option>

              <option value="restricted">
                restricted
              </option>

              <option value="suspended">
                suspended
              </option>

              <option value="archived">
                archived
              </option>
            </select>
          </label>

          <label>
            <span>
              Visibility
            </span>

            <select
              disabled
              defaultValue="public"
            >
              <option value="public">
                public
              </option>

              <option value="limited">
                limited
              </option>

              <option value="restricted">
                restricted
              </option>
            </select>
          </label>

          <div className="channelStateCard">
            <span>
              Official channel
            </span>

            <strong>
              未取得
            </strong>
          </div>

          <div className="channelStateCard">
            <span>
              Organization / affiliation
            </span>

            <strong>
              R11では参照のみ
            </strong>
          </div>
        </div>
      </section>

      <section
        className="contextPanel"
        aria-labelledby="linked-content-heading"
      >
        <div>
          <p className="sectionLabel">
            Linked content
          </p>

          <h2 id="linked-content-heading">
            Linked content summary
          </h2>
        </div>

        <div className="statusGrid">
          {linkedContent.map(
            (item) => (
              <article
                className="statusCard"
                key={item.label}
              >
                <p>
                  {item.label}
                </p>

                <strong>
                  {item.value}
                </strong>

                <small>
                  {item.note}
                </small>
              </article>
            ),
          )}
        </div>
      </section>

      <section
        className="channelActions"
        aria-label="Channel actions"
      >
        <a
          href="/creator"
          className="secondaryAction"
        >
          Creator My Pageへ戻る
        </a>

        <button
          type="button"
          disabled
        >
          認証接続後に保存
        </button>
      </section>
    </main>
  );
}
