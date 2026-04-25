window.CCW_CX_MATERIAL = {
  friendTopics: [
    "今日食べたもの",
    "最近見た動画",
    "季節の話",
    "天気",
    "ゲーム",
    "音楽",
    "ちょっとした気分転換"
  ],

  loverTopics: [
    "小さなデート風の会話",
    "今日の出来事をやさしく聞く",
    "甘めの挨拶",
    "安全な褒め言葉",
    "契約時間内の恋人風ロールプレイ"
  ],

  getTopics(workerType) {
    return workerType === "Lover" ? this.loverTopics : this.friendTopics;
  }
};
