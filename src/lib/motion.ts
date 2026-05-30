import type { Transition, Variants } from "framer-motion";

export const softSpring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 30,
  mass: 0.7,
};

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.14, ease: "easeIn" },
  },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.055,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 14, filter: "blur(2px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.24, ease: "easeOut" },
  },
};

export const fadeItem: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.18, ease: "easeOut" },
  },
};

export const motionTapProps = {
  whileTap: { scale: 0.97 },
  transition: softSpring,
};

export const smallMotionTapProps = {
  whileTap: { scale: 0.94 },
  transition: softSpring,
};

export const cardMotionProps = {
  whileHover: { y: -2, scale: 1.01 },
  whileTap: { y: 0, scale: 0.985 },
  transition: softSpring,
};

export const chipMotionProps = {
  whileTap: { scale: 0.96 },
  transition: softSpring,
};

export const selectedPop = {
  scale: [1, 1.045, 1],
};

export const modalBackdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.16, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.12, ease: "easeIn" } },
};

export const modalPanelVariants: Variants = {
  initial: { opacity: 0, y: 18, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: softSpring,
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.98,
    transition: { duration: 0.12, ease: "easeIn" },
  },
};
