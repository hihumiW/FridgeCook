import { Check } from "lucide-react";

type IngredientTileProps = {
  emoji?: string;
  name: string;
  selected?: boolean;
  onClick?: () => void;
};

export function IngredientTile({
  emoji,
  name,
  selected,
  onClick,
}: IngredientTileProps) {
  return (
    <button
      className={`relative flex h-[72px] flex-col items-center justify-center gap-1 rounded-[11px] border text-center shadow-[0_7px_20px_rgba(27,24,20,0.055)] ${
        selected
          ? "border-[#d7e8ce] bg-[#fbfff8] text-[#35312c]"
          : "border-[#ece7df] bg-white text-[#5f594f]"
      }`}
      onClick={onClick}
      type="button"
    >
      {selected ? (
        <span className="absolute right-2 top-2 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-[#111] text-white">
          <Check className="h-[10px] w-[10px]" strokeWidth={3} />
        </span>
      ) : null}
      {emoji ? (
        <span className="text-[25px] drop-shadow-[0_8px_10px_rgba(0,0,0,0.1)]">
          {emoji}
        </span>
      ) : null}
      <span className="text-[11px] font-semibold text-[#4f4a43]">{name}</span>
    </button>
  );
}
