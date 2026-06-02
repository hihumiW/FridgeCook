import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { AppTopBar } from "@/components/common/AppTopBar";
import { DeviceFrame } from "@/components/home/DeviceFrame";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { useCookingStore } from "@/stores/useCookingStore";
import type { LlmConfig } from "@/types";

function readFirstParam(
  searchParams: URLSearchParams,
  keys: readonly string[],
) {
  for (const key of keys) {
    const value = searchParams.get(key)?.trim();
    if (value) return value;
  }

  return "";
}

function readTemperature(searchParams: URLSearchParams) {
  const value = Number(searchParams.get("temperature"));
  if (!Number.isFinite(value)) return 0.3;
  return value;
}

function buildImportedConfig(searchParams: URLSearchParams): LlmConfig {
  return {
    baseUrl: readFirstParam(searchParams, ["baseUrl", "endpointUrl"]),
    apiKey: readFirstParam(searchParams, ["apiKey", "key"]),
    model: readFirstParam(searchParams, ["model"]),
    temperature: readTemperature(searchParams),
  };
}

function isCompleteConfig(config: LlmConfig) {
  return Boolean(config.baseUrl && config.apiKey && config.model);
}

export function LlmConfigImportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setLlmConfig = useCookingStore((state) => state.setLlmConfig);
  const importedConfig = useMemo(
    () => buildImportedConfig(searchParams),
    [searchParams],
  );
  const canImport = isCompleteConfig(importedConfig);

  useEffect(() => {
    if (!canImport) return;

    setLlmConfig(importedConfig);
    navigate("/", { replace: true });
  }, [canImport, importedConfig, navigate, setLlmConfig]);

  return (
    <DeviceFrame>
      <AppTopBar showReset={false} />

      <motion.div
        animate="animate"
        className="mt-6"
        initial="initial"
        variants={staggerContainer}
      >
        <motion.section
          className="rounded-[20px] border border-[#eeeae4] bg-white p-5 text-center shadow-[0_8px_26px_rgba(27,24,20,0.07)]"
          variants={staggerItem}
        >
          {canImport ? (
            <>
              <CheckCircle2
                className="mx-auto h-8 w-8 text-[#5d9d55]"
                strokeWidth={2.5}
              />
              <h1 className="mt-4 text-[20px] font-black text-[#151411]">
                正在导入模型配置
              </h1>
              <p className="mt-2 text-[12px] font-semibold leading-5 text-[#9b958d]">
                配置会保存到本机浏览器，稍后自动回到首页。
              </p>
            </>
          ) : (
            <>
              <AlertTriangle
                className="mx-auto h-8 w-8 text-[#c7763d]"
                strokeWidth={2.5}
              />
              <h1 className="mt-4 text-[20px] font-black text-[#151411]">
                导入链接缺少配置
              </h1>
              <p className="mt-2 text-[12px] font-semibold leading-5 text-[#9b958d]">
                链接里需要包含 baseUrl、apiKey 和 model。temperature 可选。
              </p>
              <div className="mt-5 flex gap-2">
                <Link
                  className="flex h-11 flex-1 items-center justify-center rounded-[14px] bg-[#f1eee8] text-[13px] font-bold text-[#5f594f]"
                  replace
                  to="/"
                >
                  回首页
                </Link>
                <Link
                  className="flex h-11 flex-1 items-center justify-center rounded-[14px] bg-[#111] text-[13px] font-bold text-white"
                  replace
                  to="/llm-config"
                >
                  手动配置
                </Link>
              </div>
            </>
          )}
        </motion.section>
      </motion.div>
    </DeviceFrame>
  );
}
