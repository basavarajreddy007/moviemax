import { easings, springs } from "./easing";

export const heroBackdropVariants = {
  active: {
    scale: [1, 1.03],
    filter: "brightness(0.5)",
    transition: {
      duration: 8,
      ease: "linear"
    }
  },
  inactive: {
    scale: 1,
    filter: "brightness(0.35)"
  }
};

export const heroContentVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

export const heroTitleVariants = {
  hidden: {
    opacity: 0,
    x: -30
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.65,
      ease: easings.snappy
    }
  }
};

export const heroFadeUpVariants = {
  hidden: {
    opacity: 0,
    y: 15
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easings.decelerate
    }
  }
};

export const heroButtonVariants = {
  hidden: {
    opacity: 0,
    scale: 0.85
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.snappy
  },
  hover: {
    scale: 1.035,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.96
  }
};
