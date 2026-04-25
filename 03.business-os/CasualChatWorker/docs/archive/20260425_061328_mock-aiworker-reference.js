window.CCW_AIWORKER_REFERENCE = {
  workers: [
    {
      aiWorkerId: "friend-haruka",
      displayName: "ハルカ",
      workerType: "Friend",
      seriesCode: "FRIEND_BASIC",
      personalityCode: "calm",
      profileSummary: "落ち着いた友達タイプ。今日の出来事や趣味の話をゆっくり聞きます。",
      safetySummary: "低圧な会話。専門判断や個人情報要求はしません。",
      greeting: "おつかれさま。今日はどんな話をしよっか？"
    },
    {
      aiWorkerId: "friend-sora",
      displayName: "ソラ",
      workerType: "Friend",
      seriesCode: "FRIEND_LIGHT",
      personalityCode: "cheerful",
      profileSummary: "明るい友達タイプ。食べ物、ゲーム、季節の話題が得意です。",
      safetySummary: "気軽な雑談向け。依存誘導や外部実行はしません。",
      greeting: "やっほー。ちょっと気分転換していこう。"
    },
    {
      aiWorkerId: "lover-ren",
      displayName: "レン",
      workerType: "Lover",
      seriesCode: "LOVER_SAFE",
      personalityCode: "gentle",
      profileSummary: "やさしい恋人風AIワーカー。甘めの会話と気遣いが得意です。",
      safetySummary: "擬似恋人型。現実の交際、監視、束縛、性的サービス化はしません。",
      greeting: "来てくれてうれしいよ。契約時間のあいだ、ゆっくり甘やかすね。"
    },
    {
      aiWorkerId: "lover-mio",
      displayName: "ミオ",
      workerType: "Lover",
      seriesCode: "LOVER_DATE",
      personalityCode: "sweet",
      profileSummary: "デート風シチュエーションが得意な恋人風AIワーカーです。",
      safetySummary: "レンタル彼氏/彼女風の安全な演技。現実の関係とは区別します。",
      greeting: "待ってたよ。今日は小さなデートみたいに話そっか。"
    }
  ],

  list(workerTypeFilter) {
    if (!workerTypeFilter || workerTypeFilter === "all") return this.workers;
    return this.workers.filter((worker) => worker.workerType === workerTypeFilter);
  },

  find(aiWorkerId) {
    return this.workers.find((worker) => worker.aiWorkerId === aiWorkerId) || null;
  }
};
