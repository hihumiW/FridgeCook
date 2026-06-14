import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

type SelectedIngredientsBarProps = {
  names: string[];
  onHeightChange?: (height: number) => void;
};

export function SelectedIngredientsBar({ names, onHeightChange }: SelectedIngredientsBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !onHeightChange) return;

    const observer = new ResizeObserver(() => {
      onHeightChange(element.offsetHeight);
    });

    observer.observe(element);

    // Initial measurement
    onHeightChange(element.offsetHeight);

    return () => {
      observer.disconnect();
      onHeightChange(0);
    };
  }, [onHeightChange]);

  return (
    <motion.div
      ref={containerRef}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px] px-4 pb-[calc(14px+env(safe-area-inset-bottom))]"
      exit={{ opacity: 0, y: 18 }}
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="max-h-[34dvh] min-h-[52px] overflow-y-auto rounded-[18px] bg-[#111] px-4 py-3 text-white shadow-[0_12px_28px_rgba(0,0,0,0.22)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <p className="text-[12px] font-semibold leading-5 text-white/86">
          已选 {names.length} 种 :
        </p>
        {names.length > 0 ? (
          <p className="whitespace-normal break-words text-[12px] font-semibold leading-5 text-white/92">
            {names.join("、")}
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}
