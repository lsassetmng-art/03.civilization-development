import type { SupportedLocale } from "@/types/locale";

export type ContinentCode = "north-continent" | "central-continent" | "south-continent";

export type ContinentMapEntry = {
  code: ContinentCode;
  label: string;
  shortLabel: string;
  visualLabel: string;
  href: string;
  description: string;
  landscapeNote: string;
};

const continentLabels: Record<SupportedLocale, Record<ContinentCode, Omit<ContinentMapEntry, "code" | "href">>> = {
  ja: {
    "north-continent": {
      label: "北大陸",
      shortLabel: "北",
      visualLabel: "北大陸画像",
      description: "寒冷地帯、山岳、北方都市群を中心にした大陸です。資源・防衛・北方交易の起点になります。",
      landscapeNote: "山岳・雪原・北方都市"
    },
    "central-continent": {
      label: "中央大陸",
      shortLabel: "中",
      visualLabel: "中央大陸画像",
      description: "文明圏の中心となる大陸です。政治、商業、交通、文化施設が集中し、各大陸への中継点になります。",
      landscapeNote: "都市圏・交易路・中央平原"
    },
    "south-continent": {
      label: "南大陸",
      shortLabel: "南",
      visualLabel: "南大陸画像",
      description: "温暖な地域、港湾、農業、海洋資源を中心にした大陸です。南方交易と開拓の起点になります。",
      landscapeNote: "港湾・農地・南方海域"
    }
  },
  en: {
    "north-continent": {
      label: "North Continent",
      shortLabel: "N",
      visualLabel: "North Continent Image",
      description: "A northern continent centered on cold regions, mountains, and northern cities. It supports resources, defense, and northern trade.",
      landscapeNote: "Mountains / snowfields / northern cities"
    },
    "central-continent": {
      label: "Central Continent",
      shortLabel: "C",
      visualLabel: "Central Continent Image",
      description: "The core continent of civilization. Politics, commerce, traffic, and cultural facilities concentrate here.",
      landscapeNote: "Urban core / trade routes / central plains"
    },
    "south-continent": {
      label: "South Continent",
      shortLabel: "S",
      visualLabel: "South Continent Image",
      description: "A warm southern continent centered on ports, agriculture, and marine resources. It supports southern trade and development.",
      landscapeNote: "Ports / farms / southern sea"
    }
  }
};

export function getGlobalMapContinents(locale: SupportedLocale): ContinentMapEntry[] {
  return (["north-continent", "central-continent", "south-continent"] as const).map((code) => ({
    code,
    href: `/continent-map?continent=${code}`,
    ...continentLabels[locale][code]
  }));
}

export function getContinentByCode(locale: SupportedLocale, code: string | null | undefined): ContinentMapEntry {
  const continents = getGlobalMapContinents(locale);
  return continents.find((continent) => continent.code === code) ?? continents[0];
}
