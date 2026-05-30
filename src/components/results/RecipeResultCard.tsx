import { motion } from "framer-motion";
import { Clock, RotateCcw, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { RecipeMetaPill } from "@/components/results/RecipeMetaPill";
import { cardMotionProps, motionTapProps, smallMotionTapProps } from "@/lib/motion";

type RecipeResultCardProps = {
  id: string;
  name: string;
  time: string;
  difficulty: string;
  ingredients: string;
  seasonings: string;
  reason: string;
};

const MotionLink = motion.create(Link);

export function RecipeResultCard({
  id,
  name,
  time,
  difficulty,
  ingredients,
  seasonings,
  reason,
}: RecipeResultCardProps) {
  return (
    <motion.article
      className="rounded-[18px] border border-[#eeeae4] bg-white p-3.5 shadow-[0_8px_26px_rgba(27,24,20,0.07)] transition-shadow hover:shadow-[0_12px_30px_rgba(27,24,20,0.1)]"
      {...cardMotionProps}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap gap-1.5">
          <RecipeMetaPill>
            <Clock className="h-3 w-3" strokeWidth={2.3} />
            {time}
          </RecipeMetaPill>
          <RecipeMetaPill>
            <Sparkles className="h-3 w-3" strokeWidth={2.3} />
            {difficulty}
          </RecipeMetaPill>
        </div>

        <h2 className="mt-3 text-[17px] font-black leading-6 text-[#161511]">{name}</h2>
        <div className="mt-3 space-y-1.5 text-[12px] font-semibold leading-5 text-[#6f685f]">
          <p>食材：{ingredients}</p>
          <p>调料：{seasonings}</p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-[12px] font-medium leading-5 text-[#7d756b]">
        {reason}
      </p>

      <div className="mt-3 flex items-center justify-end gap-2">
        <MotionLink
          className="inline-flex h-9 items-center justify-center rounded-full bg-[#f6f4ef] px-4 text-[12px] font-bold text-[#2c2924]"
          to={`/recipe/${id}`}
          {...motionTapProps}
        >
          查看详情
        </MotionLink>
        <motion.button
          aria-label="换一个"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111] text-white shadow-[0_8px_18px_rgba(0,0,0,0.16)]"
          type="button"
          {...smallMotionTapProps}
        >
          <RotateCcw className="h-4 w-4" strokeWidth={2.4} />
        </motion.button>
      </div>
    </motion.article>
  );
}
