window.CCW_DOMAIN_CONSTANTS = {
  appName: "CasualChatWorker",
  displayName: "雑談ワーカー",
  category: "03.business-app",
  priceUnitMinutes: 30,
  priceUnitJpy: 500,
  durations: [
    { minutes: 30, priceJpy: 500 },
    { minutes: 60, priceJpy: 1000 },
    { minutes: 90, priceJpy: 1500 },
    { minutes: 120, priceJpy: 2000 }
  ],
  monthlyFreeTicket: {
    grantedTicketCount: 2,
    minutesPerTicket: 30,
    maxFreeMinutesPerMonth: 60,
    carryoverEnabled: false,
    targetWorkerTypes: ["Friend", "Lover"]
  },
  workerTypes: {
    Friend: {
      label: "Friend",
      description: "友達型AIワーカー。日常雑談、趣味、食べ物、天気、軽い励ましに向きます。"
    },
    Lover: {
      label: "Lover",
      description: "擬似恋人・レンタル彼氏/彼女型AIワーカー。現実の交際関係ではなく、契約時間内の接客・演技・エンタメ体験です。"
    }
  }
};
