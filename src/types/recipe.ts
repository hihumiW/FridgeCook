import type { CookingPreferences } from "./preference";

export type RecipeDifficulty = "极简" | "简单" | "正常" | "稍复杂";

export type GenerateRecipeRequest = CookingPreferences & {
  ingredients: string[];
  seasonings: string[];
  userPrompt?: string;
};

export type Recipe = {
  id: string;
  name: string;
  estimatedTime: string;
  difficulty: RecipeDifficulty;
  servings: number;
  usedIngredients: string[];
  usedSeasonings: string[];
  reason: string;
  steps: string[];
  warnings: string[];
  substitutions: string[];
};

export type GenerateRecipeResponse = {
  recipes: Recipe[];
};
