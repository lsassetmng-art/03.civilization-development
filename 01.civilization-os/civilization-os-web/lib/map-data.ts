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


// ============================================================
// R11_NAVIGATION_SLICE_BEGIN
//
// Runtime navigation projection only.
// This does not create nation truth, entitlement truth,
// Persona ownership truth, or head-of-state truth.
// ============================================================

export type R11ContinentCode =
  | "north-continent"
  | "central-continent"
  | "south-continent";

export type R11LiveNationCode =
  | "helios"
  | "nova"
  | "seiwa"
  | "gladia"
  | "orpheus"
  | "free-cities-union";

export type R11HistoricalNationCode = "aurelia";

export type R11NationCode =
  | R11LiveNationCode
  | R11HistoricalNationCode;

export type R11NationEntry = {
  code: R11NationCode;
  name: string;
  runtimeClass:
    | "CURRENT_SEED_NATION"
    | "HISTORICAL_DISMANTLED";
};

const R11_CONTINENT_NATIONS: Record<
  R11ContinentCode,
  readonly R11NationEntry[]
> = {
  "north-continent": [
    {
      code: "helios",
      name: "Helios Democratic Kingdom",
      runtimeClass: "CURRENT_SEED_NATION",
    },
  ],

  "central-continent": [
    {
      code: "nova",
      name: "Nova Commercial Federation",
      runtimeClass: "CURRENT_SEED_NATION",
    },
    {
      code: "seiwa",
      name: "Seiwa State",
      runtimeClass: "CURRENT_SEED_NATION",
    },
    {
      code: "gladia",
      name: "Gladia Military Alliance",
      runtimeClass: "CURRENT_SEED_NATION",
    },
  ],

  "south-continent": [
    {
      code: "orpheus",
      name: "Orpheus Oceanic Union",
      runtimeClass: "CURRENT_SEED_NATION",
    },
    {
      code: "aurelia",
      name: "Aurelia Federal Republic",
      runtimeClass: "HISTORICAL_DISMANTLED",
    },
    {
      code: "free-cities-union",
      name: "Free Cities Union",
      runtimeClass: "CURRENT_SEED_NATION",
    },
  ],
};

const R11_NATION_CITIES: Record<
  R11LiveNationCode,
  readonly string[]
> = {
  helios: [
    "helios_city",
    "uno",
    "due",
    "tre",
    "quattro",
    "cinque",
    "sei",
    "sette",
    "otto",
  ],

  nova: [
    "center_commercial_city",
    "asic_city",
    "gold_city",
    "bad_drunk",
    "silver_gate",
    "cloud_city",
    "north_port",
    "south_gate",
    "lumina",
    "market_hill",
  ],

  seiwa: [
    "kyo",
    "aomine",
    "kamihiryo",
    "higashi_kakona",
    "nishi_keihin",
    "minami_kiyohara",
    "tetsuo",
    "shin_seigaku",
    "kita_seihama",
    "gakuto_shirasagi",
  ],

  gladia: [
    "third_base",
    "first_port_base",
    "second_base",
    "fourth_port_base",
    "west_border_line",
    "fifth_arsenal_zone",
    "east_logistics_city",
    "south_armor_city",
    "north_training_zone",
  ],

  orpheus: [
    "ye_moja",
    "ye_elewa",
    "ye_salima",
    "ye_tuba",
    "ye_kara",
    "ye_noa",
  ],

  "free-cities-union": [
    "liberta",
    "freedal",
    "autonova",
    "liberos",
    "freiheim",
    "sovoda",
    "azadia",
    "eleusa",
    "nondomina",
    "opena",
    "concordia",
    "selefa",
  ],
};

export function isR11ContinentCode(
  value: string | null,
): value is R11ContinentCode {
  return (
    value === "north-continent" ||
    value === "central-continent" ||
    value === "south-continent"
  );
}

export function isR11LiveNationCode(
  value: string | null,
): value is R11LiveNationCode {
  return (
    value === "helios" ||
    value === "nova" ||
    value === "seiwa" ||
    value === "gladia" ||
    value === "orpheus" ||
    value === "free-cities-union"
  );
}

export function getR11ContinentNationEntries(
  continent: R11ContinentCode,
): readonly R11NationEntry[] {
  return R11_CONTINENT_NATIONS[continent];
}

export function getR11CitiesForNation(
  nation: R11LiveNationCode,
): readonly string[] {
  return R11_NATION_CITIES[nation];
}

// ============================================================
// R11_NAVIGATION_SLICE_END
// ============================================================
