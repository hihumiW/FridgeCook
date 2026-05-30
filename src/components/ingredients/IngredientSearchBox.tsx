import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

import { smallMotionTapProps } from "@/lib/motion";

type IngredientSearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function IngredientSearchBox({
  value,
  onChange,
  placeholder = "搜索食材，比如 鸡蛋、番茄、豆腐",
}: IngredientSearchBoxProps) {
  return (
    <div className="flex h-[36px] items-center gap-2 rounded-full border border-[#ebe6dd] bg-white px-3.5 text-[#b6afa5] shadow-[0_6px_18px_rgba(27,24,20,0.045)] transition-[border-color,box-shadow,color] focus-within:border-[#8dcf87] focus-within:text-[#75b86e] focus-within:shadow-[0_9px_22px_rgba(91,157,85,0.12)] focus-within:ring-2 focus-within:ring-[#dff2dc]">
      <Search className="h-4 w-4" strokeWidth={2.2} />
      <input
        className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[#3f3a34] outline-none placeholder:text-[#b6afa5]"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
      />
      {value ? (
        <motion.button
          aria-label="清空食材搜索"
          className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f3f0eb] text-[#8d867c] transition-colors hover:bg-[#ece8df]"
          onClick={() => onChange("")}
          type="button"
          {...smallMotionTapProps}
        >
          <X className="h-3 w-3" strokeWidth={2.4} />
        </motion.button>
      ) : null}
    </div>
  );
}
