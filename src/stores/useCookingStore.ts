import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ingredients, seasonings } from "@/data";
import { appendExtraPrompt, generateRecipesWithLlm } from "@/lib/recipeGeneration";
import type {
  CookingPreferences,
  EnergyLevel,
  GenerateRecipeRequest,
  Ingredient,
  LlmConfig,
  RecentIngredient,
  Recipe,
  Seasoning,
  SeasoningLibrary,
  TastePreference,
} from "@/types";

type CookingStore = {
  /** 本次临时选择的食材；不是长期库存，主要用于本次生成菜谱。 */
  selectedIngredients: Ingredient[];
  /** 最近使用过的食材；用于下次快速点选，最多保留 20 个。 */
  recentIngredients: RecentIngredient[];
  /** 用户长期保存的自定义食材候选；不代表库存，只用于快速点选。 */
  customIngredients: Ingredient[];
  /** 用户长期维护的调料库；会持久化到 LocalStorage。 */
  seasoningLibrary: SeasoningLibrary;
  /** 点菜偏好，包括用餐人数、精力值和口味偏好；会持久化到 LocalStorage。 */
  preferences: CookingPreferences;
  /** 当次个性化要求；属于临时输入，不持久化。 */
  userPrompt: string;
  /** 当前生成出的菜谱结果；后续接 AI 后使用，不持久化。 */
  generatedRecipes: Recipe[];
  /** 当前是否正在请求模型生成菜谱。 */
  isGeneratingRecipes: boolean;
  /** 最近一次生成菜谱失败的错误信息。 */
  generateRecipeError: string | null;
  /** 浏览器直连 LLM 的本地配置；包含 Base URL、API Key 和模型名。 */
  llmConfig: LlmConfig;
  /** 选中或取消选中一个本次食材。 */
  toggleIngredient: (ingredient: Ingredient) => void;
  /** 清空本次已选食材。 */
  clearSelectedIngredients: () => void;
  /** 将本次已选食材合并进最近使用食材列表。 */
  rememberSelectedIngredients: () => void;
  /** 新增一个自定义食材，并默认加入本次已选食材。 */
  addCustomIngredient: (name: string) => void;
  /** 批量加入图片识别出的食材；未知食材会保存为自定义食材。 */
  addRecognizedIngredients: (names: string[]) => void;
  /** 删除一个自定义食材，同时从本次已选食材里移除。 */
  removeCustomIngredient: (id: string) => void;
  /** 选中或取消选中一个调料，并自动更新调料库时间。 */
  toggleSeasoning: (seasoning: Seasoning) => void;
  /** 新增一个自定义调料，并默认加入已选调料。 */
  addCustomSeasoning: (name: string) => void;
  /** 删除一个自定义调料，同时从已选调料里移除。 */
  removeCustomSeasoning: (id: string) => void;
  /** 将调料库恢复为默认调料：盐和食用油。 */
  resetSeasoningsToDefault: () => void;
  /** 清空已选调料，但保留自定义调料候选。 */
  clearSelectedSeasonings: () => void;
  /** 设置用餐人数，范围限制在 1 到 12。 */
  setPeopleCount: (count: number) => void;
  /** 设置当前精力值。 */
  setEnergyLevel: (energyLevel: EnergyLevel) => void;
  /** 选中或取消选中一个口味偏好。 */
  toggleTastePreference: (preference: TastePreference) => void;
  /** 设置当次个性化要求，最多保留 200 字。 */
  setUserPrompt: (prompt: string) => void;
  /** 写入生成出的菜谱结果。 */
  setGeneratedRecipes: (recipes: Recipe[]) => void;
  /** 清空当前菜谱结果。 */
  clearGeneratedRecipes: () => void;
  /** 根据当前页面状态调用 LLM 生成菜谱。 */
  generateRecipes: (options?: {
    extraPrompt?: string;
    previousRecipes?: Recipe[];
  }) => Promise<boolean>;
  /** 清空最近一次生成错误。 */
  clearGenerateRecipeError: () => void;
  /** 保存浏览器直连 LLM 的本地配置。 */
  setLlmConfig: (config: LlmConfig) => void;
  /** 清空浏览器直连 LLM 的本地配置。 */
  resetLlmConfig: () => void;
  /** 根据当前页面状态组装生成菜谱请求参数。 */
  buildGenerateRecipeRequest: () => GenerateRecipeRequest;
};

const defaultSeasonings = seasonings.filter((seasoning) => seasoning.isDefault);

const defaultPreferences: CookingPreferences = {
  peopleCount: 1,
  energyLevel: "normal_15min",
  tastePreferences: ["不挑，能吃就行"],
};

const defaultLlmConfig: LlmConfig = {
  baseUrl: "",
  apiKey: "",
  model: "",
  temperature: 0.3,
};

function uniqueById<T extends { id: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

function hasValidName(item: { id?: string; name?: string }) {
  return Boolean(item.id?.trim() && item.name?.trim());
}

function uniqueValidByIdAndName<T extends { id: string; name: string }>(items: T[]) {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  return items.filter((item) => {
    const id = item.id.trim();
    const name = normalizeForCompare(item.name);

    if (!id || !name || seenIds.has(id) || seenNames.has(name)) {
      return false;
    }

    seenIds.add(id);
    seenNames.add(name);
    return true;
  });
}

function toRecentIngredient(ingredient: Ingredient): RecentIngredient {
  return {
    id: ingredient.id,
    name: ingredient.name,
    category: ingredient.category,
    emoji: ingredient.emoji,
    image: ingredient.image,
    aliases: ingredient.aliases,
    isCommon: ingredient.isCommon,
    isCustom: ingredient.isCustom,
  };
}

function normalizeCustomIngredientName(name: string) {
  return name.trim().slice(0, 20);
}

function normalizeCustomSeasoningName(name: string) {
  return name.trim().slice(0, 20);
}

function normalizeForCompare(name: string) {
  return name.trim();
}

function seasoningMatchesName(seasoning: Seasoning, name: string) {
  const normalizedName = normalizeForCompare(name);
  return (
    normalizeForCompare(seasoning.name) === normalizedName ||
    seasoning.aliases?.some((alias) => normalizeForCompare(alias) === normalizedName)
  );
}

function ingredientMatchesName(ingredient: Ingredient | RecentIngredient, name: string) {
  const normalizedName = normalizeForCompare(name);
  return (
    normalizeForCompare(ingredient.name) === normalizedName ||
    ingredient.aliases?.some((alias) => normalizeForCompare(alias) === normalizedName)
  );
}

function findIngredientByName(
  candidates: (Ingredient | RecentIngredient)[],
  name: string,
) {
  return candidates.find((ingredient) => ingredientMatchesName(ingredient, name));
}

function toIngredient(ingredient: Ingredient | RecentIngredient): Ingredient {
  return {
    id: ingredient.id,
    name: ingredient.name,
    category: ingredient.category,
    emoji: ingredient.emoji,
    image: ingredient.image,
    aliases: ingredient.aliases,
    isCommon: ingredient.isCommon,
    isCustom: ingredient.isCustom,
  };
}

function sanitizeSeasoningLibrary(library: SeasoningLibrary): SeasoningLibrary {
  return {
    selectedSeasonings: uniqueValidByIdAndName(
      library.selectedSeasonings.filter(hasValidName),
    ),
    customSeasonings: uniqueValidByIdAndName(
      library.customSeasonings.filter(hasValidName),
    ),
    updatedAt: library.updatedAt || new Date().toISOString(),
  };
}

function sanitizeLlmConfig(
  config?: Partial<LlmConfig> & { endpointUrl?: string },
): LlmConfig {
  return {
    baseUrl: config?.baseUrl?.trim() ?? config?.endpointUrl?.trim() ?? "",
    apiKey: config?.apiKey?.trim() ?? "",
    model: config?.model?.trim() ?? "",
    temperature: clampTemperature(config?.temperature),
  };
}

function clampTemperature(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0.3;
  return Math.max(0.1, Math.min(0.8, Number(value.toFixed(1))));
}

function uniqueTrimmedNames(names: readonly string[]) {
  const seenNames = new Set<string>();
  const result: string[] = [];

  for (const name of names) {
    const normalizedName = normalizeForCompare(name);
    if (!normalizedName || seenNames.has(normalizedName)) continue;
    seenNames.add(normalizedName);
    result.push(name.trim());
  }

  return result;
}

export const useCookingStore = create<CookingStore>()(
  persist(
    (set, get) => ({
      selectedIngredients: [],
      recentIngredients: [],
      customIngredients: [],
      seasoningLibrary: {
        selectedSeasonings: defaultSeasonings,
        customSeasonings: [],
        updatedAt: new Date().toISOString(),
      },
      preferences: defaultPreferences,
      userPrompt: "",
      generatedRecipes: [],
      isGeneratingRecipes: false,
      generateRecipeError: null,
      llmConfig: defaultLlmConfig,

      toggleIngredient: (ingredient) =>
        set((state) => {
          const exists = state.selectedIngredients.some((item) => item.id === ingredient.id);
          return {
            selectedIngredients: exists
              ? state.selectedIngredients.filter((item) => item.id !== ingredient.id)
              : [...state.selectedIngredients, ingredient],
          };
        }),

      clearSelectedIngredients: () => set({ selectedIngredients: [] }),

      rememberSelectedIngredients: () =>
        set((state) => ({
          recentIngredients: uniqueValidByIdAndName([
            ...state.selectedIngredients.map(toRecentIngredient),
            ...state.recentIngredients,
          ]).slice(0, 20),
        })),

      addCustomIngredient: (name) =>
        set((state) => {
          const normalizedName = normalizeCustomIngredientName(name);
          if (!normalizedName) return state;

          const allIngredients = [
            ...ingredients,
            ...state.customIngredients,
            ...state.recentIngredients,
            ...state.selectedIngredients,
          ];
          const isDuplicate = allIngredients.some((ingredient) =>
            ingredientMatchesName(ingredient, normalizedName),
          );
          if (isDuplicate) return state;

          const customIngredient: Ingredient = {
            id: `custom_ingredient_${encodeURIComponent(normalizedName)}`,
            name: normalizedName,
            category: "other",
            isCustom: true,
          };

          return {
            customIngredients: uniqueValidByIdAndName([
              ...state.customIngredients,
              customIngredient,
            ]),
            selectedIngredients: uniqueValidByIdAndName([
              ...state.selectedIngredients,
              customIngredient,
            ]),
          };
        }),

      addRecognizedIngredients: (names) =>
        set((state) => {
          const normalizedNames = uniqueTrimmedNames(
            names.map(normalizeCustomIngredientName),
          );
          if (normalizedNames.length === 0) return state;

          const reusableIngredients = [
            ...ingredients,
            ...state.customIngredients,
            ...state.recentIngredients,
            ...state.selectedIngredients,
          ];
          const customIngredients = [...state.customIngredients];
          const selectedIngredients = [...state.selectedIngredients];

          for (const name of normalizedNames) {
            const existing = findIngredientByName(reusableIngredients, name);
            const ingredient: Ingredient = existing
              ? toIngredient(existing)
              : {
                  id: `custom_ingredient_${encodeURIComponent(name)}`,
                  name,
                  category: "other",
                  isCustom: true,
                };

            if (!existing) {
              reusableIngredients.push(ingredient);
              customIngredients.push(ingredient);
            }

            selectedIngredients.push(ingredient);
          }

          return {
            customIngredients: uniqueValidByIdAndName(customIngredients),
            selectedIngredients: uniqueValidByIdAndName(selectedIngredients),
          };
        }),

      removeCustomIngredient: (id) =>
        set((state) => ({
          customIngredients: state.customIngredients.filter((item) => item.id !== id),
          selectedIngredients: state.selectedIngredients.filter((item) => item.id !== id),
        })),

      toggleSeasoning: (seasoning) =>
        set((state) => {
          const selected = state.seasoningLibrary.selectedSeasonings;
          const exists = selected.some((item) => item.id === seasoning.id);
          return {
            seasoningLibrary: {
              ...state.seasoningLibrary,
              selectedSeasonings: exists
                ? selected.filter((item) => item.id !== seasoning.id)
                : [...selected, seasoning],
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      addCustomSeasoning: (name) =>
        set((state) => {
          const normalizedName = normalizeCustomSeasoningName(name);
          if (!normalizedName) return state;

          const allSeasonings = [
            ...seasonings,
            ...state.seasoningLibrary.customSeasonings,
          ];
          const isDuplicate = allSeasonings.some((seasoning) =>
            seasoningMatchesName(seasoning, normalizedName),
          );
          if (isDuplicate) return state;

          const id = `custom_${normalizedName}`;
          const customSeasoning: Seasoning = {
            id,
            name: normalizedName,
            category: "custom",
            isCustom: true,
          };

          return {
            seasoningLibrary: {
              customSeasonings: uniqueById([
                ...state.seasoningLibrary.customSeasonings,
                customSeasoning,
              ]),
              selectedSeasonings: uniqueById([
                ...state.seasoningLibrary.selectedSeasonings,
                customSeasoning,
              ]),
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      removeCustomSeasoning: (id) =>
        set((state) => ({
          seasoningLibrary: {
            customSeasonings: state.seasoningLibrary.customSeasonings.filter(
              (item) => item.id !== id,
            ),
            selectedSeasonings: state.seasoningLibrary.selectedSeasonings.filter(
              (item) => item.id !== id,
            ),
            updatedAt: new Date().toISOString(),
          },
        })),

      resetSeasoningsToDefault: () =>
        set((state) => ({
          seasoningLibrary: {
            ...state.seasoningLibrary,
            selectedSeasonings: defaultSeasonings,
            updatedAt: new Date().toISOString(),
          },
        })),

      clearSelectedSeasonings: () =>
        set((state) => ({
          seasoningLibrary: {
            ...state.seasoningLibrary,
            selectedSeasonings: [],
            updatedAt: new Date().toISOString(),
          },
        })),

      setPeopleCount: (count) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            peopleCount: Math.max(1, Math.min(12, count)),
          },
        })),

      setEnergyLevel: (energyLevel) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            energyLevel,
          },
        })),

      toggleTastePreference: (preference) =>
        set((state) => {
          const current = state.preferences.tastePreferences;
          const exists = current.includes(preference);
          let next = exists
            ? current.filter((item) => item !== preference)
            : [
                ...current.filter((item) => item !== "不挑，能吃就行"),
                preference,
              ];

          if (!exists && preference === "辣一点") {
            next = next.filter((item) => item !== "不能吃辣");
          }

          if (!exists && preference === "不能吃辣") {
            next = next.filter((item) => item !== "辣一点");
          }

          return {
            preferences: {
              ...state.preferences,
              tastePreferences: next.length > 0 ? next : ["不挑，能吃就行"],
            },
          };
        }),

      setUserPrompt: (userPrompt) => set({ userPrompt: userPrompt.slice(0, 200) }),

      setGeneratedRecipes: (generatedRecipes) => set({ generatedRecipes }),

      clearGeneratedRecipes: () => set({ generatedRecipes: [] }),

      clearGenerateRecipeError: () => set({ generateRecipeError: null }),

      generateRecipes: async (options) => {
        const baseRequest = get().buildGenerateRecipeRequest();
        const request = appendExtraPrompt(
          baseRequest,
          options?.extraPrompt,
        );
        const llmConfig = get().llmConfig;

        if (request.ingredients.length === 0) {
          set({ generateRecipeError: "先选点食材，再让模型凑菜谱。" });
          return false;
        }

        if (!llmConfig.baseUrl || !llmConfig.apiKey || !llmConfig.model) {
          set({ generateRecipeError: "请先完成模型配置。" });
          return false;
        }

        set({ generateRecipeError: null, isGeneratingRecipes: true });

        try {
          const recipes = await generateRecipesWithLlm(request, llmConfig, {
            previousUserRequest: baseRequest,
            previousRecipes: options?.previousRecipes,
            regenerationRequest: options?.extraPrompt,
          });
          set({
            generatedRecipes: recipes,
            generateRecipeError: null,
            isGeneratingRecipes: false,
          });
          return true;
        } catch (error) {
          set({
            generateRecipeError:
              error instanceof Error ? error.message : "生成失败，请稍后重试。",
            isGeneratingRecipes: false,
          });
          return false;
        }
      },

      setLlmConfig: (llmConfig) => set({ llmConfig: sanitizeLlmConfig(llmConfig) }),

      resetLlmConfig: () => set({ llmConfig: defaultLlmConfig }),

      buildGenerateRecipeRequest: () => {
        const state = get();
        return {
          ingredients: state.selectedIngredients
            .filter(hasValidName)
            .map((ingredient) => ingredient.name.trim()),
          seasonings: state.seasoningLibrary.selectedSeasonings
            .filter(hasValidName)
            .map((seasoning) => seasoning.name.trim()),
          peopleCount: state.preferences.peopleCount,
          energyLevel: state.preferences.energyLevel,
          tastePreferences: state.preferences.tastePreferences,
          userPrompt: state.userPrompt.trim() || undefined,
        };
      },
    }),
    {
      name: "fridge-cooking-storage",
      partialize: (state) => ({
        selectedIngredients: state.selectedIngredients,
        recentIngredients: state.recentIngredients,
        customIngredients: state.customIngredients,
        seasoningLibrary: state.seasoningLibrary,
        preferences: state.preferences,
        llmConfig: state.llmConfig,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CookingStore> | undefined;

        return {
          ...currentState,
          selectedIngredients: uniqueValidByIdAndName(
            persisted?.selectedIngredients ?? currentState.selectedIngredients,
          ),
          recentIngredients: uniqueValidByIdAndName(
            persisted?.recentIngredients ?? currentState.recentIngredients,
          ).slice(0, 20),
          customIngredients: uniqueValidByIdAndName(
            persisted?.customIngredients ?? currentState.customIngredients,
          ),
          seasoningLibrary: sanitizeSeasoningLibrary(
            persisted?.seasoningLibrary ?? currentState.seasoningLibrary,
          ),
          preferences: persisted?.preferences
            ? { ...currentState.preferences, ...persisted.preferences }
            : currentState.preferences,
          llmConfig: sanitizeLlmConfig(persisted?.llmConfig ?? currentState.llmConfig),
          userPrompt: "",
          generatedRecipes: [],
          isGeneratingRecipes: false,
          generateRecipeError: null,
        };
      },
    },
  ),
);
