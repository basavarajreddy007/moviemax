import { motion, useReducedMotion } from "framer-motion";
import { easings } from "./easing";

export default function Reveal({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  once = true,
  amount = 0.15,
  className = ""
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const getDirectionOffset = () => {
    switch (direction) {
      case "up":
        return { y: 35 };
      case "down":
        return { y: -35 };
      case "left":
        return { x: 35 };
      case "right":
        return { x: -35 };
      default:
        return ;
    }
  };

  const variants = {
    hidden: {
      opacity: 0,
      ...getDirectionOffset()
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: easings.decelerate
      }
    }
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
