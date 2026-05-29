import { Check } from "lucide-react";

type SeasoningChipProps = {
  emoji?: string;
  name: string;
  selected?: boolean;
  onClick?: () => void;
};

export function SeasoningChip({ emoji, name, selected, onClick }: SeasoningChipProps) {
  return (
    <button
      className={`relative inline-flex h-9 items-center gap-1.5 rounded-[11px] border px-3.5 text-[12px] font-semibold shadow-sm ${
        selected
          ? "border-[#d7e8ce] bg-[#fbfff8] text-[#35312c]"
          : "border-[#ece7df] bg-white text-[#5f594f]"
      }`}
      onClick={onClick}
      type="button"
    >
      {emoji ? <span className="text-[15px]">{emoji}</span> : null}
      <span>{name}</span>
      {selected ? (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#111] text-white">
          <Check className="h-[10px] w-[10px]" strokeWidth={3} />
        </span>
      ) : null}
    </button>
  );
}
