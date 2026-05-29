import type { ReactNode } from "react";

type RecipeMetaPillProps = {
  children: ReactNode;
};

export function RecipeMetaPill({ children }: RecipeMetaPillProps) {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-full bg-[#f6f4ef] px-2.5 text-[10px] font-bold text-[#746e65]">
      {children}
    </span>
  );
}
