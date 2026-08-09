import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const logoLetters = [
  { char: "M", id: "m1", type: "liquid" },
  { char: "O", id: "o", type: "glass" },
  { char: "V", id: "v", type: "reflection" },
  { char: "I", id: "i", type: "beam" },
  { char: "E", id: "e", type: "smoke" },
  { char: "M", id: "m2", type: "particle" },
  { char: "A", id: "a", type: "wireframe" },
  { char: "X", id: "x", type: "slash" }
];

export default function Logo({ size = 24, gap = 4, className = "" }) {
  const [activeIndices, setActiveIndices] = useState([]);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setActiveIndices([]);
    const timers = logoLetters.map((_, idx) => {
      return setTimeout(() => {
        setActiveIndices((prev) => [...prev, idx]);
      }, idx * 150);
    });

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [animationKey]);

  const handleMouseEnter = () => {
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div
      className={`navbar-logo-container ${className}`}
      onMouseEnter={handleMouseEnter}
      style={{
        display: "flex",
        alignItems: "center",
        gap: `${gap}px`,
        height: `${size}px`
      }}
    >
      {logoLetters.map((letter, idx) => {
        const isActive = activeIndices.includes(idx);
        return (
          <div
            key={letter.id}
            className="navbar-letter-box"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative"
            }}
          >
            <AnimatePresence>
              {isActive && (
                <motion.div
                  className={`navbar-letter-wrapper ${letter.type}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative"
                  }}
                >
                  <svg
                    viewBox="0 0 100 100"
                    className="navbar-letter-svg"
                    style={{
                      width: "100%",
                      height: "100%"
                    }}
                  >
                    {letter.type === "liquid" && (
                      <>
                        <defs>
                          <linearGradient id={`liquidGrad-${letter.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--color-accent-primary)" />
                            <stop offset="100%" stopColor="var(--color-accent-secondary)" />
                          </linearGradient>
                        </defs>
                        <motion.path
                          d="M 18 85 V 15 L 50 65 L 82 15 V 85"
                          fill="none"
                          stroke={`url(#liquidGrad-${letter.id})`}
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.9, ease: [0.43, 0.13, 0.23, 0.96] }}
                        />
                      </>
                    )}

                    {letter.type === "glass" && (
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="34"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.85)"
                        strokeWidth="6"
                        initial={{ pathLength: 0, scale: 0.8, rotate: -90 }}
                        animate={{ pathLength: 1, scale: 1, rotate: 270 }}
                        transition={{
                          pathLength: { duration: 1.0, ease: "easeOut" },
                          scale: { duration: 0.6, type: "spring", stiffness: 100 }
                        }}
                      />
                    )}

                    {letter.type === "reflection" && (
                      <>
                        <motion.path
                          d="M 18 15 L 50 85"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="7"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                        <motion.path
                          d="M 82 15 L 50 85"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="7"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                        />
                      </>
                    )}

                    {letter.type === "beam" && (
                      <>
                        <motion.line
                          x1="50"
                          y1="15"
                          x2="50"
                          y2="85"
                          stroke="var(--color-info)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
                          style={{ originY: 0.5 }}
                        />
                        <motion.line
                          x1="30"
                          y1="15"
                          x2="70"
                          y2="15"
                          stroke="var(--color-info)"
                          strokeWidth="4"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        />
                        <motion.line
                          x1="30"
                          y1="85"
                          x2="70"
                          y2="85"
                          stroke="var(--color-info)"
                          strokeWidth="4"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        />
                      </>
                    )}

                    {letter.type === "smoke" && (
                      <motion.path
                        d="M 80 18 H 22 V 82 H 80 M 22 50 H 70"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.9)"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ opacity: 0, filter: "blur(10px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        transition={{ duration: 0.75, ease: "easeOut" }}
                      />
                    )}

                    {letter.type === "particle" && (
                      <>
                        <motion.circle
                          cx="22"
                          cy="82"
                          r="3.5"
                          fill="#ffffff"
                          initial={{ cx: 0, cy: 0, opacity: 0 }}
                          animate={{ cx: 22, cy: 82, opacity: 1 }}
                          transition={{ duration: 0.6, type: "spring" }}
                        />
                        <motion.circle
                          cx="22"
                          cy="18"
                          r="3.5"
                          fill="#ffffff"
                          initial={{ cx: 100, cy: 0, opacity: 0 }}
                          animate={{ cx: 22, cy: 18, opacity: 1 }}
                          transition={{ duration: 0.6, type: "spring", delay: 0.03 }}
                        />
                        <motion.circle
                          cx="50"
                          cy="60"
                          r="3.5"
                          fill="#ffffff"
                          initial={{ cx: 50, cy: 100, opacity: 0 }}
                          animate={{ cx: 50, cy: 60, opacity: 1 }}
                          transition={{ duration: 0.6, type: "spring", delay: 0.06 }}
                        />
                        <motion.circle
                          cx="78"
                          cy="18"
                          r="3.5"
                          fill="#ffffff"
                          initial={{ cx: 0, cy: 100, opacity: 0 }}
                          animate={{ cx: 78, cy: 18, opacity: 1 }}
                          transition={{ duration: 0.6, type: "spring", delay: 0.09 }}
                        />
                        <motion.circle
                          cx="78"
                          cy="82"
                          r="3.5"
                          fill="#ffffff"
                          initial={{ cx: 100, cy: 100, opacity: 0 }}
                          animate={{ cx: 78, cy: 82, opacity: 1 }}
                          transition={{ duration: 0.6, type: "spring", delay: 0.12 }}
                        />
                        <motion.path
                          d="M 22 82 V 18 L 50 60 L 78 18 V 82"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.4 }}
                        />
                      </>
                    )}

                    {letter.type === "wireframe" && (
                      <>
                        <motion.path
                          d="M 18 85 L 50 15 L 82 85"
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.4)"
                          strokeWidth="2"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.7 }}
                        />
                        <motion.path
                          d="M 18 85 L 50 15 L 82 85"
                          fill="none"
                          stroke="var(--color-rating)"
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                        />
                        <motion.line
                          x1="30"
                          y1="60"
                          x2="70"
                          y2="60"
                          stroke="var(--color-rating)"
                          strokeWidth="6"
                          strokeLinecap="round"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.4, delay: 0.45 }}
                        />
                      </>
                    )}

                    {letter.type === "slash" && (
                      <>
                        <motion.line
                          x1="18"
                          y1="18"
                          x2="82"
                          y2="82"
                          stroke="var(--color-accent-primary)"
                          strokeWidth="7"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                        <motion.line
                          x1="82"
                          y1="18"
                          x2="18"
                          y2="82"
                          stroke="var(--color-accent-primary)"
                          strokeWidth="7"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                        />
                      </>
                    )}
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
