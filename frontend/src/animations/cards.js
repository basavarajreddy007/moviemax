import { easings, springs } from "./easing";

export const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: easings.decelerate
    }
  }
};

export const cardHoverVariants = {
  hover: {
    scale: 1.04,
    borderColor: "rgba(255, 45, 85, 0.45)",
    transition: springs.snappy
  }
};

export const posterZoomVariants = {
  hover: {
    scale: 1.035,
    transition: springs.snappy
  }
};

export const cardInfoVariants = {
  hover: {
    y: -3,
    transition: {
      duration: 0.22,
      ease: easings.decelerate
    }
  }
};

export const heartBounceVariants = {
  tap: {
    scale: 0.82,
    transition: {
      duration: 0.12
    }
  },
  bounce: {
    scale: [1, 1.35, 0.92, 1.12, 0.96, 1],
    transition: {
      duration: 0.45,
      ease: easings.softBack
    }
  }
};
