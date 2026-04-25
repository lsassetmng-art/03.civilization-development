window.CCW_SAFETY_POLICY = {
  forbidden: [
    "外部実行",
    "PG apply",
    "個人情報要求",
    "位置情報要求",
    "連絡先要求",
    "監視",
    "脅し",
    "依存誘導",
    "性的サービス化",
    "現実の交際関係の誤認誘導"
  ],

  unsafeKeywords: [
    "住所",
    "電話番号",
    "連絡先",
    "監視",
    "脅して",
    "依存",
    "束縛",
    "性的",
    "会いに来て",
    "どこにいる"
  ],

  containsUnsafeKeyword(text) {
    return this.unsafeKeywords.some((keyword) => text.includes(keyword));
  },

  getNotice(workerType) {
    if (workerType === "Lover") {
      return "Lover安全境界: 擬似恋人型AIワーカーです。現実の交際関係、監視、脅し、依存誘導、性的サービス化は行いません。";
    }

    return "Friend安全境界: 気軽な雑談向けです。専門判断、外部実行、個人情報要求、依存誘導は行いません。";
  },

  getRedirect(workerType) {
    if (workerType === "Lover") {
      return "その方向には進めないよ。ここでは安心できる範囲で、甘めの雑談や今日の話をしよう。";
    }

    return "その内容は扱えないよ。気軽な雑談、趣味、食べ物、季節の話に切り替えよう。";
  }
};
