import { motion } from "framer-motion";

import { recipeMockups } from "@/data";
import { AppTopBar } from "@/components/common/AppTopBar";
import { DeviceFrame } from "@/components/home/DeviceFrame";
import { RecipeResultCard } from "@/components/results/RecipeResultCard";
import { motionTapProps, staggerContainer, staggerItem } from "@/lib/motion";

export function ResultsPage() {
  return (
    <DeviceFrame>
      <AppTopBar showReset={false} />

      <header className="mt-6 px-1">
        <h1 className="text-[24px] font-black leading-8 tracking-normal text-[#151411]">
          为你推荐 3 道菜
        </h1>
        <p className="mt-2 text-[12px] font-semibold text-[#9b958d]">
          基于你的食材、调料和偏好生成。
        </p>
      </header>

      <motion.section
        animate="animate"
        className="mt-5 space-y-3.5"
        initial="initial"
        variants={staggerContainer}
      >
        {recipeMockups.map((recipe) => (
          <motion.div key={recipe.id} variants={staggerItem}>
            <RecipeResultCard {...recipe} />
          </motion.div>
        ))}
      </motion.section>

      <footer className="mt-5 space-y-3 pb-2">
        <motion.button
          className="h-[52px] w-full rounded-[18px] bg-[#111] text-[16px] font-bold text-white shadow-[0_12px_24px_rgba(0,0,0,0.18)] transition-shadow hover:shadow-[0_14px_28px_rgba(0,0,0,0.22)]"
          type="button"
          {...motionTapProps}
        >
          换一批菜谱
        </motion.button>
        <p className="text-center text-[12px] font-semibold text-[#aaa39a]">
          不满意？换一批试试～
        </p>
      </footer>
    </DeviceFrame>
  );
}
