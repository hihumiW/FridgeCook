export type IngredientCategory =
  | "common"
  | "vegetable"
  | "meat_seafood"
  | "egg_processed"
  | "soy"
  | "staple"
  | "frozen"
  | "other";

export type Ingredient = {
  id: string;
  name: string;
  category: IngredientCategory;
  emoji?: string;
  image?: string;
  aliases?: string[];
  isCommon?: boolean;
  isCustom?: boolean;
};

export type SelectedIngredients = Ingredient[];

export type RecentIngredient = Pick<
  Ingredient,
  "id" | "name" | "category" | "emoji" | "image" | "aliases" | "isCommon" | "isCustom"
>;

export type RecentIngredients = RecentIngredient[];
