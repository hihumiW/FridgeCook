import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { ingredients, seasonings } from "@/data";
import type {
  GenerateRecipeRequest,
  GenerateRecipeResponse,
  LlmConfig,
  Recipe,
  RecipeDifficulty,
} from "@/types";

const minDifficulty = 0;
const maxDifficulty = 5;

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

// 由于deepseek 不支持schema, 因此单独为它补充一套校验规则，放在提示词里，让模型自己遵守。
const deepSeekJsonShapeRules = [
  "JSON 顶层必须是一个对象，格式如下：",
  "{",
  '  "recipes": [',
  "    {",
  '      "name": "string",',
  '      "estimatedTime": "string，例如 15 分钟",',
  '      "difficulty": 1,',
  '      "servings": 2,',
  '      "usedIngredients": ["string"],',
  '      "usedSeasonings": ["string"],',
  '      "reason": "string",',
  '      "steps": ["string"],',
  '      "warnings": ["string"],',
  '      "substitutions": ["string"]',
  "    }",
  "  ]",
  "}",
  "字段要求：",
  "- recipes 必须是数组，至少 1 个，最多 5 个。",
  '- estimatedTime 必须是字符串，例如 "10 分钟"，不要只返回数字。',
  "- difficulty 必须是 0 到 5 的数字，0 最简单，5 最困难。",
  "- usedIngredients、usedSeasonings、steps、warnings、substitutions 必须是字符串数组。",
  "- substitutions 必须是字符串数组，不要返回对象。",
  "- warnings 是翻车提醒：提醒火候、时间、口感、调味或容易失败的点。没有则返回空数组。",
  "- substitutions 是可替代方案：说明缺少某个食材/调料时可以怎么替换，或哪些可以省略。没有则返回空数组。",
  "- 不要添加 schema 之外的字段。",
  "合法输出示例：",
  "{",
  '  "recipes": [',
  "    {",
  '      "name": "番茄炒蛋",',
  '      "estimatedTime": "10 分钟",',
  '      "difficulty": 1,',
  '      "servings": 2,',
  '      "usedIngredients": ["番茄", "鸡蛋"],',
  '      "usedSeasonings": ["食用油", "盐"],',
  '      "reason": "快手、下饭，适合现在的食材。",',
  '      "steps": ["番茄切块，鸡蛋打散。", "热锅放油，先炒鸡蛋盛出。", "下番茄炒出汁，倒回鸡蛋，加盐调味。"],',
  '      "warnings": ["番茄要炒出汁再放鸡蛋，否则味道会偏寡。"],',
  '      "substitutions": ["没有白糖可以不放，番茄偏酸时再少量加一点。"]',
  "    }",
  "  ]",
  "}",
].join("\n");

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
  options: { includeJsonShapeRules?: boolean } = {},
): ChatCompletionMessageParam[] {
  const systemRules = [
    "你是一个精通各种菜系的大厨，负责根据用户已有食材、调料、人数、精力值和偏好，生成今晚可以做的菜。",
    "availableIngredients 是可用食材池，不是每道菜必须全部使用的清单。",
    "availableSeasonings 是可用调料池，不是每道菜必须全部使用的清单。",
    "你应该从可用食材池和调料池中挑选合适的子集进行组合，每道菜只使用适合它的食材和调料。",
    "不要为了覆盖所有食材而把它们硬塞进一道菜，也不要把所有调料都列进每道菜。",
    "如果可用食材较多，优先生成多道互补的菜，形成一顿饭的组合，例如主菜、快手菜、素菜、汤菜等。",
    "如果可用食材数量 >= 5，通常返回 2 到 4 道菜；如果可用食材数量 >= 8，通常返回 3 到 5 道菜。",
    "只有在食材很少，或用户明确要求简单、少洗锅、一锅出时，才返回 1 道菜。",
    "除非用户明确要求一锅出或少洗锅，否则不要默认生成一锅熟、乱炖、杂烩类菜。",
    "请至少返回 1 道菜，最多返回 5 道菜；根据食材数量、调料数量、人数和精力值自行决定数量。",
    "不要为了凑数量而引入用户没有的食材或调料。",
    "如果确实使用了额外食材或调料，必须在 warnings 中明确提醒。",
    "如果 tastePreferences 与 userPrompt 存在冲突，以 userPrompt 为准。",
    "步骤要尽可能详细, 步骤中包含用量、时间等关键信息、适合普通家庭厨房执行。",
    "difficulty 是 0 到 5 的数字，代表难度等级：0 最简单，5 最困难。",
    "warnings 是翻车提醒：写做这道菜最容易失败、口感变差或需要注意的地方。",
    "substitutions 是可替代方案：写缺少某个食材/调料时可以怎么替换，或可以省略什么。",
    "你必须只输出 JSON，不要输出 Markdown 或额外解释。",
  ];

  if (options.includeJsonShapeRules) {
    systemRules.push(deepSeekJsonShapeRules);
  } else {
    systemRules.push(
      'JSON 顶层结构必须是 {"recipes": [...]}，recipes 中的每个对象必须包含 name、estimatedTime、difficulty、servings、usedIngredients、usedSeasonings、reason、steps、warnings、substitutions。',
    );
  }

  return [
    {
      role: "system",
      content: systemRules.join("\n"),
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          availableIngredients: request.ingredients,
          availableSeasonings: request.seasonings,
          peopleCount: request.peopleCount,
          energyLevel: request.energyLevel,
          tastePreferences: request.tastePreferences,
          userRequest: request.userPrompt ?? "",
        },
        null,
        2,
      ),
    },
  ];
}

export async function generateRecipesWithLlm(
  request: GenerateRecipeRequest,
  llmConfig: LlmConfig,
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
      messages: buildRecipeMessages(normalizedRequest, {
        includeJsonShapeRules: isDeepSeekBaseUrl(normalizedConfig.baseUrl),
      }),
      response_format: buildResponseFormat(normalizedConfig.baseUrl),
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

function isDeepSeekBaseUrl(baseUrl: string) {
  try {
    return new URL(baseUrl).hostname
      .toLocaleLowerCase()
      .includes("deepseek.com");
  } catch {
    return false;
  }
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
