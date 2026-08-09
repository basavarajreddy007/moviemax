import { easings, springs } from "./easing";

export const transitions = {
  quick: {
    duration: 0.18,
    ease: easings.smooth
  },
  standard: {
    duration: 0.35,
    ease: easings.decelerate
  },
  cinematic: {
    duration: 0.65,
    ease: easings.snappy
  },
  springSnappy: springs.snappy,
  springBouncy: springs.bouncy,
  springGentle: springs.gentle,
};
