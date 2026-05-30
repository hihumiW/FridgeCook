import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

import { smallMotionTapProps } from "@/lib/motion";

type AppTopBarProps = {
  backTo?: string;
  showReset?: boolean;
};

const MotionLink = motion.create(Link);

export function AppTopBar({ backTo = "/", showReset = true }: AppTopBarProps) {
  const controlClassName =
    "flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#1e1d19] shadow-[0_8px_24px_rgba(30,28,24,0.08)] ring-1 ring-black/[0.03] transition-shadow hover:shadow-[0_10px_26px_rgba(30,28,24,0.12)]";

  return (
    <div className="flex items-center justify-between px-1">
      <MotionLink
        aria-label="返回"
        className={controlClassName}
        to={backTo}
        {...smallMotionTapProps}
      >
        <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2.5} />
      </MotionLink>
      {showReset ? (
        <motion.button
          aria-label="重新开始"
          className={controlClassName}
          type="button"
          {...smallMotionTapProps}
        >
          <RotateCcw className="h-[18px] w-[18px]" strokeWidth={2.4} />
        </motion.button>
      ) : (
        <span className="h-9 w-9" />
      )}
    </div>
  );
}
