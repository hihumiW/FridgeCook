import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

import { smallMotionTapProps } from "@/lib/motion";

type PeopleStepperMockProps = {
  value: number;
  onChange: (value: number) => void;
};

export function PeopleStepperMock({ value, onChange }: PeopleStepperMockProps) {
  return (
    <section className="flex h-[52px] items-center justify-between rounded-[18px] border border-[#eeeae4] bg-white px-4 shadow-[0_7px_22px_rgba(27,24,20,0.055)]">
      <h2 className="text-[14px] font-bold text-[#181713]">今晚几个人吃？</h2>
      <div className="flex items-center gap-4">
        <motion.button
          aria-label="减少人数"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f4f1] text-[#34312c] transition-colors hover:bg-[#ece8df]"
          onClick={() => onChange(value - 1)}
          type="button"
          {...smallMotionTapProps}
        >
          <Minus className="h-4 w-4" strokeWidth={2.4} />
        </motion.button>
        <span className="w-4 text-center text-[15px] font-bold text-[#1c1a17]">{value}</span>
        <motion.button
          aria-label="增加人数"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f4f1] text-[#34312c] transition-colors hover:bg-[#ece8df]"
          onClick={() => onChange(value + 1)}
          type="button"
          {...smallMotionTapProps}
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
        </motion.button>
      </div>
    </section>
  );
}
