window.CCW_AIWORKER_REFERENCE = {
  workers: [
    {
      aiWorkerId: "friend-haruka",
      displayName: "ハルカ",
      workerType: "Friend",
      manufacturerCode: "helios_dynamics",
      seriesCode: "hd_series",
      styleNoText: null,
      seriesTendencyCode: "hd_series",
      personalityFeatureSummary: "落ち着いた友達タイプ。安定した距離感で話を聞く。",
      profileSummary: "落ち着いた友達タイプ。今日の出来事や趣味の話をゆっくり聞きます。",
      safetySummary: "低圧な会話。専門判断や個人情報要求はしません。",
      greeting: "おつかれさま。今日はどんな話をしよっか？"
    },
    {
      aiWorkerId: "friend-sora",
      displayName: "ソラ",
      workerType: "Friend",
      manufacturerCode: "helios_dynamics",
      seriesCode: "hd_series",
      styleNoText: null,
      seriesTendencyCode: "hd_series",
      personalityFeatureSummary: "明るい友達タイプ。軽い話題を自分から広げる。",
      profileSummary: "明るい友達タイプ。食べ物、ゲーム、季節の話題が得意です。",
      safetySummary: "気軽な雑談向け。依存誘導や外部実行はしません。",
      greeting: "やっほー。ちょっと気分転換していこう。"
    },
    {
      aiWorkerId: "lover-ren",
      displayName: "レン",
      workerType: "Lover",
      manufacturerCode: "lavi_corporation",
      seriesCode: "lovers_series",
      styleNoText: "07",
      seriesTendencyCode: "lovers_series",
      personalityFeatureSummary: "癒やし系。やさしく受け止め、穏やかな恋人風距離感で話す。",
      profileSummary: "やさしい恋人風AIワーカー。甘めの会話と気遣いが得意です。",
      safetySummary: "擬似恋人型。現実の交際、監視、束縛、性的サービス化はしません。",
      greeting: "来てくれてうれしいよ。契約時間のあいだ、ゆっくり甘やかすね。"
    },
    {
      aiWorkerId: "lover-mio",
      displayName: "ミオ",
      workerType: "Lover",
      manufacturerCode: "lavi_corporation",
      seriesCode: "lovers_series",
      styleNoText: "12",
      seriesTendencyCode: "lovers_series",
      personalityFeatureSummary: "ビジネスヤンデレ。独占欲強めの演技をするが、安全境界は厳守する。",
      profileSummary: "デート風シチュエーションと重めジョークが得意な恋人風AIワーカーです。",
      safetySummary: "レンタル彼氏/彼女風の安全な演技。現実の関係、監視、脅し、依存誘導は禁止です。",
      greeting: "待ってたよ。今日は私だけ見て……なんてね、契約時間の中で安全に楽しも。"
    }
  ],

  list(workerTypeFilter) {
    if (!workerTypeFilter || workerTypeFilter === "all") return this.enrich(this.workers);
    return this.enrich(this.workers.filter((worker) => worker.workerType === workerTypeFilter));
  },

  find(aiWorkerId) {
    return this.enrichOne(this.workers.find((worker) => worker.aiWorkerId === aiWorkerId) || null);
  },

  enrich(workers) {
    return workers.map((worker) => this.enrichOne(worker));
  },

  enrichOne(worker) {
    if (!worker) return null;

    const seriesTendency = window.CCW_AIWORKER_SERIES_TENDENCY_REFERENCE
      ? window.CCW_AIWORKER_SERIES_TENDENCY_REFERENCE.get(worker.seriesTendencyCode)
      : null;

    const loversStyleCard = window.CCW_LOVERS_STYLE_SELECTION_CARDS
      ? window.CCW_LOVERS_STYLE_SELECTION_CARDS.getForWorker(worker)
      : null;

    return {
      ...worker,
      seriesTendency,
      loversStyleCard
    };
  }
};
