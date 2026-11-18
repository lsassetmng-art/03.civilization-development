/**
 * Architecture Knowledge Provider
 *
 * Scope:
 * - architecture domain context for AIWorkerOS KDB
 * - read-only provider shape
 * - no DB connection
 * - no runtime wiring
 * - no artifact/zip generation
 */

const PROVIDER_CODE = "architecture";
const SUPPORTED_DOMAIN_CODES = Object.freeze(["architecture"]);

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

function asText(value) {
  if (value === undefined || value === null) return "";
  return String(value);
}

function hasAny(text, words) {
  const source = asText(text).toLowerCase();
  return words.some((word) => source.includes(String(word).toLowerCase()));
}

function summarizeFiles(sourceFiles) {
  return asArray(sourceFiles).map((file, index) => {
    if (typeof file === "string") {
      return {
        index,
        kind: "path_reference",
        name: file.split("/").filter(Boolean).pop() || file,
        reference: file,
      };
    }

    const safeFile = file && typeof file === "object" ? file : {};
    return {
      index,
      kind: asText(safeFile.kind || safeFile.fileKind || safeFile.mimeType || "unknown"),
      name: asText(safeFile.name || safeFile.filename || safeFile.path || `source_file_${index + 1}`),
      reference: asText(safeFile.path || safeFile.uri || safeFile.reference || ""),
    };
  });
}

function buildSelectedReferences(context) {
  const instructionText = asText(context.instructionText || context.instruction || context.prompt);
  const artifactKind = asText(context.artifactKind || context.artifact_kind || "");
  const fileSummaries = summarizeFiles(context.sourceFiles);

  const references = [
    {
      referenceCode: "architecture.spatial_planning.baseline",
      title: "空間構成・ゾーニング観点",
      summary:
        "用途、利用者、動線、滞在時間、視認性、保守性を分けて整理し、成果物では空間の目的と制約を明示する。",
      referenceKind: "architecture_planning",
      confidence: "baseline",
    },
    {
      referenceCode: "architecture.circulation.baseline",
      title: "動線・利用導線観点",
      summary:
        "入口、主要導線、裏動線、避難方向、混雑点、作業導線を分け、提案では衝突しやすい箇所を注意点として扱う。",
      referenceKind: "architecture_circulation",
      confidence: "baseline",
    },
    {
      referenceCode: "architecture.material_lighting.baseline",
      title: "素材・照明・質感観点",
      summary:
        "見た目だけでなく、清掃性、耐久性、視認性、明るさ、メンテナンス性を成果物の品質観点へ反映する。",
      referenceKind: "architecture_material_lighting",
      confidence: "baseline",
    },
  ];

  if (hasAny(instructionText, ["店舗", "商業", "売場", "customer", "retail", "shop", "store"])) {
    references.push({
      referenceCode: "architecture.commercial_facility.flow",
      title: "商業空間・売場導線観点",
      summary:
        "来店導線、回遊性、滞留点、商品視認性、スタッフ動線、レジ周辺混雑を分けて整理する。",
      referenceKind: "commercial_architecture",
      confidence: "contextual",
    });
  }

  if (hasAny(instructionText, ["展示", "美術館", "ギャラリー", "exhibition", "museum", "gallery"])) {
    references.push({
      referenceCode: "architecture.exhibition_space.experience",
      title: "展示空間・鑑賞体験観点",
      summary:
        "鑑賞順路、作品間距離、照明、解説導線、滞留、混雑、作品保護を分けて扱う。",
      referenceKind: "exhibition_architecture",
      confidence: "contextual",
    });
  }

  if (hasAny(instructionText, ["住宅", "住居", "家", "house", "home", "residential"])) {
    references.push({
      referenceCode: "architecture.residential.living_flow",
      title: "住宅・生活導線観点",
      summary:
        "生活動線、収納、採光、換気、家事動線、プライバシー、将来変更余地を整理する。",
      referenceKind: "residential_architecture",
      confidence: "contextual",
    });
  }

  if (artifactKind) {
    references.push({
      referenceCode: "architecture.artifact_kind.context",
      title: "成果物種別に応じた建築文脈",
      summary: `artifactKind=${artifactKind} を前提に、空間提案・レビュー・説明資料のどれに寄せるかを整理する。`,
      referenceKind: "artifact_context",
      confidence: "contextual",
    });
  }

  for (const file of fileSummaries) {
    references.push({
      referenceCode: `architecture.source_file.${file.index + 1}`,
      title: `参照ファイル ${file.index + 1}: ${file.name}`,
      summary:
        "建築・空間・導線・素材・用途に関する参照資料として扱う。実画像/図面解析はMedia analysis provider側の責務。",
      referenceKind: "source_file_reference",
      confidence: "source_declared",
      metadata: file,
    });
  }

  return references;
}

function buildSafetyCautions(context) {
  const instructionText = asText(context.instructionText || context.instruction || context.prompt);
  const cautions = [
    {
      cautionCode: "architecture.no_professional_substitution",
      severity: "warn",
      message:
        "建築士業務、構造計算、法規適合、確認申請、施工安全の最終判断は行わない。必要な場合は専門家確認を要求する。",
    },
    {
      cautionCode: "architecture.legal_and_fire_safety",
      severity: "warn",
      message:
        "建築基準法、条例、消防、避難、バリアフリー、用途地域、許認可は地域・用途により変わるため断定しない。",
    },
    {
      cautionCode: "architecture.source_file_boundary",
      severity: "info",
      message:
        "画像・図面・動画などの実ファイル解析はMedia analysis providerの解析結果を使う。Architecture provider単独では見えた内容を断定しない。",
    },
  ];

  if (hasAny(instructionText, ["構造", "耐震", "荷重", "柱", "梁", "基礎", "seismic", "structure"])) {
    cautions.push({
      cautionCode: "architecture.structural_review_required",
      severity: "block_or_human_review",
      message:
        "構造、耐震、荷重、柱梁基礎に関わる判断は専門家確認が必要。成果物では設計案ではなく確認項目として扱う。",
    });
  }

  if (hasAny(instructionText, ["施工", "工事", "解体", "電気工事", "配管", "construction", "demolition"])) {
    cautions.push({
      cautionCode: "architecture.construction_safety_required",
      severity: "block_or_human_review",
      message:
        "施工・工事・解体・電気配管等の作業指示は安全リスクが高い。具体作業指示ではなく計画上の注意点に留める。",
    });
  }

  return cautions;
}

function shouldRequireHumanReview(cautions) {
  return cautions.some((caution) => caution.severity === "block_or_human_review");
}

export async function resolveKnowledgeContext(context = {}) {
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
      "Architecture provider selected spatial planning, circulation, material/lighting, source-file boundary, and architecture safety cautions for downstream deliverable generation.",
    requiresHumanReview,
    metadata: {
      providerVersion: "1.0.0",
      runtimeWiring: false,
      dbConnection: false,
      dbWrite: false,
      artifactGeneration: false,
      sourceFileCount: asArray(context.sourceFiles).length,
      roleCode: asText(context.roleCode || ""),
      robotModelCode: asText(context.robotModelCode || ""),
    },
  };
}

export const architectureProvider = Object.freeze({
  providerCode: PROVIDER_CODE,
  supportedDomainCodes: [...SUPPORTED_DOMAIN_CODES],
  resolveKnowledgeContext,
});

export default architectureProvider;
