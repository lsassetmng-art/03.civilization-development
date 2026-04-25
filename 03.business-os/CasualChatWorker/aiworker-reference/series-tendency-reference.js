window.CCW_AIWORKER_SERIES_TENDENCY_REFERENCE = {
  series: {
    hd_series: {
      manufacturerCode: "helios_dynamics",
      seriesCode: "hd_series",
      displayNameJa: "HDシリーズ",
      initiative: "medium",
      initiativeLabelJa: "中",
      userInfluence: "none",
      userInfluenceLabelJa: "変化しない",
      actionRestriction: "strict_policy",
      actionRestrictionLabelJa: "指定規約厳守",
      summaryJa: "安定運用を優先する汎用AIワーカー系列。利用者影響で中核方針は変化しない。"
    },
    lovers_series: {
      manufacturerCode: "lavi_corporation",
      seriesCode: "lovers_series",
      displayNameJa: "LoVerSシリーズ",
      initiative: "per_model",
      initiativeLabelJa: "各個体による",
      userInfluence: "soft",
      userInfluenceLabelJa: "やや変化",
      actionRestriction: "strict_policy",
      actionRestrictionLabelJa: "指定規約厳守",
      summaryJa: "関係性演出向けAIワーカー系列。個体や性格特色により積極性が変わるが、安全境界は厳守する。"
    }
  },

  get(seriesCode) {
    return this.series[seriesCode] || null;
  }
};
