import { AnimatePresence, motion } from "framer-motion";
import { Fragment, useState } from "react";

import { AppTopBar } from "@/components/common/AppTopBar";
import { DeviceFrame } from "@/components/home/DeviceFrame";
import { RecipeGeneratingOverlay } from "@/components/home/RecipeGeneratingOverlay";
import { RecipeResultCard } from "@/components/results/RecipeResultCard";
import { motionTapProps, staggerContainer, staggerItem } from "@/lib/motion";
import { useCookingStore } from "@/stores/useCookingStore";

export function ResultsPage() {
  const {
    generateRecipeError,
    generateRecipes,
    generatedRecipes,
    isGeneratingRecipes,
  } = useCookingStore();
  const [regeneratePrompt, setRegeneratePrompt] = useState("");
  const hasRecipes = generatedRecipes.length > 0;

  async function handleRegenerate() {
    if (isGeneratingRecipes) return;
    const success = await generateRecipes({
      extraPrompt: regeneratePrompt,
      previousRecipes: generatedRecipes,
    });
    if (success) {
      setRegeneratePrompt("");
    }
  }

  return (
    <DeviceFrame>
      <AppTopBar showReset={false} />

      <header className="mt-6 px-1">
        <h1 className="text-[24px] font-black leading-8 tracking-normal text-[#151411]">
          {hasRecipes
            ? `为你推荐 ${generatedRecipes.length} 道菜`
            : "还没有菜谱"}
        </h1>
        <p className="mt-2 text-[12px] font-semibold text-[#9b958d]">
          {hasRecipes
            ? "基于你的食材、调料和偏好生成。"
            : "回到首页，选好食材后再生成。"}
        </p>
      </header>

      {hasRecipes ? (
        <motion.section
          animate="animate"
          className="mt-5 space-y-3.5"
          initial="initial"
          variants={staggerContainer}
        >
          {generatedRecipes.map((recipe) => (
            <motion.div key={recipe.id} variants={staggerItem}>
              <RecipeResultCard recipe={recipe} />
            </motion.div>
          ))}
        </motion.section>
      ) : null}

      <footer className="mt-5 space-y-3 pb-2">
        {hasRecipes ? (
          <Fragment>
            <section className="space-y-2">
              <h2 className="px-1 text-[14px] font-extrabold text-[#1b1a17]">
                这次想换成什么感觉？
              </h2>
              <div className="min-h-[74px] rounded-[17px] border border-[#ece7df] bg-white px-4 py-3 shadow-[0_7px_22px_rgba(27,24,20,0.055)] transition-[border-color,box-shadow] focus-within:border-[#8dcf87] focus-within:shadow-[0_10px_26px_rgba(91,157,85,0.14)] focus-within:ring-2 focus-within:ring-[#dff2dc]">
                <textarea
                  className="min-h-[42px] w-full resize-none bg-transparent text-[12px] font-medium leading-6 text-[#4f4942] outline-none placeholder:text-[#b8b2a9]"
                  maxLength={200}
                  onChange={(event) => setRegeneratePrompt(event.target.value)}
                  placeholder="比如：不要汤、想下饭一点、别再推荐鸡蛋……"
                  value={regeneratePrompt}
                />
                <div className="mt-1 text-right text-[11px] font-medium text-[#aaa39a]">
                  {regeneratePrompt.length}/200
                </div>
              </div>
              <motion.button
                className="h-[52px] w-full rounded-[18px] bg-[#111] text-[16px] font-bold text-white shadow-[0_12px_24px_rgba(0,0,0,0.18)] transition-shadow hover:shadow-[0_14px_28px_rgba(0,0,0,0.22)] disabled:cursor-not-allowed disabled:bg-[#c8c1b8] disabled:shadow-none"
                disabled={isGeneratingRecipes}
                onClick={handleRegenerate}
                type="button"
                {...motionTapProps}
              >
                {isGeneratingRecipes ? "正在换一批" : "换一批菜谱"}
              </motion.button>
              <p className="text-center text-[12px] font-semibold text-[#aaa39a]">
                不满意？换一批试试～
              </p>
            </section>
          </Fragment>
        ) : null}

        {generateRecipeError ? (
          <p className="rounded-[14px] border border-[#f1d1cc] bg-[#fff3f1] px-3 py-2 text-center text-[12px] font-semibold leading-5 text-[#bf4b3e]">
            {generateRecipeError}
          </p>
        ) : null}
      </footer>

      <AnimatePresence>
        {isGeneratingRecipes ? <RecipeGeneratingOverlay /> : null}
      </AnimatePresence>
    </DeviceFrame>
  );
}
