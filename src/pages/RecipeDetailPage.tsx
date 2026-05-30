import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";

import { recipeMockups } from "@/data";
import { AppTopBar } from "@/components/common/AppTopBar";
import { DeviceFrame } from "@/components/home/DeviceFrame";
import { RecipeHero } from "@/components/recipe/RecipeHero";
import { RecipeStep } from "@/components/recipe/RecipeStep";
import { motionTapProps } from "@/lib/motion";

const MotionLink = motion.create(Link);

export function RecipeDetailPage() {
  const { id } = useParams();
  const recipe = recipeMockups.find((item) => item.id === id) ?? recipeMockups[0];

  return (
    <DeviceFrame>
      <AppTopBar backTo="/results" />

      <div className="mt-5">
        <RecipeHero recipe={recipe} />
      </div>

      <section className="mt-4 rounded-[18px] border border-[#eeeae4] bg-white p-4 shadow-[0_8px_26px_rgba(27,24,20,0.07)]">
        <h2 className="text-[14px] font-extrabold text-[#1b1a17]">步骤</h2>
        <div className="mt-3 space-y-2.5">
          {recipe.steps.map((step, index) => (
            <RecipeStep index={index + 1} key={step}>
              {step}
            </RecipeStep>
          ))}
        </div>
      </section>

      <section className="mt-4 space-y-6 rounded-[18px] border border-[#eeeae4] bg-white p-4 shadow-[0_8px_26px_rgba(27,24,20,0.07)]">
        <div className="space-y-2">
          <h2 className="text-[14px] font-extrabold text-[#1b1a17]">翻车提醒</h2>
          <div className="space-y-1 text-[13px] font-semibold leading-6 text-[#5c554d]">
            {recipe.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-[14px] font-extrabold text-[#1b1a17]">可替换方案</h2>
          <div className="space-y-1 text-[13px] font-semibold leading-6 text-[#5c554d]">
            {recipe.substitutions.map((substitution) => (
              <p key={substitution}>{substitution}</p>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-6 pb-2">
        <MotionLink
          className="flex h-[52px] w-full items-center justify-center rounded-[18px] bg-[#111] text-[16px] font-bold text-white shadow-[0_12px_24px_rgba(0,0,0,0.18)] transition-shadow hover:shadow-[0_14px_28px_rgba(0,0,0,0.22)]"
          to="/results"
          {...motionTapProps}
        >
          重新生成
        </MotionLink>
      </footer>
    </DeviceFrame>
  );
}
