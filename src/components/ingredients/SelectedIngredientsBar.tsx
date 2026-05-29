import { Link } from "react-router-dom";

type SelectedIngredientsBarProps = {
  names: string[];
};

export function SelectedIngredientsBar({ names }: SelectedIngredientsBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] px-4 pb-[calc(14px+env(safe-area-inset-bottom))]">
      <div className="flex min-h-[52px] items-center justify-between gap-3 rounded-[18px] bg-[#111] px-4 text-white shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
        <p className="min-w-0 truncate text-[12px] font-semibold text-white/86">
          已选 {names.length} 种：{names.join("、")}
        </p>
        <Link
          className="shrink-0 rounded-full bg-white px-4 py-2 text-[12px] font-bold text-[#111]"
          to="/"
        >
          完成
        </Link>
      </div>
    </div>
  );
}
