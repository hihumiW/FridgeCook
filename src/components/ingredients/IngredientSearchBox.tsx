import { Search } from "lucide-react";

export function IngredientSearchBox() {
  return (
    <div className="flex h-[36px] items-center gap-2 rounded-full border border-[#ebe6dd] bg-white px-3.5 text-[#b6afa5] shadow-[0_6px_18px_rgba(27,24,20,0.045)]">
      <Search className="h-4 w-4" strokeWidth={2.2} />
      <span className="text-[12px] font-medium">搜索食材，比如 鸡蛋、番茄、豆腐</span>
    </div>
  );
}
