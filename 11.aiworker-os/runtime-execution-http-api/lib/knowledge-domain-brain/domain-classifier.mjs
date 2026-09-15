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

// KDB_ARCHITECTURE_MEDIA_CLASSIFIER_HINTS_START
// Classifier helper exports only.
// Scope: architecture/media_analysis domain hinting.
// No runtime wiring, no DB connection, no DB write, no API POST.

const KDB_ARCHITECTURE_DOMAIN_CODE = "architecture";
const KDB_MEDIA_ANALYSIS_DOMAIN_CODE = "media_analysis";

const KDB_ARCHITECTURE_TEXT_HINTS = Object.freeze([
  "architecture",
  "architectural",
  "building",
  "floor plan",
  "space planning",
  "spatial planning",
  "circulation",
  "zoning",
  "interior",
  "exterior",
  "facility",
  "store layout",
  "shop layout",
  "residential",
  "housing",
  "construction",
  "structure",
  "seismic",
  "material",
  "lighting",
  "建築",
  "空間",
  "空間設計",
  "間取り",
  "平面図",
  "図面",
  "導線",
  "動線",
  "ゾーニング",
  "内装",
  "外装",
  "施設",
  "店舗設計",
  "売場",
  "住宅",
  "住居",
  "施工",
  "構造",
  "耐震",
  "素材",
  "照明"
]);

const KDB_MEDIA_ANALYSIS_TEXT_HINTS = Object.freeze([
  "media analysis",
  "image analysis",
  "audio analysis",
  "video analysis",
  "photo",
  "picture",
  "screenshot",
  "audio",
  "music",
  "voice",
  "video",
  "movie",
  "mp3",
  "wav",
  "m4a",
  "mp4",
  "mov",
  "webm",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "画像",
  "写真",
  "スクショ",
  "スクリーンショット",
  "音声",
  "音楽",
  "声",
  "動画",
  "映像",
  "実ファイル解析",
  "メディア解析"
]);

const KDB_MEDIA_ANALYSIS_FILE_EXTENSIONS = Object.freeze([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".bmp",
  ".svg",
  ".mp3",
  ".wav",
  ".m4a",
  ".aac",
  ".flac",
  ".ogg",
  ".mp4",
  ".mov",
  ".mkv",
  ".webm",
  ".avi"
]);

export const KDB_ARCHITECTURE_MEDIA_DOMAIN_HINTS = Object.freeze({
  architecture: KDB_ARCHITECTURE_TEXT_HINTS,
  media_analysis: KDB_MEDIA_ANALYSIS_TEXT_HINTS,
  mediaFileExtensions: KDB_MEDIA_ANALYSIS_FILE_EXTENSIONS,
});

function __kdbArchitectureMediaAsArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

function __kdbArchitectureMediaAsText(value) {
  if (value === undefined || value === null) return "";
  return String(value);
}

function __kdbArchitectureMediaLower(value) {
  return __kdbArchitectureMediaAsText(value).toLowerCase();
}

function __kdbArchitectureMediaIncludesAny(text, hints) {
  const source = __kdbArchitectureMediaLower(text);
  return hints.some((hint) => source.includes(__kdbArchitectureMediaLower(hint)));
}

function __kdbArchitectureMediaSourceFileText(sourceFiles) {
  return __kdbArchitectureMediaAsArray(sourceFiles)
    .map((file) => {
      if (typeof file === "string") return file;
      const safeFile = file && typeof file === "object" ? file : {};
      return [
        safeFile.name,
        safeFile.filename,
        safeFile.path,
        safeFile.uri,
        safeFile.reference,
        safeFile.mimeType,
        safeFile.mime,
        safeFile.contentType,
        safeFile.kind,
      ]
        .filter(Boolean)
        .map(String)
        .join(" ");
    })
    .join(" ");
}

function __kdbArchitectureMediaHasMediaFileExtension(sourceFiles) {
  const fileText = __kdbArchitectureMediaLower(__kdbArchitectureMediaSourceFileText(sourceFiles));
  return KDB_MEDIA_ANALYSIS_FILE_EXTENSIONS.some((extension) => fileText.includes(extension));
}

function __kdbArchitectureMediaNormalizeInput(input = {}) {
  const safeInput = input && typeof input === "object" ? input : {};
  const instructionText = [
    safeInput.instructionText,
    safeInput.instruction,
    safeInput.prompt,
    safeInput.userPrompt,
    safeInput.requestText,
    safeInput.title,
    safeInput.description,
    safeInput.artifactKind,
    safeInput.artifact_kind,
    safeInput.classification,
  ]
    .filter(Boolean)
    .map(String)
    .join(" ");

  const sourceFileText = __kdbArchitectureMediaSourceFileText(safeInput.sourceFiles);

  return {
    instructionText,
    sourceFileText,
    sourceFiles: safeInput.sourceFiles,
  };
}

export function classifyArchitectureMediaDomainCodes(input = {}) {
  const normalized = __kdbArchitectureMediaNormalizeInput(input);
  const combinedText = `${normalized.instructionText} ${normalized.sourceFileText}`;
  const domainCodes = [];

  if (__kdbArchitectureMediaIncludesAny(combinedText, KDB_ARCHITECTURE_TEXT_HINTS)) {
    domainCodes.push(KDB_ARCHITECTURE_DOMAIN_CODE);
  }

  if (
    __kdbArchitectureMediaIncludesAny(combinedText, KDB_MEDIA_ANALYSIS_TEXT_HINTS) ||
    __kdbArchitectureMediaHasMediaFileExtension(normalized.sourceFiles)
  ) {
    domainCodes.push(KDB_MEDIA_ANALYSIS_DOMAIN_CODE);
  }

  return [...new Set(domainCodes)];
}

export function mergeArchitectureMediaDomainCodes(existingDomainCodes = [], input = {}) {
  const existing = __kdbArchitectureMediaAsArray(existingDomainCodes)
    .filter(Boolean)
    .map(String);

  const detected = classifyArchitectureMediaDomainCodes(input);

  return [...new Set([...existing, ...detected])];
}
// KDB_ARCHITECTURE_MEDIA_CLASSIFIER_HINTS_END
