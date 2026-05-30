import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { motionTapProps } from "@/lib/motion";

type SelectedIngredientsBarProps = {
  names: string[];
};

const MotionLink = motion.create(Link);

export function SelectedIngredientsBar({ names }: SelectedIngredientsBarProps) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] px-4 pb-[calc(14px+env(safe-area-inset-bottom))]"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex min-h-[52px] items-center justify-between gap-3 rounded-[18px] bg-[#111] px-4 text-white shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
        <p className="min-w-0 truncate text-[12px] font-semibold text-white/86">
          已选 {names.length} 种：{names.join("、")}
        </p>
        <MotionLink
          className="shrink-0 rounded-full bg-white px-4 py-2 text-[12px] font-bold text-[#111]"
          to="/"
          {...motionTapProps}
        >
          完成
        </MotionLink>
      </div>
    </motion.div>
  );
}
