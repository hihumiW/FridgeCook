import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { smallMotionTapProps } from "@/lib/motion";

type HomeIconButtonProps = {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  to?: string;
};

const MotionLink = motion.create(Link);

export function HomeIconButton({
  children,
  label,
  onClick,
  to,
}: HomeIconButtonProps) {
  const className =
    "flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#1e1d19] shadow-[0_8px_24px_rgba(30,28,24,0.08)] ring-1 ring-black/[0.03] transition-shadow hover:shadow-[0_10px_26px_rgba(30,28,24,0.12)]";

  if (to) {
    return (
      <MotionLink
        aria-label={label}
        className={className}
        to={to}
        {...smallMotionTapProps}
      >
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button
      aria-label={label}
      className={className}
      onClick={onClick}
      type="button"
      {...smallMotionTapProps}
    >
      {children}
    </motion.button>
  );
}
