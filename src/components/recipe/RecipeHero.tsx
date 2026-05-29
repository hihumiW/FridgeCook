import { Clock, Sparkles, Users } from "lucide-react";

import type { RecipeMockup } from "@/data";
import { RecipeItemGrid } from "@/components/recipe/RecipeItemGrid";

type RecipeHeroProps = {
  recipe: RecipeMockup;
};

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
            {recipe.time}
          </span>
          <span className="inline-flex h-7 items-center rounded-full bg-[#f6f4ef] px-3 text-[11px] font-bold text-[#746e65]">
            <Sparkles className="mr-1.5 h-2 w-2" />
            {recipe.difficulty}
          </span>
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-[#f6f4ef] px-3 text-[11px] font-bold text-[#746e65]">
            <Users className="h-2 w-2" />
            {recipe.servings}
          </span>
        </div>

        <div className="mt-6 space-y-5">
          <div className="space-y-3">
            <h2 className="text-[13px] font-extrabold text-[#1b1a17]">
              用到的食材
            </h2>
            <RecipeItemGrid itemBackground={false} items={recipe.ingredientItems} />
          </div>

          <div className="space-y-3">
            <h2 className="text-[13px] font-extrabold text-[#1b1a17]">
              用到的调料
            </h2>
            <RecipeItemGrid itemBackground={false} items={recipe.seasoningItems} />
          </div>
        </div>
      </div>
    </section>
  );
}
