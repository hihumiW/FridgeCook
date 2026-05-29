type CategoryPillProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export function CategoryPill({ label, active, onClick }: CategoryPillProps) {
  return (
    <button
      className={`h-8 shrink-0 rounded-full border px-3.5 text-[12px] font-bold shadow-sm ${
        active
          ? "border-[#d9d4cc] bg-white text-[#1b1a17]"
          : "border-transparent bg-[#f2f0eb] text-[#837d74]"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
