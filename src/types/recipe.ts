import type { CookingPreferences } from "./preference";

export type RecipeDifficulty = 0 | 1 | 2 | 3 | 4 | 5;

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
  riskFlags?: string[];
};

export type GenerateRecipeResponse = {
  recipes: Recipe[];
};
