import { motion } from "framer-motion";

import { chipMotionProps, selectedPop } from "@/lib/motion";

type CategoryPillProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export function CategoryPill({ label, active, onClick }: CategoryPillProps) {
  return (
    <motion.button
      animate={active ? selectedPop : { scale: 1 }}
      className={`h-8 shrink-0 rounded-full border px-3.5 text-[12px] font-bold shadow-sm transition-colors ${
        active
          ? "border-[#d9d4cc] bg-white text-[#1b1a17]"
          : "border-transparent bg-[#f2f0eb] text-[#837d74]"
      }`}
      onClick={onClick}
      type="button"
      {...chipMotionProps}
    >
      {label}
    </motion.button>
  );
}
