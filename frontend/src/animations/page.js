import { easings } from "./easing";

export const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.99,
    y: 8
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: easings.decelerate,
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  },
  exit: {
    opacity: 0,
    scale: 0.99,
    y: -8,
    transition: {
      duration: 0.32,
      ease: easings.accelerate
    }
  }
};
