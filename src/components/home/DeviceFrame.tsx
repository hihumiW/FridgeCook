import type { ReactNode } from "react";

type DeviceFrameProps = {
  children: ReactNode;
};

export function DeviceFrame({ children }: DeviceFrameProps) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-[#fbfaf8] shadow-[0_18px_60px_rgba(22,20,18,0.08)] sm:border-x sm:border-[#e7e2da]">
      <section className="min-h-dvh px-4 pb-[calc(24px+env(safe-area-inset-bottom))] pt-[calc(16px+env(safe-area-inset-top))]">
        {children}
      </section>
    </div>
  );
}
