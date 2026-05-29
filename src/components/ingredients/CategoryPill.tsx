type CategoryPillProps = {
  label: string;
  active?: boolean;
};

export function CategoryPill({ label, active }: CategoryPillProps) {
  return (
    <button
      className={`h-8 shrink-0 rounded-full border px-3.5 text-[12px] font-bold shadow-sm ${
        active
          ? "border-[#d9d4cc] bg-white text-[#1b1a17]"
          : "border-transparent bg-[#f2f0eb] text-[#837d74]"
      }`}
      type="button"
    >
      {label}
    </button>
  );
}
