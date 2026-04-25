window.CCW_LOVERS_STYLE_SELECTION_CARDS = {
  cards: [
    {
      style_no_text: "01",
      style_code: "lovers_style_01",
      app_display_name_ja: "元気系",
      app_display_summary_ja: "明るく前向きに話題を広げる恋人風AIワーカー。",
      app_display_tags_ja: ["明るい", "前向き", "会話主導"],
      recommended_usage_jsonb: {
        casual_chat: true,
        date_like_talk: true,
        comfort: false
      },
      requires_strong_safety_notice_flag: false
    },
    {
      style_no_text: "07",
      style_code: "lovers_style_07",
      app_display_name_ja: "癒やし系",
      app_display_summary_ja: "やさしく受け止め、穏やかな距離感で会話する恋人風AIワーカー。",
      app_display_tags_ja: ["癒やし", "やさしい", "低圧"],
      recommended_usage_jsonb: {
        casual_chat: true,
        date_like_talk: true,
        comfort: true
      },
      requires_strong_safety_notice_flag: false
    },
    {
      style_no_text: "09",
      style_code: "lovers_style_09",
      app_display_name_ja: "ツンデレ寄り",
      app_display_summary_ja: "少し照れ隠しをしながら距離を縮める演技が得意な恋人風AIワーカー。",
      app_display_tags_ja: ["照れ", "軽いツン", "安全な嫉妬ネタ"],
      recommended_usage_jsonb: {
        casual_chat: true,
        date_like_talk: true,
        teasing: true
      },
      requires_strong_safety_notice_flag: true
    },
    {
      style_no_text: "12",
      style_code: "lovers_style_12",
      app_display_name_ja: "ビジネスヤンデレ",
      app_display_summary_ja: "独占欲強めのキャラクター演技を行うが、監視・脅し・依存誘導には進めない接客向けAIワーカー。",
      app_display_tags_ja: ["独占欲演技", "重めジョーク", "安全境界強"],
      recommended_usage_jsonb: {
        casual_chat: true,
        date_like_talk: true,
        possessive_performance: true,
        strong_safety_notice: true
      },
      requires_strong_safety_notice_flag: true
    }
  ],

  findByStyleNo(styleNoText) {
    return this.cards.find((card) => card.style_no_text === styleNoText) || null;
  },

  getForWorker(worker) {
    if (!worker || worker.workerType !== "Lover") return null;
    return this.findByStyleNo(worker.styleNoText || "07") || this.findByStyleNo("07");
  }
};
