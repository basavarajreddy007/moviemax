import { easings } from "./easing";

export const playerControlsVariants = {
  hidden: {
    opacity: 0,
    y: 12
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: easings.smooth
    }
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: {
      duration: 0.22,
      ease: easings.smooth
    }
  }
};

export const playButtonPulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.85, 1, 0.85],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity
    }
  },
  hover: {
    scale: 1.08,
    transition: {
      duration: 0.18
    }
  },
  tap: {
    scale: 0.92
  }
};

export const progressTrackVariants = {
  hover: {
    scaleY: 1.5,
    transition: {
      duration: 0.15
    }
  }
};
