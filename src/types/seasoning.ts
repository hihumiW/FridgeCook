export type SeasoningCategory =
  | "basic"
  | "flavor_booster"
  | "aromatics"
  | "advanced"
  | "custom";

export type Seasoning = {
  id: string;
  name: string;
  category: SeasoningCategory;
  emoji?: string;
  image?: string;
  aliases?: string[];
  isDefault?: boolean;
  isCommon?: boolean;
  isCustom?: boolean;
};

export type SeasoningLibrary = {
  selectedSeasonings: Seasoning[];
  customSeasonings: Seasoning[];
  updatedAt: string;
};
