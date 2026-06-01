import { motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, RotateCcw, TestTube2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppTopBar } from "@/components/common/AppTopBar";
import { DeviceFrame } from "@/components/home/DeviceFrame";
import {
  motionTapProps,
  smallMotionTapProps,
  staggerContainer,
  staggerItem,
} from "@/lib/motion";
import { useCookingStore } from "@/stores/useCookingStore";
import type { LlmConfig } from "@/types";

type TestStatus = "idle" | "testing" | "success" | "warning" | "error";

const emptyConfig: LlmConfig = {
  baseUrl: "",
  apiKey: "",
  model: "",
  temperature: 0.3,
};

const statusClassNames: Record<TestStatus, string> = {
  idle: "border-[#eee9e2] bg-white text-[#81796f]",
  testing: "border-[#e6dfd5] bg-[#f8f5ef] text-[#81796f]",
  success: "border-[#d8ecd4] bg-[#f4fbf2] text-[#3c7b35]",
  warning: "border-[#f0e1ba] bg-[#fff9e9] text-[#9a6a1e]",
  error: "border-[#f1d1cc] bg-[#fff3f1] text-[#bf4b3e]",
};

function trimConfig(config: LlmConfig): LlmConfig {
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

function joinBaseUrl(baseUrl: string, path: string) {
  try {
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    const parsedUrl = new URL(`${baseUrl.trim().replace(/\/+$/, "")}/${normalizedPath}`);
    return parsedUrl.toString();
  } catch {
    return null;
  }
}

function modelExistsInResponse(data: unknown, model: string) {
  if (!data || typeof data !== "object" || !("data" in data)) return null;

  const models = (data as { data?: unknown }).data;
  if (!Array.isArray(models)) return null;

  return models.some((item) => {
    if (!item || typeof item !== "object" || !("id" in item)) return false;
    return (item as { id?: unknown }).id === model;
  });
}

type ConfigFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "password" | "text";
  action?: React.ReactNode;
};

function ConfigField({
  action,
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: ConfigFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="px-1 text-[13px] font-extrabold text-[#1b1a17]">
        {label}
      </span>
      <div className="flex h-[48px] items-center gap-2 rounded-[16px] border border-[#ece7df] bg-white px-3.5 shadow-[0_7px_22px_rgba(27,24,20,0.055)] transition-[border-color,box-shadow] focus-within:border-[#8dcf87] focus-within:shadow-[0_10px_26px_rgba(91,157,85,0.14)] focus-within:ring-2 focus-within:ring-[#dff2dc]">
        <input
          className="min-w-0 flex-1 bg-transparent text-[12px] font-semibold text-[#4f4942] outline-none placeholder:text-[#b8b2a9]"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          value={value}
        />
        {action}
      </div>
    </label>
  );
}

export function LlmConfigPage() {
  const { llmConfig, resetLlmConfig, setLlmConfig } = useCookingStore();
  const [draftConfig, setDraftConfig] = useState<LlmConfig>(llmConfig);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testMessage, setTestMessage] = useState("");
  const normalizedConfig = useMemo(
    () => trimConfig(draftConfig),
    [draftConfig],
  );
  const canUseActions = Boolean(
    normalizedConfig.baseUrl &&
    normalizedConfig.apiKey &&
    normalizedConfig.model,
  );

  useEffect(() => {
    setDraftConfig(llmConfig);
  }, [llmConfig]);

  function updateDraft(key: keyof LlmConfig, value: string) {
    setDraftConfig((current) => ({ ...current, [key]: value }));
    setSaveMessage("");
    setTestStatus("idle");
    setTestMessage("");
  }

  function updateTemperature(value: string) {
    setDraftConfig((current) => ({
      ...current,
      temperature: clampTemperature(Number(value)),
    }));
    setSaveMessage("");
    setTestStatus("idle");
    setTestMessage("");
  }

  function handleSave() {
    if (!canUseActions) {
      setSaveMessage("先把 Base URL、API Key 和模型名都填上。");
      return;
    }

    setLlmConfig(normalizedConfig);
    setSaveMessage("配置已保存到本机浏览器。");
  }

  function handleReset() {
    resetLlmConfig();
    setDraftConfig(emptyConfig);
    setShowApiKey(false);
    setSaveMessage("配置已清空。");
    setTestStatus("idle");
    setTestMessage("");
  }

  async function handleTestConnection() {
    if (!canUseActions || testStatus === "testing") return;

    const modelsEndpoint = joinBaseUrl(normalizedConfig.baseUrl, "/models");
    if (!modelsEndpoint) {
      setTestStatus("error");
      setTestMessage("Base URL 格式不正确，例如 https://api.openai.com/v1。");
      return;
    }

    setTestStatus("testing");
    setTestMessage("正在探测模型列表接口……");

    try {
      const response = await fetch(modelsEndpoint, {
        headers: {
          Authorization: `Bearer ${normalizedConfig.apiKey}`,
        },
      });

      if (!response.ok) {
        setTestStatus("error");
        setTestMessage(`轻量探测失败，接口返回 ${response.status}。`);
        return;
      }

      let modelExists: boolean | null = null;

      try {
        const data: unknown = await response.json();
        modelExists = modelExistsInResponse(data, normalizedConfig.model);
      } catch {
        modelExists = null;
      }

      if (modelExists === false) {
        setTestStatus("warning");
        setTestMessage("连接正常，但未在模型列表中找到该模型。");
        return;
      }

      setTestStatus("success");
      setTestMessage(
        modelExists
          ? "连接正常，模型可用。"
          : "连接正常，但未能读取模型列表详情。",
      );
    } catch {
      setTestStatus("error");
      setTestMessage(
        "轻量探测失败，可检查接口是否支持模型列表或是否允许浏览器跨域访问。",
      );
    }
  }

  return (
    <DeviceFrame>
      <AppTopBar showReset={false} />

      <motion.div
        animate="animate"
        initial="initial"
        variants={staggerContainer}
      >
        <motion.header className="mt-6 px-1" variants={staggerItem}>
          <h1 className="text-[24px] font-black leading-8 tracking-normal text-[#151411]">
            模型配置
          </h1>
          <p className="mt-2 text-[12px] font-semibold leading-5 text-[#9b958d]">
            这些配置只保存在本机浏览器，用于从前端直接连接你的 LLM 接口。
          </p>
        </motion.header>

        <motion.section className="mt-6 space-y-4" variants={staggerItem}>
          <ConfigField
            label="Base URL"
            onChange={(value) => updateDraft("baseUrl", value)}
            placeholder="https://api.openai.com/v1"
            value={draftConfig.baseUrl}
          />
          <ConfigField
            action={
              <motion.button
                aria-label={showApiKey ? "隐藏 API Key" : "显示 API Key"}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f3f0eb] text-[#766f65] transition-colors hover:bg-[#ece8df]"
                onClick={() => setShowApiKey((current) => !current)}
                type="button"
                {...smallMotionTapProps}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4" strokeWidth={2.3} />
                ) : (
                  <Eye className="h-4 w-4" strokeWidth={2.3} />
                )}
              </motion.button>
            }
            label="API Key"
            onChange={(value) => updateDraft("apiKey", value)}
            placeholder="sk-..."
            type={showApiKey ? "text" : "password"}
            value={draftConfig.apiKey}
          />
          <ConfigField
            label="Model"
            onChange={(value) => updateDraft("model", value)}
            placeholder="gpt-4.1-mini"
            value={draftConfig.model}
          />
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[13px] font-extrabold text-[#1b1a17]">
                Temperature
              </h2>
              <span className="rounded-full bg-[#f1eee8] px-2.5 py-1 text-[12px] font-bold text-[#5f594f]">
                {draftConfig.temperature.toFixed(1)}
              </span>
            </div>
            <div className="rounded-[16px] border border-[#ece7df] bg-white px-4 py-3 shadow-[0_7px_22px_rgba(27,24,20,0.055)]">
              <input
                aria-label="Temperature"
                className="h-2 w-full accent-[#111]"
                max={0.8}
                min={0.1}
                onChange={(event) => updateTemperature(event.target.value)}
                step={0.1}
                type="range"
                value={draftConfig.temperature}
              />
              <div className="mt-2 flex justify-between text-[11px] font-semibold text-[#aaa39a]">
                <span>更稳定</span>
                <span>更发散</span>
              </div>
            </div>
            <p className="px-1 text-[12px] font-semibold leading-5 text-[#9b958d]">
              数值越低，模型越稳定、重复性更高；数值越高，结果越有变化，但也更容易跑偏。
            </p>
          </section>
        </motion.section>

        {saveMessage ? (
          <motion.div
            className="mt-5 flex items-center gap-2 px-1 text-[12px] font-semibold text-[#6b9b5f]"
            variants={staggerItem}
          >
            <CheckCircle2 className="h-4 w-4" strokeWidth={2.4} />
            <span>{saveMessage}</span>
          </motion.div>
        ) : null}

        <motion.footer className="mt-6 space-y-3 pb-2" variants={staggerItem}>
          <motion.button
            className="h-[52px] w-full rounded-[18px] bg-[#111] text-[16px] font-bold text-white shadow-[0_12px_24px_rgba(0,0,0,0.18)] transition-shadow hover:shadow-[0_14px_28px_rgba(0,0,0,0.22)] disabled:cursor-not-allowed disabled:bg-[#c8c1b8] disabled:shadow-none"
            disabled={!canUseActions}
            onClick={handleSave}
            type="button"
            {...motionTapProps}
          >
            保存配置
          </motion.button>

          <div className="grid grid-cols-2 gap-2.5">
            <motion.button
              className="flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#f1eee8] text-[13px] font-bold text-[#5f594f] disabled:cursor-not-allowed disabled:text-[#b5aea4]"
              disabled={!canUseActions || testStatus === "testing"}
              onClick={handleTestConnection}
              type="button"
              {...motionTapProps}
            >
              <TestTube2 className="h-4 w-4" strokeWidth={2.4} />
              {testStatus === "testing" ? "测试中" : "连通性测试"}
            </motion.button>
            <motion.button
              className="flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#fff0ed] text-[13px] font-bold text-[#c65b4c]"
              onClick={handleReset}
              type="button"
              {...motionTapProps}
            >
              <RotateCcw className="h-4 w-4" strokeWidth={2.4} />
              重置配置
            </motion.button>
          </div>

          {testMessage ? (
            <motion.div
              className={`rounded-[16px] border px-4 py-3 text-[12px] font-semibold leading-5 ${statusClassNames[testStatus]}`}
              variants={staggerItem}
            >
              {testMessage}
            </motion.div>
          ) : null}
        </motion.footer>
      </motion.div>
    </DeviceFrame>
  );
}
