import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type SummaryCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function SummaryCard({ title, subtitle, children }: SummaryCardProps) {
  return (
    <article className="rounded-[18px] border border-[#eeeae4] bg-white px-4 py-3.5 shadow-[0_8px_26px_rgba(27,24,20,0.07)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[14px] font-bold leading-5 text-[#181713]">{title}</h2>
          <p className="mt-0.5 text-[12px] font-medium text-[#8d8880]">{subtitle}</p>
        </div>
        <ChevronRight className="mt-1 h-4 w-4 text-[#1f1d19]" strokeWidth={2.4} />
      </div>
      <div className="mt-3 flex items-center gap-4">{children}</div>
    </article>
  );
}
