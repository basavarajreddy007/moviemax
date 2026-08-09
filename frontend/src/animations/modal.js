import { easings } from "./easing";

export const backdropVariants = {
  hidden: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    WebkitBackdropFilter: "blur(0px)"
  },
  visible: {
    opacity: 1,
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    transition: {
      duration: 0.28,
      ease: easings.decelerate
    }
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    WebkitBackdropFilter: "blur(0px)",
    transition: {
      duration: 0.22,
      ease: easings.accelerate
    }
  }
};

export const modalVariants = {
  hidden: {
    scale: 0.94,
    opacity: 0,
    y: 15
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  },
  exit: {
    scale: 0.96,
    opacity: 0,
    y: 10,
    transition: {
      duration: 0.22,
      ease: easings.accelerate
    }
  }
};
