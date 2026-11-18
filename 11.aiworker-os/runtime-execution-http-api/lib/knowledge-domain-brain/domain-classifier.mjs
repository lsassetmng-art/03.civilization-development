const DOMAIN_CODES = Object.freeze({
  ARTIST: "artist",
  ARCHITECTURE: "architecture",
  IT_TECHNOLOGY: "it_technology",
  MANGA_COMIC: "manga_comic",
  VIDEO_CREATOR: "video_creator",
  WRITING_STORY: "writing_story",
  GAME_DESIGN: "game_design",
  BUSINESS_MARKETING: "business_marketing",
  LEGAL_RIGHTS_SAFETY: "legal_rights_safety",
  CULTURE_HISTORY_REFERENCE: "culture_history_reference",
  HELPDESK: "helpdesk",
  IMPLEMENTATION_GUARDRAIL: "implementation_guardrail"
});

const RULES = Object.freeze([
  {
    domainCode: DOMAIN_CODES.HELPDESK,
    keywords: ["helpdesk", "faq", "error", "screen", "operation", "trouble", "support", "ヘルプ", "問い合わせ", "エラー", "操作"]
  },
  {
    domainCode: DOMAIN_CODES.IMPLEMENTATION_GUARDRAIL,
    keywords: ["guardrail", "preflight", "rollback", "patch", "git push", "ddl", "db_write", "api_post", "ミス", "対応", "復旧", "ガードレール"]
  },
  {
    domainCode: DOMAIN_CODES.IT_TECHNOLOGY,
    keywords: ["api", "db", "sql", "ui", "runtime", "queue", "server", "test", "コード", "実装", "設計"]
  },
  {
    domainCode: DOMAIN_CODES.CULTURE_HISTORY_REFERENCE,
    keywords: ["history", "culture", "timeline", "historical", "歴史", "文化", "時代", "人物"]
  },
  {
    domainCode: DOMAIN_CODES.ARCHITECTURE,
    keywords: ["architecture", "building", "floor", "space", "material", "建築", "建物", "設計", "空間"]
  },
  {
    domainCode: DOMAIN_CODES.ARTIST,
    keywords: ["artist", "art", "image", "music", "design", "style", "絵", "画像", "音楽", "アート"]
  },
  {
    domainCode: DOMAIN_CODES.MANGA_COMIC,
    keywords: ["manga", "comic", "panel", "character", "漫画", "コマ", "キャラ"]
  },
  {
    domainCode: DOMAIN_CODES.VIDEO_CREATOR,
    keywords: ["video", "movie", "thumbnail", "editing", "動画", "映像", "サムネ"]
  },
  {
    domainCode: DOMAIN_CODES.WRITING_STORY,
    keywords: ["story", "script", "dialogue", "copy", "物語", "脚本", "台本", "文章"]
  },
  {
    domainCode: DOMAIN_CODES.BUSINESS_MARKETING,
    keywords: ["marketing", "brand", "sales", "campaign", "事業", "広告", "販売", "ブランド"]
  }
]);

function normalizeText(value) {
  return String(value ?? "").toLowerCase();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function classifyKnowledgeDomains(input = {}) {
  const instructionText = normalizeText(input.instructionText ?? input.requestText ?? input.prompt ?? "");
  const artifactKind = normalizeText(input.artifactKind ?? "");
  const sourceRouteCode = normalizeText(input.sourceRouteCode ?? "");
  const joined = `${instructionText} ${artifactKind} ${sourceRouteCode}`;

  const matched = [];
  for (const rule of RULES) {
    if (rule.keywords.some((keyword) => joined.includes(normalizeText(keyword)))) {
      matched.push(rule.domainCode);
    }
  }

  const primaryDomainCode = matched[0] ?? DOMAIN_CODES.IT_TECHNOLOGY;
  const secondaryDomainCodes = unique(matched.slice(1));
  const safetyDomainCodes = [];

  if (
    matched.includes(DOMAIN_CODES.ARCHITECTURE) ||
    matched.includes(DOMAIN_CODES.ARTIST) ||
    matched.includes(DOMAIN_CODES.MANGA_COMIC) ||
    matched.includes(DOMAIN_CODES.VIDEO_CREATOR)
  ) {
    safetyDomainCodes.push(DOMAIN_CODES.LEGAL_RIGHTS_SAFETY);
  }

  if (
    joined.includes("db_write") ||
    joined.includes("ddl") ||
    joined.includes("api_post") ||
    joined.includes("git push") ||
    joined.includes("patch")
  ) {
    safetyDomainCodes.push(DOMAIN_CODES.IMPLEMENTATION_GUARDRAIL);
  }

  return {
    ok: true,
    primaryDomainCode,
    secondaryDomainCodes,
    safetyDomainCodes: unique(safetyDomainCodes),
    requiresHumanReview: safetyDomainCodes.length > 0,
    classificationSummary: `primary=${primaryDomainCode}; secondary=${secondaryDomainCodes.join(",") || "none"}; safety=${unique(safetyDomainCodes).join(",") || "none"}`
  };
}

export function getKnowledgeDomainCodes() {
  return { ...DOMAIN_CODES };
}

// Adds domain-specific, metadata-only providers without changing runtime ownership.
// Unknown source files are included for review, not treated as decoded content.
export function mergeArchitectureMediaDomainCodes(domainCodes = [], input = {}) {
  const values = Array.isArray(domainCodes) ? domainCodes : [domainCodes];
  const merged = [];
  const add = (value) => {
    if (typeof value !== "string") return;
    const code = value.trim();
    if (code && !merged.includes(code)) merged.push(code);
  };
  values.forEach(add);

  const safeInput = input && typeof input === "object" ? input : {};
  const instructionText = normalizeText([
    safeInput.instructionText,
    safeInput.instruction,
    safeInput.prompt,
    safeInput.artifactKind,
  ].filter((value) => typeof value === "string").join(" "));
  const classification = classifyKnowledgeDomains({
    instructionText,
    artifactKind: safeInput.artifactKind,
    sourceRouteCode: safeInput.sourceRouteCode,
  });
  const classified = [classification.primaryDomainCode, ...classification.secondaryDomainCodes];
  if (classified.includes(DOMAIN_CODES.ARCHITECTURE)) add(DOMAIN_CODES.ARCHITECTURE);

  const hasSourceFiles = Array.isArray(safeInput.sourceFiles) && safeInput.sourceFiles.length > 0;
  if (hasSourceFiles || /(?:media|image|audio|video|photo|画像|写真|音声|動画|映像|音楽)/i.test(instructionText)) {
    add("media_analysis");
  }
  return merged;
}
