import { motion } from "framer-motion";
import { Grip, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

import { DeviceFrame } from "@/components/home/DeviceFrame";
import { EnergyCard } from "@/components/home/EnergyCard";
import { HomeIconButton } from "@/components/home/HomeIconButton";
import { PeopleStepperMock } from "@/components/home/PeopleStepperMock";
import { PreferenceChip } from "@/components/home/PreferenceChip";
import { PromptBoxMock } from "@/components/home/PromptBoxMock";
import { SummaryCard } from "@/components/home/SummaryCard";
import { SummaryItemPreview } from "@/components/home/SummaryItemPreview";
import { motionTapProps, staggerContainer, staggerItem } from "@/lib/motion";
import { useCookingStore } from "@/stores/useCookingStore";
import type { EnergyLevel, TastePreference } from "@/types";

const energyOptions: {
  value: EnergyLevel;
  icon: string;
  title: string;
  subtitle: string;
}[] = [
  { value: "quick_5min", icon: "⚡", title: "快饿死了", subtitle: "5 分钟糊弄" },
  { value: "normal_15min", icon: "😊", title: "还有口气", subtitle: "15 分钟正常做" },
  { value: "full_energy", icon: "⭐", title: "精力充沛", subtitle: "折腾一下" },
];

const tasteOptions: TastePreference[] = [
  "清淡",
  "辣一点",
  "不能吃辣",
  "重口味",
  "热乎汤菜",
  "下饭菜",
  "少油",
  "不挑，能吃就行",
];

const MotionLink = motion.create(Link);

export function HomePage() {
  const {
    selectedIngredients,
    seasoningLibrary,
    preferences,
    userPrompt,
    setPeopleCount,
    setEnergyLevel,
    toggleTastePreference,
    setUserPrompt,
    rememberSelectedIngredients,
    buildGenerateRecipeRequest,
  } = useCookingStore();

  const validSelectedIngredients = selectedIngredients.filter((item) => item.name?.trim());
  const validSelectedSeasonings = seasoningLibrary.selectedSeasonings.filter((item) =>
    item.name?.trim(),
  );
  const ingredientPreview = validSelectedIngredients.slice(0, 5);
  const seasoningPreview = validSelectedSeasonings.slice(0, 5);

  function handleGenerate() {
    buildGenerateRecipeRequest();
    rememberSelectedIngredients();
  }

  return (
    <DeviceFrame>
      <motion.div animate="animate" initial="initial" variants={staggerContainer}>
        <motion.div className="flex items-center justify-between px-1" variants={staggerItem}>
          <HomeIconButton label="菜单">
            <Grip className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </HomeIconButton>
          <HomeIconButton label="重新开始">
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
            <SummaryCard title="本次食材" subtitle={`已选 ${validSelectedIngredients.length} 种`}>
              {ingredientPreview.length > 0 ? (
                ingredientPreview.map((item) => (
                  <SummaryItemPreview emoji={item.emoji} key={item.id} name={item.name} />
                ))
              ) : (
                <span className="text-[12px] font-semibold text-[#aaa39a]">还没选食材</span>
              )}
            </SummaryCard>
          </Link>

          <Link aria-label="进入调料库管理页" className="block" to="/seasonings">
            <SummaryCard
              title="我的调料库"
              subtitle={`已保存 ${validSelectedSeasonings.length} 种`}
            >
              {seasoningPreview.length > 0 ? (
                seasoningPreview.map((item) => (
                  <SummaryItemPreview emoji={item.emoji} key={item.id} name={item.name} />
                ))
              ) : (
                <span className="text-[12px] font-semibold text-[#aaa39a]">还没设置调料</span>
              )}
            </SummaryCard>
          </Link>

          <PeopleStepperMock value={preferences.peopleCount} onChange={setPeopleCount} />
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
          <MotionLink
            className="flex h-[52px] w-full items-center justify-center rounded-[18px] bg-[#111] text-[16px] font-bold text-white shadow-[0_12px_24px_rgba(0,0,0,0.18)] transition-shadow hover:shadow-[0_14px_28px_rgba(0,0,0,0.22)]"
            onClick={handleGenerate}
            to="/results"
            {...motionTapProps}
          >
            用这些凑一顿
          </MotionLink>
          <p className="text-center text-[12px] font-semibold text-[#aaa39a]">
            没思路？先选点食材再说吧～
          </p>
        </motion.footer>
      </motion.div>
    </DeviceFrame>
  );
}
