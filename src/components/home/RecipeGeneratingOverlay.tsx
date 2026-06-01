import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { modalBackdropVariants, modalPanelVariants } from "@/lib/motion";

const loadingMessages = [
  "正在翻冰箱...",
  "正在凑一顿...",
  "正在整活中...",
  "正在避免推荐你没有的调料...",
  "正在问番茄要不要出场...",
  "正在拯救今晚的饭点...",
  "马上开饭，别急...",
];

export function RecipeGeneratingOverlay() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % loadingMessages.length);
    }, 2800);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  return (
    <motion.div
      animate="animate"
      aria-live="polite"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#fbfaf8]/78 px-5 backdrop-blur-[12px]"
      exit="exit"
      initial="initial"
      role="status"
      variants={modalBackdropVariants}
    >
      <motion.div
        className="relative text-center"
        style={{ width: "min(320px, calc(100vw - 40px))" }}
        variants={modalPanelVariants}
      >
        <div className="recipe-toss-scene relative mx-auto h-[150px] w-[220px]">
          <div className="recipe-toss-glow absolute bottom-8 left-1/2 h-16 w-32 -translate-x-1/2 rounded-full bg-[#c9edbf] blur-2xl" />

          <span
            className="recipe-toss-food recipe-toss-food-tomato"
            aria-hidden="true"
          >
            🍅
          </span>
          <span
            className="recipe-toss-food recipe-toss-food-meat"
            aria-hidden="true"
          >
            🥩
          </span>
          <span
            className="recipe-toss-food recipe-toss-food-scallion"
            aria-hidden="true"
          >
            🌿
          </span>

          <span className="recipe-toss-pan" aria-hidden="true">
            🍳
          </span>
        </div>

        <div className="relative mt-1 h-12 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-[19px] font-black leading-7 text-[#151411] drop-shadow-[0_1px_8px_rgba(255,255,255,0.9)]"
              exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
              initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
              key={loadingMessages[messageIndex]}
              transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
            >
              {loadingMessages[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
