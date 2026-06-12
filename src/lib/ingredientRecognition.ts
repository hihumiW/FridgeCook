import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import type { LlmConfig } from "@/types";

const maxImageSizeBytes = 8 * 1024 * 1024;

export type RecognizedIngredient = {
  name: string;
  confidence?: number;
  note?: string;
};

export type IngredientRecognitionResponse = {
  ingredients: RecognizedIngredient[];
};

const ingredientRecognitionPrompt = `
你是一个冰箱食材识别助手。请只识别图片里可以作为做饭食材的物品。

要求：
1. 忽略餐具、锅具、包装袋、价格标签、品牌字样、背景杂物。
2. 如果看到的是调料瓶、酱料、饮料、保健品，不要作为食材返回。
3. 食材名称使用简体中文常用名，尽量短，例如“番茄”“鸡蛋”“西兰花”。
4. 如果无法确定具体品种，返回上位类目，例如“青菜”“菌菇”“鱼肉”。
5. 只返回 JSON，不要返回 Markdown、解释或额外文字。

JSON 格式：
{
  "ingredients": [
    { "name": "番茄", "confidence": 0.92, "note": "可选简短说明" }
  ]
}
`.trim();

export function isQwenVisionModel(config: LlmConfig) {
  const baseUrl = config.baseUrl.trim().toLocaleLowerCase();
  const model = config.model.trim().toLocaleLowerCase();

  if (!config.apiKey.trim() || !baseUrl || !model) return false;
  if (baseUrl.includes("deepseek.com") || model.includes("deepseek"))
    return false;

  const isQwen = model.includes("qwen") || model.includes("qvq");
  // const isVision =
  //   model.includes("vl") ||
  //   model.includes("vision") ||
  //   model.includes("omni") ||
  //   model.includes("qvq");

  return isQwen;
}

export function fileToDataUrl(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("请选择图片文件。");
  }

  if (file.size > maxImageSizeBytes) {
    throw new Error("图片太大了，请选择 8MB 以内的图片。");
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result !== "string") {
        reject(new Error("图片读取失败，请重试。"));
        return;
      }
      resolve(reader.result);
    });
    reader.addEventListener("error", () => {
      reject(new Error("图片读取失败，请重试。"));
    });
    reader.readAsDataURL(file);
  });
}

export async function recognizeIngredientsFromImage(
  file: File,
  llmConfig: LlmConfig,
): Promise<IngredientRecognitionResponse> {
  if (!isQwenVisionModel(llmConfig)) {
    throw new Error("当前模型暂不支持图片识别，请切换到 Qwen 视觉模型。");
  }

  const normalizedConfig = normalizeLlmConfig(llmConfig);
  if (!isValidUrl(normalizedConfig.baseUrl)) {
    throw new Error("Base URL 格式不正确。");
  }

  const imageDataUrl = await fileToDataUrl(file);
  const client = new OpenAI({
    apiKey: normalizedConfig.apiKey,
    baseURL: normalizedConfig.baseUrl,
    dangerouslyAllowBrowser: true,
  });
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: {
            url: imageDataUrl,
            detail: "low",
          },
        },
        {
          type: "text",
          text: ingredientRecognitionPrompt,
        },
      ],
    },
  ];

  try {
    const response = await client.chat.completions.create({
      model: normalizedConfig.model,
      temperature: 0.1,
      messages,
      response_format: { type: "json_object" },
    });
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("模型没有返回识别结果，请重试。");
    }

    return parseAndValidateIngredientRecognitionResponse(content);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("图片识别失败，请稍后重试。");
  }
}

export function parseAndValidateIngredientRecognitionResponse(
  content: string,
): IngredientRecognitionResponse {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("模型返回格式不稳定，请重试。");
  }

  if (!isRecord(parsed) || !Array.isArray(parsed.ingredients)) {
    throw new Error("模型返回格式不稳定，请重试。");
  }

  const seenNames = new Set<string>();
  const recognized = parsed.ingredients
    .map(normalizeRecognizedIngredient)
    .filter((item): item is RecognizedIngredient => Boolean(item))
    .filter((item) => {
      const key = item.name.toLocaleLowerCase();
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    })
    .slice(0, 30);

  if (recognized.length === 0) {
    throw new Error("没识别出可用食材，可以换张更清楚的照片试试。");
  }

  return { ingredients: recognized };
}

function normalizeRecognizedIngredient(
  value: unknown,
): RecognizedIngredient | null {
  if (!isRecord(value)) return null;

  const rawName = value.name;
  if (typeof rawName !== "string") return null;

  const name = rawName.trim().slice(0, 20);
  if (!name) return null;

  const ingredient: RecognizedIngredient = { name };
  const confidence = normalizeConfidence(value.confidence);
  const note =
    typeof value.note === "string" ? value.note.trim().slice(0, 40) : "";

  if (typeof confidence === "number") {
    ingredient.confidence = confidence;
  }
  if (note) {
    ingredient.note = note;
  }

  return ingredient;
}

function normalizeConfidence(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function normalizeLlmConfig(config: LlmConfig): LlmConfig {
  return {
    baseUrl: config.baseUrl.trim(),
    apiKey: config.apiKey.trim(),
    model: config.model.trim(),
    temperature: config.temperature,
  };
}

function isValidUrl(value: string) {
  try {
    new URL(value.trim());
    return true;
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
