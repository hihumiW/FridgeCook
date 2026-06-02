import { Link, useParams } from "react-router-dom";

import { AppTopBar } from "@/components/common/AppTopBar";
import { DeviceFrame } from "@/components/home/DeviceFrame";
import { RecipeHero } from "@/components/recipe/RecipeHero";
import { RecipeStep } from "@/components/recipe/RecipeStep";
import { useCookingStore } from "@/stores/useCookingStore";

export function RecipeDetailPage() {
  const { id } = useParams();
  const generatedRecipes = useCookingStore((state) => state.generatedRecipes);
  const recipe = generatedRecipes.find((item) => item.id === id);

  if (!recipe) {
    return (
      <DeviceFrame>
        <AppTopBar backTo="/results" showReset={false} />

        <section className="mt-6 rounded-[18px] border border-[#eeeae4] bg-white p-5 text-center shadow-[0_8px_26px_rgba(27,24,20,0.07)]">
          <h1 className="text-[20px] font-black text-[#151411]">菜谱不见了</h1>
          <p className="mt-2 text-[12px] font-semibold leading-5 text-[#9b958d]">
            当前页面没有找到这道菜，可能是刷新后生成结果已清空。
          </p>
          <div className="mt-5 flex gap-2">
            <Link
              className="flex h-11 flex-1 items-center justify-center rounded-[14px] bg-[#f1eee8] text-[13px] font-bold text-[#5f594f]"
              to="/results"
            >
              返回结果
            </Link>
            <Link
              className="flex h-11 flex-1 items-center justify-center rounded-[14px] bg-[#111] text-[13px] font-bold text-white"
              to="/"
            >
              回首页
            </Link>
          </div>
        </section>
      </DeviceFrame>
    );
  }

  const warnings = recipe.warnings.filter((warning) => warning.trim());
  const substitutions = recipe.substitutions.filter((substitution) =>
    substitution.trim(),
  );
  const hasTips = warnings.length > 0 || substitutions.length > 0;

  return (
    <DeviceFrame>
      <AppTopBar backTo="/results" showReset={false} />

      <div className="mt-5">
        <RecipeHero recipe={recipe} />
      </div>

      {recipe.riskFlags?.length ? (
        <section className="mt-4 rounded-[18px] border border-[#f0e1ba] bg-[#fff9e9] p-4 text-[12px] font-semibold leading-5 text-[#9a6a1e] shadow-[0_8px_26px_rgba(27,24,20,0.05)]">
          <h2 className="text-[14px] font-extrabold text-[#8a5a12]">注意一下</h2>
          <div className="mt-2 space-y-1">
            {recipe.riskFlags.map((riskFlag) => (
              <p key={riskFlag}>{riskFlag}</p>
            ))}
          </div>
        </section>
      ) : null}

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

      {hasTips ? (
        <section className="mt-4 space-y-6 rounded-[18px] border border-[#eeeae4] bg-white p-4 shadow-[0_8px_26px_rgba(27,24,20,0.07)]">
          {warnings.length > 0 ? (
            <div className="space-y-2">
              <h2 className="text-[14px] font-extrabold text-[#1b1a17]">
                翻车提醒
              </h2>
              <div className="space-y-1 text-[13px] font-semibold leading-6 text-[#5c554d]">
                {warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            </div>
          ) : null}

          {substitutions.length > 0 ? (
            <div className="space-y-2">
              <h2 className="text-[14px] font-extrabold text-[#1b1a17]">
                可替换方案
              </h2>
              <div className="space-y-1 text-[13px] font-semibold leading-6 text-[#5c554d]">
                {substitutions.map((substitution) => (
                  <p key={substitution}>{substitution}</p>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </DeviceFrame>
  );
}
