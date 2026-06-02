import { motion } from "framer-motion";
import { AlertTriangle, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { RecipeMetaPill } from "@/components/results/RecipeMetaPill";
import { cardMotionProps } from "@/lib/motion";
import type { Recipe } from "@/types";

type RecipeResultCardProps = {
  recipe: Recipe;
};

const MotionLink = motion.create(Link);

export function RecipeResultCard({ recipe }: RecipeResultCardProps) {
  const riskCount = recipe.riskFlags?.length ?? 0;

  return (
    <MotionLink
      aria-label={`查看 ${recipe.name} 详情`}
      className="block rounded-[18px] border border-[#eeeae4] bg-white p-3.5 shadow-[0_8px_26px_rgba(27,24,20,0.07)] transition-shadow hover:shadow-[0_12px_30px_rgba(27,24,20,0.1)]"
      replace
      to={`/recipe/${recipe.id}`}
      {...cardMotionProps}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap gap-1.5">
          <RecipeMetaPill>
            <Clock className="h-3 w-3" strokeWidth={2.3} />
            {recipe.estimatedTime}
          </RecipeMetaPill>
          <RecipeMetaPill>
            <Sparkles className="h-3 w-3" strokeWidth={2.3} />
            难度 {recipe.difficulty}/5
          </RecipeMetaPill>
        </div>

        <h2 className="mt-3 text-[17px] font-black leading-6 text-[#161511]">
          {recipe.name}
        </h2>
        <div className="mt-3 space-y-1.5 text-[12px] font-semibold leading-5 text-[#6f685f]">
          <p>食材：{recipe.usedIngredients.join("、") || "未说明"}</p>
          <p>调料：{recipe.usedSeasonings.join("、") || "未说明"}</p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-[12px] font-medium leading-5 text-[#7d756b]">
        {recipe.reason}
      </p>

      {riskCount > 0 ? (
        <div className="mt-3 flex items-start gap-2 rounded-[13px] border border-[#f0e1ba] bg-[#fff9e9] px-3 py-2 text-[11px] font-semibold leading-5 text-[#9a6a1e]">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
          <span>{recipe.riskFlags?.[0]}</span>
        </div>
      ) : null}

    </MotionLink>
  );
}
