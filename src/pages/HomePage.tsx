import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Settings } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { DeviceFrame } from "@/components/home/DeviceFrame";
import { EnergyCard } from "@/components/home/EnergyCard";
import { HomeIconButton } from "@/components/home/HomeIconButton";
import { PeopleStepperMock } from "@/components/home/PeopleStepperMock";
import { PreferenceChip } from "@/components/home/PreferenceChip";
import { PromptBoxMock } from "@/components/home/PromptBoxMock";
import { RecipeGeneratingOverlay } from "@/components/home/RecipeGeneratingOverlay";
import { SummaryCard } from "@/components/home/SummaryCard";
import { SummaryItemPreview } from "@/components/home/SummaryItemPreview";
import {
  modalBackdropVariants,
  modalPanelVariants,
  motionTapProps,
  staggerContainer,
  staggerItem,
} from "@/lib/motion";
import { useCookingStore } from "@/stores/useCookingStore";
import type { EnergyLevel, TastePreference } from "@/types";

const energyOptions: {
  value: EnergyLevel;
  icon: string;
  title: string;
  subtitle: string;
}[] = [
  {
    value: "quick_5min",
    icon: "⚡",
    title: "快饿死了",
    subtitle: "10 分钟糊弄",
  },
  {
    value: "normal_15min",
    icon: "😊",
    title: "还有口气",
    subtitle: "30 分钟正常做",
  },
  { value: "full_energy", icon: "⭐", title: "精力充沛", subtitle: "折腾一下" },
];

const tasteOptions: TastePreference[] = [
  "清淡",
  "辣一点",
  "不能吃辣",
  "重口味",
  "少油",
  "不挑，能吃就行",
];

const MotionButton = motion.button;

export function HomePage() {
  const navigate = useNavigate();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const {
    clearGeneratedRecipes,
    clearSelectedIngredients,
    clearSelectedSeasonings,
    generateRecipeError,
    generateRecipes,
    isGeneratingRecipes,
    selectedIngredients,
    seasoningLibrary,
    preferences,
    userPrompt,
    setPeopleCount,
    setEnergyLevel,
    toggleTastePreference,
    setUserPrompt,
    rememberSelectedIngredients,
  } = useCookingStore();

  const validSelectedIngredients = selectedIngredients.filter((item) =>
    item.name?.trim(),
  );
  const validSelectedSeasonings = seasoningLibrary.selectedSeasonings.filter(
    (item) => item.name?.trim(),
  );
  const ingredientPreview = validSelectedIngredients;
  const seasoningPreview = validSelectedSeasonings;

  async function handleGenerate() {
    if (validSelectedIngredients.length === 0 || isGeneratingRecipes) return;

    const success = await generateRecipes();
    if (!success) return;

    rememberSelectedIngredients();
    navigate("/results");
  }

  function handleConfirmReset() {
    clearSelectedIngredients();
    clearSelectedSeasonings();
    clearGeneratedRecipes();
    setIsResetConfirmOpen(false);
  }

  return (
    <DeviceFrame>
      <motion.div
        animate="animate"
        initial="initial"
        variants={staggerContainer}
      >
        <motion.div
          className="flex items-center justify-between px-1"
          variants={staggerItem}
        >
          <HomeIconButton label="模型配置" to="/llm-config">
            <Settings className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </HomeIconButton>
          <HomeIconButton
            label="重新开始"
            onClick={() => setIsResetConfirmOpen(true)}
          >
            <RotateCcw className="h-[18px] w-[18px]" strokeWidth={2.4} />
          </HomeIconButton>
        </motion.div>

        <motion.header className="mt-7 px-1" variants={staggerItem}>
          <h1 className="text-[28px] font-black leading-9 tracking-normal text-[#151411]">
            今晚吃什么？
          </h1>
          <p className="mt-2 text-[13px] font-semibold text-[#969188]">
            点几下，看看这些东西能不能凑一顿。
          </p>
        </motion.header>

        <motion.div className="mt-7 space-y-3.5" variants={staggerItem}>
          <Link
            aria-label="进入本次食材选择页"
            className="block"
            to="/ingredients"
          >
            <SummaryCard
              title="本次食材"
              subtitle={`已选 ${validSelectedIngredients.length} 种`}
            >
              {ingredientPreview.length > 0 ? (
                ingredientPreview.map((item) => (
                  <SummaryItemPreview
                    emoji={item.emoji}
                    key={item.id}
                    name={item.name}
                  />
                ))
              ) : (
                <span className="text-[12px] font-semibold text-[#aaa39a]">
                  还没选食材
                </span>
              )}
            </SummaryCard>
          </Link>

          <Link
            aria-label="进入调料库管理页"
            className="block"
            to="/seasonings"
          >
            <SummaryCard
              title="我的调料库"
              subtitle={`已保存 ${validSelectedSeasonings.length} 种`}
            >
              {seasoningPreview.length > 0 ? (
                seasoningPreview.map((item) => (
                  <SummaryItemPreview
                    emoji={item.emoji}
                    key={item.id}
                    name={item.name}
                  />
                ))
              ) : (
                <span className="text-[12px] font-semibold text-[#aaa39a]">
                  还没设置调料
                </span>
              )}
            </SummaryCard>
          </Link>

          <PeopleStepperMock
            value={preferences.peopleCount}
            onChange={setPeopleCount}
          />
        </motion.div>

        <motion.section className="mt-6 space-y-3" variants={staggerItem}>
          <h2 className="px-1 text-[15px] font-extrabold text-[#1b1a17]">
            你的精力状态
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {energyOptions.map((option) => (
              <EnergyCard
                icon={option.icon}
                key={option.value}
                onClick={() => setEnergyLevel(option.value)}
                selected={preferences.energyLevel === option.value}
                subtitle={option.subtitle}
                title={option.title}
              />
            ))}
          </div>
        </motion.section>

        <motion.section className="mt-7 space-y-3" variants={staggerItem}>
          <h2 className="px-1 text-[15px] font-extrabold text-[#1b1a17]">
            口味偏好
            <span className="ml-2 text-[12px] font-bold text-[#9d968d]">
              （可多选）
            </span>
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {tasteOptions.map((option) => (
              <PreferenceChip
                key={option}
                onClick={() => toggleTastePreference(option)}
                selected={preferences.tastePreferences.includes(option)}
              >
                {option === "辣一点"
                  ? "🌶️ 辣一点"
                  : option === "不挑，能吃就行"
                    ? "🥕 不挑，能吃就行"
                    : option}
              </PreferenceChip>
            ))}
          </div>
        </motion.section>

        <motion.div className="mt-7" variants={staggerItem}>
          <PromptBoxMock value={userPrompt} onChange={setUserPrompt} />
        </motion.div>

        <motion.footer className="mt-5 space-y-3" variants={staggerItem}>
          <MotionButton
            className="flex h-[52px] w-full items-center justify-center rounded-[18px] bg-[#111] text-[16px] font-bold text-white shadow-[0_12px_24px_rgba(0,0,0,0.18)] transition-shadow hover:shadow-[0_14px_28px_rgba(0,0,0,0.22)] disabled:cursor-not-allowed disabled:bg-[#c8c1b8] disabled:shadow-none"
            disabled={
              validSelectedIngredients.length === 0 || isGeneratingRecipes
            }
            onClick={handleGenerate}
            type="button"
            {...motionTapProps}
          >
            {validSelectedIngredients.length === 0
              ? "先选点食材"
              : isGeneratingRecipes
                ? "正在凑菜谱"
                : "用这些凑一顿"}
          </MotionButton>
          {generateRecipeError ? (
            <p className="rounded-[14px] border border-[#f1d1cc] bg-[#fff3f1] px-3 py-2 text-center text-[12px] font-semibold leading-5 text-[#bf4b3e]">
              {generateRecipeError}
            </p>
          ) : null}
          <p className="text-center text-[12px] font-semibold text-[#aaa39a]">
            没思路？先选点食材再说吧～
          </p>
        </motion.footer>
      </motion.div>

      <AnimatePresence>
        {isGeneratingRecipes ? <RecipeGeneratingOverlay /> : null}

        {isResetConfirmOpen ? (
          <motion.div
            animate="animate"
            className="fixed inset-0 z-30 flex items-end justify-center bg-black/20 px-4 pb-[calc(18px+env(safe-area-inset-bottom))] sm:items-center sm:pb-0"
            exit="exit"
            initial="initial"
            variants={modalBackdropVariants}
          >
            <motion.section
              className="w-full max-w-[398px] rounded-[22px] border border-[#eeeae4] bg-[#fbfaf8] p-4 shadow-[0_18px_48px_rgba(22,20,18,0.18)]"
              variants={modalPanelVariants}
            >
              <h2 className="text-[17px] font-black text-[#151411]">
                清空本次选择？
              </h2>
              <p className="mt-2 text-[12px] font-semibold leading-5 text-[#9b958d]">
                会清空当前已选食材和已选调料，调料候选和自定义项会保留。
              </p>

              <div className="mt-5 flex gap-2">
                <motion.button
                  className="h-11 flex-1 rounded-[14px] bg-[#f1eee8] text-[14px] font-bold text-[#5f594f]"
                  onClick={() => setIsResetConfirmOpen(false)}
                  type="button"
                  {...motionTapProps}
                >
                  取消
                </motion.button>
                <motion.button
                  className="h-11 flex-1 rounded-[14px] bg-[#111] text-[14px] font-bold text-white"
                  onClick={handleConfirmReset}
                  type="button"
                  {...motionTapProps}
                >
                  确认清空
                </motion.button>
              </div>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </DeviceFrame>
  );
}
