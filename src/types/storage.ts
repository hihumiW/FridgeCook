import type { CookingPreferences } from "./preference";
import type { RecentIngredients, SelectedIngredients } from "./ingredient";
import type { Recipe } from "./recipe";
import type { SeasoningLibrary } from "./seasoning";

export const STORAGE_KEYS = {
  SELECTED_INGREDIENTS: "selectedIngredients",
  RECENT_INGREDIENTS: "recentIngredients",
  CUSTOM_INGREDIENTS: "customIngredients",
  SEASONING_LIBRARY: "seasoningLibrary",
  COOKING_PREFERENCES: "cookingPreferences",
  LAST_GENERATED_RECIPES: "lastGeneratedRecipes",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export type LocalStorageSchema = {
  [STORAGE_KEYS.SELECTED_INGREDIENTS]: SelectedIngredients;
  [STORAGE_KEYS.RECENT_INGREDIENTS]: RecentIngredients;
  [STORAGE_KEYS.CUSTOM_INGREDIENTS]: SelectedIngredients;
  [STORAGE_KEYS.SEASONING_LIBRARY]: SeasoningLibrary;
  [STORAGE_KEYS.COOKING_PREFERENCES]: CookingPreferences;
  [STORAGE_KEYS.LAST_GENERATED_RECIPES]: Recipe[];
};
