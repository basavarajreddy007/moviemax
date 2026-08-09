import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

export function useAnimatedCounter(targetValue, duration = 1.5) {
  const [count, setCount] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setCount(targetValue);
      return;
    }
    const controls = animate(0, targetValue, {
      duration,
      ease: "easeOut",
      onUpdate: (value) => setCount(Math.floor(value))
    });
    return () => controls.stop();
  }, [targetValue, duration, shouldReduceMotion]);

  return count;
}
