import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";

import { cardMotionProps } from "@/lib/motion";

type SummaryCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  isExpanded?: boolean;
  overflowCount?: number;
  onToggleExpanded?: (event: MouseEvent<HTMLButtonElement>) => void;
  toggleLabel?: string;
};

export function SummaryCard({
  title,
  subtitle,
  children,
  isExpanded,
  overflowCount = 0,
  onToggleExpanded,
  toggleLabel,
}: SummaryCardProps) {
  const shouldShowToggle = Boolean(
    onToggleExpanded && (isExpanded || overflowCount > 0),
  );
  const hasPreviewContent = Boolean(children) || (!isExpanded && overflowCount > 0);

  return (
    <motion.article
      className="rounded-[18px] border border-[#eeeae4] bg-white px-4 py-3.5 shadow-[0_8px_26px_rgba(27,24,20,0.07)] transition-shadow hover:shadow-[0_12px_30px_rgba(27,24,20,0.1)]"
      {...cardMotionProps}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-bold leading-5 text-[#181713]">
            {title}
          </h2>
          <p className="mt-0.5 text-[12px] font-medium text-[#8d8880]">
            {subtitle}
          </p>
        </div>
        <ChevronRight
          className="mt-1 h-4 w-4 text-[#1f1d19]"
          strokeWidth={2.4}
        />
      </div>
      {hasPreviewContent ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {children}
          {!isExpanded && overflowCount > 0 ? (
            <span className="inline-flex h-8 items-center rounded-full border border-[#e5ded4] bg-[#f7f3ee] px-3 text-[12px] font-bold text-[#746d64]">
              +{overflowCount}
            </span>
          ) : null}
        </div>
      ) : null}
      {shouldShowToggle ? (
        <div className="mt-3 flex justify-end">
          <button
            className=" text-[12px] font-bold text-[#5d8f4f]"
            onClick={onToggleExpanded}
            type="button"
          >
            {toggleLabel ?? (isExpanded ? "收起" : "展开全部")}
          </button>
        </div>
      ) : null}
    </motion.article>
  );
}
