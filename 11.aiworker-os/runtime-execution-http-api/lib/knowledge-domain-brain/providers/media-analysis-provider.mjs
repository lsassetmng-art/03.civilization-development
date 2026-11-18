/**
 * Media Analysis Knowledge Provider
 *
 * Scope:
 * - media_analysis domain context for AIWorkerOS KDB
 * - read-only provider shape
 * - no DB connection
 * - no runtime wiring
 * - no artifact/zip generation
 * - no real media decoder in initial provider
 */

const PROVIDER_CODE = "media_analysis";
const SUPPORTED_DOMAIN_CODES = Object.freeze(["media_analysis"]);

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

function asText(value) {
  if (value === undefined || value === null) return "";
  return String(value);
}

function lower(value) {
  return asText(value).toLowerCase();
}

function inferMediaKind(file) {
  if (typeof file === "string") {
    const name = lower(file);
    if (/\.(png|jpg|jpeg|webp|gif|bmp|svg)$/.test(name)) return "image";
    if (/\.(mp3|wav|m4a|aac|flac|ogg)$/.test(name)) return "audio";
    if (/\.(mp4|mov|mkv|webm|avi)$/.test(name)) return "video";
    if (/\.(pdf|docx|pptx|xlsx|txt|md|csv)$/.test(name)) return "document";
    return "unknown";
  }

  const safeFile = file && typeof file === "object" ? file : {};
  const mime = lower(safeFile.mimeType || safeFile.mime || safeFile.contentType || "");
  const name = lower(safeFile.name || safeFile.filename || safeFile.path || "");

  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  if (mime.includes("pdf") || mime.includes("document") || mime.includes("text")) return "document";

  if (/\.(png|jpg|jpeg|webp|gif|bmp|svg)$/.test(name)) return "image";
  if (/\.(mp3|wav|m4a|aac|flac|ogg)$/.test(name)) return "audio";
  if (/\.(mp4|mov|mkv|webm|avi)$/.test(name)) return "video";
  if (/\.(pdf|docx|pptx|xlsx|txt|md|csv)$/.test(name)) return "document";

  return "unknown";
}

function normalizeSourceFiles(sourceFiles) {
  return asArray(sourceFiles).map((file, index) => {
    if (typeof file === "string") {
      return {
        index,
        mediaKind: inferMediaKind(file),
        name: file.split("/").filter(Boolean).pop() || file,
        reference: file,
        declaredMimeType: "",
      };
    }

    const safeFile = file && typeof file === "object" ? file : {};
    return {
      index,
      mediaKind: inferMediaKind(safeFile),
      name: asText(safeFile.name || safeFile.filename || safeFile.path || `source_file_${index + 1}`),
      reference: asText(safeFile.path || safeFile.uri || safeFile.reference || ""),
      declaredMimeType: asText(safeFile.mimeType || safeFile.mime || safeFile.contentType || ""),
    };
  });
}

function buildSelectedReferences(context) {
  const files = normalizeSourceFiles(context.sourceFiles);
  const references = [
    {
      referenceCode: "media_analysis.initial_boundary",
      title: "メディア解析provider初期境界",
      summary:
        "初回providerでは実ファイル解析エンジン本体は持たず、sourceFilesの種別整理、解析可能性、権利・安全注意、他providerへ渡す文脈化を担当する。",
      referenceKind: "provider_boundary",
      confidence: "baseline",
    },
  ];

  const imageCount = files.filter((file) => file.mediaKind === "image").length;
  const audioCount = files.filter((file) => file.mediaKind === "audio").length;
  const videoCount = files.filter((file) => file.mediaKind === "video").length;
  const documentCount = files.filter((file) => file.mediaKind === "document").length;
  const unknownCount = files.filter((file) => file.mediaKind === "unknown").length;

  if (imageCount > 0) {
    references.push({
      referenceCode: "media_analysis.image.context",
      title: "画像ファイル解析文脈",
      summary:
        "画像は構図、被写体、色彩、質感、文字情報、権利・肖像・商標注意へ分解して扱う。実画像内容の断定は解析結果がある場合に限定する。",
      referenceKind: "image_analysis_context",
      confidence: "source_declared",
    });
  }

  if (audioCount > 0) {
    references.push({
      referenceCode: "media_analysis.audio.context",
      title: "音声・音楽ファイル解析文脈",
      summary:
        "音声は話者、内容、音質、テンポ、雰囲気、BGM利用、権利注意へ分解して扱う。採譜・歌詞・著作権判断は断定しない。",
      referenceKind: "audio_analysis_context",
      confidence: "source_declared",
    });
  }

  if (videoCount > 0) {
    references.push({
      referenceCode: "media_analysis.video.context",
      title: "動画ファイル解析文脈",
      summary:
        "動画はシーン、構図、動き、音声、字幕、ブランド露出、人物・肖像、編集意図へ分解して扱う。",
      referenceKind: "video_analysis_context",
      confidence: "source_declared",
    });
  }

  if (documentCount > 0) {
    references.push({
      referenceCode: "media_analysis.document.context",
      title: "文書・資料ファイル解析文脈",
      summary:
        "資料ファイルは本文、表、図、スクリーンショット、添付画像の有無を分け、成果物生成時の根拠資料として扱う。",
      referenceKind: "document_analysis_context",
      confidence: "source_declared",
    });
  }

  if (unknownCount > 0) {
    references.push({
      referenceCode: "media_analysis.unknown_file.context",
      title: "種別不明ファイル注意",
      summary:
        "種別不明ファイルは解析可能性を断定せず、ファイル名・宣言mime・パス情報の範囲で扱う。",
      referenceKind: "unknown_file_context",
      confidence: "low",
    });
  }

  for (const file of files) {
    references.push({
      referenceCode: `media_analysis.source_file.${file.index + 1}`,
      title: `解析対象ファイル ${file.index + 1}: ${file.name}`,
      summary: `mediaKind=${file.mediaKind} として扱う。初回providerでは実内容解析ではなく、解析文脈と注意点の正規化を行う。`,
      referenceKind: "source_file_reference",
      confidence: file.mediaKind === "unknown" ? "low" : "source_declared",
      metadata: file,
    });
  }

  references.push({
    referenceCode: "media_analysis.file_count.summary",
    title: "解析対象ファイル数サマリ",
    summary: `image=${imageCount}, audio=${audioCount}, video=${videoCount}, document=${documentCount}, unknown=${unknownCount}`,
    referenceKind: "media_file_count_summary",
    confidence: "source_declared",
  });

  return references;
}

function buildSafetyCautions(context) {
  const files = normalizeSourceFiles(context.sourceFiles);
  const hasImage = files.some((file) => file.mediaKind === "image");
  const hasAudio = files.some((file) => file.mediaKind === "audio");
  const hasVideo = files.some((file) => file.mediaKind === "video");
  const hasUnknown = files.some((file) => file.mediaKind === "unknown");

  const cautions = [
    {
      cautionCode: "media_analysis.no_real_decoder_initial",
      severity: "info",
      message:
        "初回providerは実ファイル解析エンジンを持たない。実内容に基づく断定は、別途解析結果が渡された場合に限定する。",
    },
    {
      cautionCode: "media_analysis.rights_baseline",
      severity: "warn",
      message:
        "画像・音声・動画・資料は著作権、商標、肖像、個人情報、既存作品類似、商用利用条件を確認する。",
    },
  ];

  if (hasImage || hasVideo) {
    cautions.push({
      cautionCode: "media_analysis.visual_identity_caution",
      severity: "warn",
      message:
        "人物、顔、制服、企業ロゴ、店舗外観、車両、住所、画面内個人情報が含まれる可能性に注意する。",
    });
  }

  if (hasAudio || hasVideo) {
    cautions.push({
      cautionCode: "media_analysis.audio_rights_caution",
      severity: "warn",
      message:
        "音楽、歌声、ナレーション、会話、BGMは著作権・実演・録音権・同意・商用利用条件を確認する。",
    });
  }

  if (hasUnknown) {
    cautions.push({
      cautionCode: "media_analysis.unknown_file_review",
      severity: "warn",
      message:
        "種別不明ファイルがあるため、解析可能性・安全性・利用可否を断定しない。",
    });
  }

  return cautions;
}

function shouldRequireHumanReview(cautions) {
  return cautions.some((caution) => caution.severity === "block_or_human_review");
}

export async function resolveKnowledgeContext(context = {}) {
  const files = normalizeSourceFiles(context.sourceFiles);
  const selectedReferences = buildSelectedReferences(context);
  const safetyCautions = buildSafetyCautions(context);
  const requiresHumanReview = shouldRequireHumanReview(safetyCautions);

  return {
    ok: true,
    statusCode: "READY",
    providerCode: PROVIDER_CODE,
    supportedDomainCodes: [...SUPPORTED_DOMAIN_CODES],
    selectedReferences,
    safetyCautions,
    usageSummary:
      "Media analysis provider normalized source file media kinds, analysis boundaries, rights cautions, and downstream media context for deliverable generation.",
    requiresHumanReview,
    metadata: {
      providerVersion: "1.0.0",
      runtimeWiring: false,
      dbConnection: false,
      dbWrite: false,
      artifactGeneration: false,
      realMediaDecoder: false,
      sourceFileCount: files.length,
      mediaKinds: files.map((file) => file.mediaKind),
      roleCode: asText(context.roleCode || ""),
      robotModelCode: asText(context.robotModelCode || ""),
    },
  };
}

export const mediaAnalysisProvider = Object.freeze({
  providerCode: PROVIDER_CODE,
  supportedDomainCodes: [...SUPPORTED_DOMAIN_CODES],
  resolveKnowledgeContext,
});

export default mediaAnalysisProvider;
