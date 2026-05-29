type EnergyCardProps = {
  icon: string;
  title: string;
  subtitle: string;
  selected?: boolean;
  onClick?: () => void;
};

export function EnergyCard({ icon, title, subtitle, selected, onClick }: EnergyCardProps) {
  return (
    <button
      className={`h-[116px] rounded-[12px] border bg-white px-2.5 py-4 text-center shadow-[0_7px_22px_rgba(27,24,20,0.055)] transition ${
        selected
          ? "border-[#8dcf87] bg-[#f8fff6] shadow-[0_8px_24px_rgba(91,157,85,0.16)]"
          : "border-[#ebe7df]"
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="block text-[21px]">{icon}</span>
      <span className="mt-3 block text-[13px] font-bold leading-5 text-[#1d1b18]">{title}</span>
      <span className={`mt-1 block text-[11px] font-medium ${selected ? "text-[#6dab67]" : "text-[#a39d93]"}`}>
        {subtitle}
      </span>
    </button>
  );
}
