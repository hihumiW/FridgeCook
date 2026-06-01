type RecipeItemGridProps = {
  items: readonly { name: string; emoji?: string }[];
  itemBackground?: boolean;
};

export function RecipeItemGrid({
  items,
  itemBackground = true,
}: RecipeItemGridProps) {
  return (
    <div className="grid grid-cols-5 gap-2.5">
      {items.map((item) => (
        <div
          className={`flex min-h-[66px] flex-col items-center justify-center gap-1 rounded-[14px] px-2 text-center ${
            itemBackground ? "bg-[#fbfaf8]" : ""
          }`}
          key={item.name}
        >
          {item.emoji ? <span className="text-[32px]">{item.emoji}</span> : null}
          <span className="text-[11px] font-semibold text-[#5c554d]">
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
}
