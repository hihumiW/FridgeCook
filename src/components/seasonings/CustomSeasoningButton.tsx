import { motion } from "framer-motion";
import { Plus } from "lucide-react";

import { chipMotionProps } from "@/lib/motion";

type CustomSeasoningButtonProps = {
  children: string;
  onClick?: () => void;
};

export function CustomSeasoningButton({ children, onClick }: CustomSeasoningButtonProps) {
  return (
    <motion.button
      className="inline-flex h-9 items-center gap-1.5 rounded-[11px] border border-dashed border-[#ded8cf] bg-white px-3.5 text-[12px] font-semibold text-[#8d867c] shadow-sm transition-colors hover:border-[#b8d8ae] hover:text-[#5e9858]"
      onClick={onClick}
      type="button"
      {...chipMotionProps}
    >
      <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
      {children}
    </motion.button>
  );
}
