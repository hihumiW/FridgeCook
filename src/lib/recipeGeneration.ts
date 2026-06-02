import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { ingredients, seasonings } from "@/data";
import recipeSystemPromptMarkdown from "@/lib/recipePrompt.md?raw";
import type {
  GenerateRecipeRequest,
  GenerateRecipeResponse,
  LlmConfig,
  Recipe,
  RecipeDifficulty,
} from "@/types";

const minDifficulty = 0;
const maxDifficulty = 5;
const recipeSystemPrompt = recipeSystemPromptMarkdown.trimEnd();

type GenerateRecipesWithLlmOptions = {
  previousUserRequest?: GenerateRecipeRequest;
  previousRecipes?: Recipe[];
  regenerationRequest?: string;
};

function isDeepSeekBaseUrl(baseUrl: string) {
  try {
    return new URL(baseUrl).hostname
      .toLocaleLowerCase()
      .includes("deepseek.com");
  } catch {
    return false;
  }
}

/**
 * 根据用户输入的 Base URL 和 Model， 禁用思考功能
 * @param {string} baseUrl 用户输入的地址
 * @param {string} modelName 用户输入的模型名
 * @param {boolean} disableThinking 是否需要禁用思考（比如基于精力值选项）
 */
function buildThinking(
  baseUrl: string,
  modelName: string,
  disableThinking = true,
) {
  if (!disableThinking) return {};

  const url = (baseUrl || "").toLowerCase();
  const model = (modelName || "").toLowerCase();

  // 1. 特征一：用户连接的是【阿里百炼平台】
  // 阿里百炼官方兼容端点通常包含 dashscope.aliyuncs.com
  if (url.includes("dashscope.aliyuncs.com")) {
    return { enable_thinking: false };
  }

  // 2. 特征二：用户连接的是【DeepSeek 官方平台】
  // 官方端点通常包含 api.deepseek.com
  if (url.includes("api.deepseek.com")) {
    return {
      extra_body: {
        thinking: { type: "disabled" },
      },
    };
  }

  // 3. 特征三：兜底策略（如果用户用了中转 API，比如 One-API/New-API 或自定义反代）
  // 此时 URL 被模糊了，我们只能死马当活马医，通过【模型名称】来瞎猜
  if (model.includes("qwen")) {
    // 猜它底层走的是阿里的规矩，或者兼容阿里的通义规范
    return { enable_thinking: false };
  }

  if (model.includes("deepseek")) {
    // 猜它走的是 DeepSeek 官方或主流中转的参数规范
    return {
      extra_body: {
        thinking: { type: "disabled" },
      },
    };
  }

  // 4. 如果完全认不出来（比如自定义开源模型），则不带任何特异性参数，避免请求直接报错 400
  return {};
}

export const recipeResponseJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["recipes"],
  properties: {
    recipes: {
      type: "array",
      minItems: 1,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "name",
          "estimatedTime",
          "difficulty",
          "servings",
          "usedIngredients",
          "usedSeasonings",
          "reason",
          "steps",
          "warnings",
          "substitutions",
        ],
        properties: {
          name: { type: "string" },
          estimatedTime: { type: "string" },
          difficulty: {
            type: "number",
            minimum: minDifficulty,
            maximum: maxDifficulty,
          },
          servings: { type: "number" },
          usedIngredients: { type: "array", items: { type: "string" } },
          usedSeasonings: { type: "array", items: { type: "string" } },
          reason: { type: "string" },
          steps: { type: "array", items: { type: "string" } },
          warnings: { type: "array", items: { type: "string" } },
          substitutions: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
} as const;

export function normalizeGenerateRecipeRequest(
  request: GenerateRecipeRequest,
): GenerateRecipeRequest {
  return {
    ingredients: uniqueTrimmed(request.ingredients),
    seasonings: uniqueTrimmed(request.seasonings),
    peopleCount: Math.max(1, Math.min(12, Math.round(request.peopleCount))),
    energyLevel: request.energyLevel,
    tastePreferences: uniqueTrimmed(
      request.tastePreferences,
    ) as GenerateRecipeRequest["tastePreferences"],
    userPrompt: request.userPrompt?.trim().slice(0, 200) || undefined,
  };
}

export function appendExtraPrompt(
  request: GenerateRecipeRequest,
  extraPrompt?: string,
): GenerateRecipeRequest {
  const normalizedExtraPrompt = extraPrompt?.trim().slice(0, 200);
  if (!normalizedExtraPrompt) return request;

  const promptParts = [
    request.userPrompt?.trim(),
    `本次重新生成补充要求：${normalizedExtraPrompt}`,
  ].filter(Boolean);

  return {
    ...request,
    userPrompt: promptParts.join("\n"),
  };
}

export function buildRecipeMessages(
  request: GenerateRecipeRequest,
  options: GenerateRecipesWithLlmOptions = {},
): ChatCompletionMessageParam[] {
  const previousRecipes = normalizePreviousRecipes(options.previousRecipes);
  const userMessage = {
    availableIngredients: request.ingredients,
    availableSeasonings: request.seasonings,
    peopleCount: request.peopleCount,
    energyLevel: request.energyLevel,
    tastePreferences: request.tastePreferences,
    userRequest: request.userPrompt ?? "",
    ...(previousRecipes.length > 0
      ? {
          regenerationContext: {
            previousUserRequest: normalizeGenerateRecipeRequest(
              options.previousUserRequest ?? request,
            ),
            previousRecipes,
            regenerationRequest: normalizeRegenerationRequest(
              options.regenerationRequest,
            ),
          },
        }
      : {}),
  };

  return [
    {
      role: "system",
      content: recipeSystemPrompt,
    },
    {
      role: "user",
      content: JSON.stringify(userMessage, null, 2),
    },
  ];
}

export async function generateRecipesWithLlm(
  request: GenerateRecipeRequest,
  llmConfig: LlmConfig,
  options: GenerateRecipesWithLlmOptions = {},
): Promise<Recipe[]> {
  const normalizedConfig = normalizeLlmConfig(llmConfig);
  if (
    !normalizedConfig.baseUrl ||
    !normalizedConfig.apiKey ||
    !normalizedConfig.model
  ) {
    throw new Error("请先完成模型配置。");
  }

  const normalizedRequest = normalizeGenerateRecipeRequest(request);
  if (normalizedRequest.ingredients.length === 0) {
    throw new Error("先选点食材，再让模型凑菜谱。");
  }

  if (!isValidUrl(normalizedConfig.baseUrl)) {
    throw new Error("Base URL 格式不正确。");
  }

  try {
    const client = new OpenAI({
      apiKey: normalizedConfig.apiKey,
      baseURL: normalizedConfig.baseUrl,
      dangerouslyAllowBrowser: true,
    });

    const response = await client.chat.completions.create({
      model: normalizedConfig.model,
      temperature: normalizedConfig.temperature,
      messages: buildRecipeMessages(normalizedRequest, options),
      response_format: buildResponseFormat(normalizedConfig.baseUrl),
      ...(buildThinking(
        normalizedConfig.baseUrl,
        normalizedConfig.model,
        true,
      ) as any),
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("模型没有返回菜谱内容，请重试。");
    }

    return parseAndValidateRecipeResponse(content, normalizedRequest);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("模型接口请求失败，请稍后重试。");
  }
}

function normalizePreviousRecipes(recipes?: Recipe[]) {
  if (!recipes?.length) return [];

  return recipes.slice(0, 5).map((recipe) => ({
    name: recipe.name,
    estimatedTime: recipe.estimatedTime,
    difficulty: recipe.difficulty,
    servings: recipe.servings,
    usedIngredients: recipe.usedIngredients,
    usedSeasonings: recipe.usedSeasonings,
    reason: recipe.reason,
    steps: recipe.steps,
    warnings: recipe.warnings,
    substitutions: recipe.substitutions,
  }));
}

function normalizeRegenerationRequest(value?: string) {
  return value?.trim().slice(0, 200) ?? "";
}

function buildResponseFormat(baseUrl: string) {
  if (isDeepSeekBaseUrl(baseUrl)) {
    return { type: "json_object" as const };
  }

  return {
    type: "json_schema" as const,
    json_schema: {
      name: "recipe_generation_response",
      strict: true,
      schema: recipeResponseJsonSchema,
    },
  };
}

export function parseAndValidateRecipeResponse(
  content: string,
  request: GenerateRecipeRequest,
): Recipe[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("模型返回格式不稳定，请重试。");
  }

  return validateRecipeResponse(parsed, request);
}

export function validateRecipeResponse(
  response: unknown,
  request: GenerateRecipeRequest,
): Recipe[] {
  if (!isRecord(response) || !Array.isArray(response.recipes)) {
    throw new Error("模型返回格式不稳定，请重试。");
  }

  const recipes = response.recipes
    .slice(0, 5)
    .map((item, index) => normalizeRecipe(item, index, request));

  if (recipes.length === 0) {
    throw new Error("模型没有生成可展示的菜谱，请重试。");
  }

  return ensureUniqueRecipeIds(recipes);
}

function normalizeRecipe(
  item: unknown,
  index: number,
  request: GenerateRecipeRequest,
): Recipe {
  if (!isRecord(item)) {
    throw new Error("模型返回格式不稳定，请重试。");
  }

  const name = readRequiredString(item, "name");
  const estimatedTime = readEstimatedTime(item.estimatedTime);
  const difficulty = readDifficulty(item.difficulty);
  const servings = readRequiredNumber(item, "servings");
  const { usedIngredients, usedSeasonings } = normalizeRecipeItemsByCategory(
    readStringArray(item.usedIngredients),
    readStringArray(item.usedSeasonings),
  );
  const reason = readRequiredString(item, "reason");
  const id = readOptionalString(item.id) || slugifyRecipeId(name, index);

  return {
    id,
    name,
    estimatedTime,
    difficulty,
    servings,
    usedIngredients,
    usedSeasonings,
    reason,
    steps: readStringArray(item.steps),
    warnings: readStringArray(item.warnings),
    substitutions: readStringArray(item.substitutions),
    riskFlags: buildRiskFlags(usedIngredients, usedSeasonings, request),
  };
}

function normalizeRecipeItemsByCategory(
  rawIngredients: string[],
  rawSeasonings: string[],
) {
  const usedIngredients: string[] = [];
  const usedSeasonings: string[] = [];

  for (const item of rawIngredients) {
    if (matchesKnownSeasoning(item)) {
      usedSeasonings.push(item);
    } else {
      usedIngredients.push(item);
    }
  }

  for (const item of rawSeasonings) {
    if (matchesKnownIngredient(item)) {
      usedIngredients.push(item);
    } else {
      usedSeasonings.push(item);
    }
  }

  return {
    usedIngredients: uniqueTrimmed(usedIngredients),
    usedSeasonings: uniqueTrimmed(usedSeasonings),
  };
}

function matchesKnownIngredient(name: string) {
  return ingredients.some((item) => matchesName(item, name));
}

function matchesKnownSeasoning(name: string) {
  return seasonings.some((item) => matchesName(item, name));
}

function matchesName(
  item: { name: string; aliases?: readonly string[] },
  name: string,
) {
  const normalizedName = normalizeForCompare(name);
  return (
    normalizeForCompare(item.name) === normalizedName ||
    item.aliases?.some((alias) => normalizeForCompare(alias) === normalizedName)
  );
}

function buildRiskFlags(
  usedIngredients: string[],
  usedSeasonings: string[],
  request: GenerateRecipeRequest,
) {
  const availableIngredients = new Set(
    request.ingredients.map(normalizeForCompare),
  );
  const availableSeasonings = new Set(
    request.seasonings.map(normalizeForCompare),
  );
  const extraIngredients = usedIngredients.filter(
    (item) => !availableIngredients.has(normalizeForCompare(item)),
  );
  const extraSeasonings = usedSeasonings.filter(
    (item) => !availableSeasonings.has(normalizeForCompare(item)),
  );
  const riskFlags: string[] = [];

  if (extraIngredients.length > 0) {
    riskFlags.push(`可能用到了未选择的食材：${extraIngredients.join("、")}`);
  }

  if (extraSeasonings.length > 0) {
    riskFlags.push(`可能用到了未选择的调料：${extraSeasonings.join("、")}`);
  }

  return riskFlags;
}

function ensureUniqueRecipeIds(recipes: Recipe[]) {
  const seen = new Map<string, number>();
  return recipes.map((recipe, index) => {
    const fallbackId = slugifyRecipeId(recipe.name, index);
    const baseId = recipe.id.trim() || fallbackId;
    const count = seen.get(baseId) ?? 0;
    seen.set(baseId, count + 1);
    return {
      ...recipe,
      id: count === 0 ? baseId : `${baseId}-${count + 1}`,
    };
  });
}

function readRequiredString(item: Record<string, unknown>, key: string) {
  const value = item[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("模型返回格式不稳定，请重试。");
  }
  return value.trim();
}

function readOptionalString(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function readRequiredNumber(item: Record<string, unknown>, key: string) {
  const value = item[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("模型返回格式不稳定，请重试。");
  }
  return Math.max(1, Math.round(value));
}

function readEstimatedTime(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return `${Math.max(1, Math.round(value))} 分钟`;
  }

  throw new Error("模型返回格式不稳定，请重试。");
}

function readDifficulty(value: unknown): RecipeDifficulty {
  if (typeof value === "number" && Number.isFinite(value)) {
    return toDifficultyLevel(value);
  }

  if (typeof value === "string" && value.trim()) {
    const normalizedValue = value.trim().toLocaleLowerCase();
    const numberValue = Number(normalizedValue);
    if (Number.isFinite(numberValue)) {
      return toDifficultyLevel(numberValue);
    }
  }

  return 3;
}

function toDifficultyLevel(value: number): RecipeDifficulty {
  return Math.max(
    minDifficulty,
    Math.min(maxDifficulty, Math.round(value)),
  ) as RecipeDifficulty;
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return uniqueTrimmed(
    value.filter((item): item is string => typeof item === "string"),
  );
}

function uniqueTrimmed(items: readonly string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const value = item.trim();
    const key = normalizeForCompare(value);
    if (!value || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }

  return result;
}

function normalizeForCompare(value: string) {
  return value.trim().toLocaleLowerCase();
}

function normalizeLlmConfig(config: LlmConfig): LlmConfig {
  return {
    baseUrl: config.baseUrl.trim(),
    apiKey: config.apiKey.trim(),
    model: config.model.trim(),
    temperature: clampTemperature(config.temperature),
  };
}

function clampTemperature(value: number) {
  if (!Number.isFinite(value)) return 0.3;
  return Math.max(0.1, Math.min(0.8, Number(value.toFixed(1))));
}

function isValidUrl(value: string) {
  try {
    new URL(value.trim());
    return true;
  } catch {
    return false;
  }
}

function slugifyRecipeId(name: string, index: number) {
  const normalizedName = name
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{Letter}\p{Number}-]+/gu, "");

  return normalizedName || `recipe-${index + 1}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function toGenerateRecipeResponse(
  recipes: Recipe[],
): GenerateRecipeResponse {
  return { recipes };
}
