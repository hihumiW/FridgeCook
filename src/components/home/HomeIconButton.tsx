import type { ReactNode } from "react";

type HomeIconButtonProps = {
  children: ReactNode;
  label: string;
};

export function HomeIconButton({ children, label }: HomeIconButtonProps) {
  return (
    <button
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#1e1d19] shadow-[0_8px_24px_rgba(30,28,24,0.08)] ring-1 ring-black/[0.03]"
      type="button"
    >
      {children}
    </button>
  );
}
