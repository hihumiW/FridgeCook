import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

import { chipMotionProps, selectedPop } from "@/lib/motion";

type SeasoningChipProps = {
  emoji?: string;
  name: string;
  selected?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
};

export function SeasoningChip({ emoji, name, onDelete, selected, onClick }: SeasoningChipProps) {
  return (
    <motion.button
      animate={selected ? selectedPop : { scale: 1 }}
      className={`relative inline-flex h-9 items-center gap-1.5 rounded-[11px] border px-3.5 text-[12px] font-semibold shadow-sm transition-colors ${
        selected
          ? "border-[#d7e8ce] bg-[#fbfff8] text-[#35312c]"
          : "border-[#ece7df] bg-white text-[#5f594f]"
      }`}
      onClick={onClick}
      type="button"
      {...chipMotionProps}
    >
      {emoji ? <span className="text-[15px]">{emoji}</span> : null}
      <span>{name}</span>
      {onDelete ? (
        <span
          aria-label={`删除 ${name}`}
          className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#111] text-white"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            event.stopPropagation();
            onDelete();
          }}
        >
          <X className="h-[10px] w-[10px]" strokeWidth={3} />
        </span>
      ) : selected ? (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#111] text-white">
          <Check className="h-[10px] w-[10px]" strokeWidth={3} />
        </span>
      ) : null}
    </motion.button>
  );
}
