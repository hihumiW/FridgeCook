import { motion } from "framer-motion";

import { chipMotionProps, selectedPop } from "@/lib/motion";

type PreferenceChipProps = {
  children: string;
  selected?: boolean;
  badge?: string;
  onClick?: () => void;
};

export function PreferenceChip({ children, selected, badge, onClick }: PreferenceChipProps) {
  return (
    <motion.button
      animate={selected ? selectedPop : { scale: 1 }}
      className={`relative h-8 rounded-full border px-4 text-[12px] font-semibold shadow-sm transition-colors ${
        selected
          ? "border-[#84c77d] bg-[#f7fff5] text-[#4d9547]"
          : "border-[#ece7df] bg-white text-[#58534c]"
      }`}
      onClick={onClick}
      type="button"
      {...chipMotionProps}
    >
      {children}
      {badge ? (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f36b58] px-1 text-[9px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </motion.button>
  );
}
