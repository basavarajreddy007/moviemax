import { easings } from "./easing";

export const navbarVariants = {
  hidden: {
    y: -70,
    opacity: 0
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.45,
      ease: easings.decelerate
    }
  }
};

export const mobileMenuContainerVariants = {
  hidden: {
    y: "-110%",
    opacity: 0
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easings.decelerate,
      staggerChildren: 0.06,
      delayChildren: 0.05
    }
  },
  exit: {
    y: "-110%",
    opacity: 0,
    transition: {
      duration: 0.28,
      ease: easings.accelerate,
      staggerChildren: 0.04,
      staggerDirection: -1
    }
  }
};

export const mobileMenuItemVariants = {
  hidden: {
    x: -15,
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: easings.decelerate
    }
  },
  exit: {
    x: -10,
    opacity: 0,
    transition: {
      duration: 0.18
    }
  }
};

export const navActionIconVariants = {
  hover: {
    scale: 1.08,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    transition: {
      duration: 0.15
    }
  },
  tap: {
    scale: 0.95
  }
};
