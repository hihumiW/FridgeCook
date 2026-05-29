import { ArrowLeft, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

type AppTopBarProps = {
  backTo?: string;
  showReset?: boolean;
};

export function AppTopBar({ backTo = "/", showReset = true }: AppTopBarProps) {
  const controlClassName =
    "flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#1e1d19] shadow-[0_8px_24px_rgba(30,28,24,0.08)] ring-1 ring-black/[0.03]";

  return (
    <div className="flex items-center justify-between px-1">
      <Link aria-label="返回" className={controlClassName} to={backTo}>
        <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2.5} />
      </Link>
      {showReset ? (
        <button aria-label="重新开始" className={controlClassName} type="button">
          <RotateCcw className="h-[18px] w-[18px]" strokeWidth={2.4} />
        </button>
      ) : (
        <span className="h-9 w-9" />
      )}
    </div>
  );
}
