window.CCW_DOMAIN = {
  durations: [
    { minutes: 30, priceJpy: 500 },
    { minutes: 60, priceJpy: 1000 },
    { minutes: 90, priceJpy: 1500 },
    { minutes: 120, priceJpy: 2000 }
  ],
  workerTypes: {
    Friend: {
      label: "Friend",
      description: "友達型AIワーカー。日常雑談、趣味、食べ物、天気、軽い励ましに向きます。"
    },
    Lover: {
      label: "Lover",
      description: "擬似恋人・レンタル彼氏/彼女型AIワーカー。現実の交際関係ではなく、契約時間内の接客・演技・エンタメ体験です。"
    }
  },
  safety: {
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
    ]
  },
  calculateQuote(durationMinutes, remainingTickets, applyTickets) {
    const basePriceJpy = durationMinutes / 30 * 500;
    const maxTicketsByDuration = Math.floor(durationMinutes / 30);
    const appliedFreeTicketCount = applyTickets ? Math.min(remainingTickets, maxTicketsByDuration, 2) : 0;
    const freeMinutes = appliedFreeTicketCount * 30;
    const paidMinutes = Math.max(0, durationMinutes - freeMinutes);
    const finalPriceJpy = paidMinutes / 30 * 500;

    return {
      durationMinutes,
      basePriceJpy,
      appliedFreeTicketCount,
      freeMinutes,
      paidMinutes,
      finalPriceJpy
    };
  },
  formatJpy(value) {
    return `${Number(value).toLocaleString("ja-JP")}円`;
  },
  formatTimer(totalSeconds) {
    const safeSeconds = Math.max(0, totalSeconds);
    const mm = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
    const ss = String(safeSeconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }
};
