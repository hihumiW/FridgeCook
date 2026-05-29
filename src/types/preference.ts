export type EnergyLevel = "quick_5min" | "normal_15min" | "full_energy";

export type TastePreference =
  | "清淡"
  | "辣一点"
  | "重口味"
  | "热乎汤菜"
  | "下饭菜"
  | "少油"
  | "不挑，能吃就行";

export type CookingPreferences = {
  peopleCount: number;
  energyLevel: EnergyLevel;
  tastePreferences: TastePreference[];
};

export type UserPrompt = string;
