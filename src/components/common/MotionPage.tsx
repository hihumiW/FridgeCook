import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { pageVariants } from "@/lib/motion";

type MotionPageProps = {
  children: ReactNode;
};

export function MotionPage({ children }: MotionPageProps) {
  return (
    <motion.div
      animate="animate"
      className="min-h-screen"
      exit="exit"
      initial="initial"
      variants={pageVariants}
    >
      {children}
    </motion.div>
  );
}
