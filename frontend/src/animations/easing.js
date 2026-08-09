export const easings = {
  smooth: [0.4, 0, 0.2, 1],
  decelerate: [0.25, 1, 0.5, 1],
  accelerate: [0.5, 0, 0.75, 0],
  snappy: [0.16, 1, 0.3, 1],
  softBack: [0.34, 1.56, 0.64, 1],
};

export const springs = {
  snappy: {
    type: "spring",
    stiffness: 350,
    damping: 25,
    mass: 0.8
  },
  bouncy: {
    type: "spring",
    stiffness: 300,
    damping: 15,
    mass: 0.8
  },
  gentle: {
    type: "spring",
    stiffness: 120,
    damping: 14
  },
  heavy: {
    type: "spring",
    stiffness: 180,
    damping: 26,
    mass: 1.2
  }
};
