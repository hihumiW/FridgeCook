import { AnimatePresence, MotionConfig } from "framer-motion";
import { useLayoutEffect } from "react";
import { useLocation, useOutlet } from "react-router-dom";

import { MotionPage } from "@/components/common/MotionPage";

export function AppLayout() {
  const location = useLocation();
  const outlet = useOutlet();

  useLayoutEffect(() => {
    window.scrollTo({ left: 0, top: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen bg-[#f5f4f1] text-foreground">
        <AnimatePresence initial={false} mode="wait">
          <MotionPage key={location.pathname}>{outlet}</MotionPage>
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}
