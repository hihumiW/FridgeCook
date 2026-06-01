import { Clock, Sparkles, Users } from "lucide-react";

import type { Recipe } from "@/types";

type RecipeHeroProps = {
  recipe: Recipe;
};

function joinItems(items: string[]) {
  return items.length > 0 ? items.join("、") : "未说明";
}

export function RecipeHero({ recipe }: RecipeHeroProps) {
  return (
    <section className="rounded-[18px] border border-[#eeeae4] bg-white shadow-[0_8px_26px_rgba(27,24,20,0.07)]">
      <div className="p-4">
        {/* <div className="mb-4 flex h-[128px] items-center justify-center rounded-[14px] border border-dashed border-[#e8e2d9] bg-[#f6f4ef] text-[12px] font-semibold text-[#aaa39a]">
          菜品图片待生成
        </div> */}

        <h1 className="text-[22px] font-black leading-7 text-[#151411]">
          {recipe.name}
        </h1>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#f6f4ef] px-3 text-[11px] font-bold text-[#746e65]">
            <Clock className="h-2 w-2" />
            {recipe.estimatedTime}
          </span>
          <span className="inline-flex h-7 items-center rounded-full bg-[#f6f4ef] px-3 text-[11px] font-bold text-[#746e65]">
            <Sparkles className="mr-1.5 h-2 w-2" />
            难度 {recipe.difficulty}/5
          </span>
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#f6f4ef] px-3 text-[11px] font-bold text-[#746e65]">
            <Users className="h-2 w-2" />
            {recipe.servings} 人份
          </span>
        </div>

        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <h2 className="text-[13px] font-extrabold text-[#1b1a17]">
              用到的食材
            </h2>
            <p className="text-[13px] font-semibold leading-6 text-[#5c554d]">
              {joinItems(recipe.usedIngredients)}
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-[13px] font-extrabold text-[#1b1a17]">
              用到的调料
            </h2>
            <p className="text-[13px] font-semibold leading-6 text-[#5c554d]">
              {joinItems(recipe.usedSeasonings)}
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-[13px] font-extrabold text-[#1b1a17]">
              推荐理由
            </h2>
            <p className="text-[13px] font-semibold leading-6 text-[#5c554d]">
              {recipe.reason}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
