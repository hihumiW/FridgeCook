type RecipeStepProps = {
  index: number;
  children: string;
};

export function RecipeStep({ index, children }: RecipeStepProps) {
  return (
    <div className="flex gap-3 py-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#111] text-[11px] font-bold text-white">
        {index}
      </span>
      <p className="text-[13px] font-semibold leading-5 text-[#4f4942]">{children}</p>
    </div>
  );
}
