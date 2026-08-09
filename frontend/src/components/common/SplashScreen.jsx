import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../../css/SplashScreen.css";

const playAmbientSound = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(45, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 2.5);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 3.0);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(880, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.8);

    gain2.gain.setValueAtTime(0.001, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start();
    osc2.stop(ctx.currentTime + 1.2);
  } catch (e) {
    console.warn("Audio Context blocked or failed:", e);
  }
};

const letters = [
  { char: "M", id: "m1", type: "liquid" },
  { char: "O", id: "o", type: "glass" },
  { char: "V", id: "v", type: "reflection" },
  { char: "I", id: "i", type: "beam" },
  { char: "E", id: "e", type: "smoke" },
  { char: "M", id: "m2", type: "particle" },
  { char: "A", id: "a", type: "wireframe" },
  { char: "X", id: "x", type: "slash" }
];

export default function SplashScreen({ onFinish }) {
  const [activeIndices, setActiveIndices] = useState([]);
  const [complete, setComplete] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const audioTriggered = useRef(false);
  const userInteracted = useRef(false);
  const playPendingRef = useRef(false);

  const dustParticles = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: `${(i * 7.1 + Math.random() * 3).toFixed(1)}%`,
      top: `${(Math.random() * 90 + 5).toFixed(1)}%`,
      width: `${(Math.random() * 2 + 1).toFixed(1)}px`,
      height: `${(Math.random() * 2 + 1).toFixed(1)}px`,
      xShift: Math.random() * 16 - 8,
      duration: 3.5 + Math.random() * 2,
      delay: Math.random() * 1.5
    }));
  }, []);

  useEffect(() => {
    const handleGesture = () => {
      userInteracted.current = true;
      if (playPendingRef.current && !audioTriggered.current) {
        playAmbientSound();
        audioTriggered.current = true;
      }
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("keydown", handleGesture);
    };
    window.addEventListener("click", handleGesture);
    window.addEventListener("keydown", handleGesture);

    const stepDelay = 100;
    const startOffset = 250;

    letters.forEach((_, idx) => {
      setTimeout(() => {
        setActiveIndices((prev) => [...prev, idx]);
      }, startOffset + idx * stepDelay);
    });

    const completionTime = startOffset + letters.length * stepDelay + 250;
    const exitTime = completionTime + 650;
    const finishTime = exitTime + 450;

    const completionTimer = setTimeout(() => {
      setComplete(true);
      if (userInteracted.current) {
        if (!audioTriggered.current) {
          playAmbientSound();
          audioTriggered.current = true;
        }
      } else {
        playPendingRef.current = true;
      }
    }, completionTime);

    const exitTimer = setTimeout(() => {
      setFadeOut(true);
    }, exitTime);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, finishTime);

    return () => {
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("keydown", handleGesture);
      clearTimeout(completionTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <motion.div
      className={`splash-container ${fadeOut ? "splash-fade-out" : ""}`}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <div className="splash-ambient-bg">
        <motion.div
          className="splash-light-orb first"
          animate={{
            x: ["-20%", "20%", "-10%"],
            y: ["-20%", "10%", "20%"],
            scale: [1, 1.2, 0.9]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="splash-light-orb second"
          animate={{
            x: ["20%", "-20%", "10%"],
            y: ["20%", "-10%", "-20%"],
            scale: [1.1, 0.8, 1.2]
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="splash-dust-layer">
        {dustParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="splash-dust-particle"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.width,
              height: particle.height
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, particle.xShift, 0],
              opacity: [0.1, 0.6, 0.1]
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.delay
            }}
          />
        ))}
      </div>

      <div className="splash-logo-frame">
        <div className="splash-letters-row">
          {letters.map((letter, idx) => {
            const isActive = activeIndices.includes(idx);
            return (
              <div key={letter.id} className="splash-letter-container">
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      className={`splash-letter-wrapper ${letter.type}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <svg
                        viewBox="0 0 100 100"
                        className="splash-letter-svg"
                        style={{ width: "100%", height: "100%" }}
                      >
                        {letter.type === "liquid" && (
                          <>
                            <defs>
                              <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="var(--color-accent-primary)" />
                                <stop offset="100%" stopColor="var(--color-accent-secondary)" />
                              </linearGradient>
                            </defs>
                            <motion.path
                              d="M 18 85 V 15 L 50 65 L 82 15 V 85"
                              fill="none"
                              stroke="url(#liquidGrad)"
                              strokeWidth="7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1.1, ease: [0.43, 0.13, 0.23, 0.96] }}
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
                              pathLength: { duration: 1.2, ease: "easeOut" },
                              scale: { duration: 0.8, type: "spring", stiffness: 100 }
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
                              transition={{ duration: 0.7, ease: "easeOut" }}
                            />
                            <motion.path
                              d="M 82 15 L 50 85"
                              fill="none"
                              stroke="#ffffff"
                              strokeWidth="7"
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
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
                              transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
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
                              transition={{ duration: 0.4, delay: 0.3 }}
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
                              transition={{ duration: 0.4, delay: 0.3 }}
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
                            initial={{ opacity: 0, filter: "blur(15px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            transition={{ duration: 0.95, ease: "easeOut" }}
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
                              transition={{ duration: 0.8, type: "spring" }}
                            />
                            <motion.circle
                              cx="22"
                              cy="18"
                              r="3.5"
                              fill="#ffffff"
                              initial={{ cx: 100, cy: 0, opacity: 0 }}
                              animate={{ cx: 22, cy: 18, opacity: 1 }}
                              transition={{ duration: 0.8, type: "spring", delay: 0.05 }}
                            />
                            <motion.circle
                              cx="50"
                              cy="60"
                              r="3.5"
                              fill="#ffffff"
                              initial={{ cx: 50, cy: 100, opacity: 0 }}
                              animate={{ cx: 50, cy: 60, opacity: 1 }}
                              transition={{ duration: 0.8, type: "spring", delay: 0.1 }}
                            />
                            <motion.circle
                              cx="78"
                              cy="18"
                              r="3.5"
                              fill="#ffffff"
                              initial={{ cx: 0, cy: 100, opacity: 0 }}
                              animate={{ cx: 78, cy: 18, opacity: 1 }}
                              transition={{ duration: 0.8, type: "spring", delay: 0.15 }}
                            />
                            <motion.circle
                              cx="78"
                              cy="82"
                              r="3.5"
                              fill="#ffffff"
                              initial={{ cx: 100, cy: 100, opacity: 0 }}
                              animate={{ cx: 78, cy: 82, opacity: 1 }}
                              transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
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
                              transition={{ duration: 0.4, delay: 0.6 }}
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
                              transition={{ duration: 0.9 }}
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
                              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
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
                              transition={{ duration: 0.5, delay: 0.6 }}
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
                              transition={{ duration: 0.6, ease: "easeOut" }}
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
                              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
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

        {complete && (
          <motion.div
            className="splash-shimmer-sweep"
            initial={{ left: "-150%" }}
            animate={{ left: "150%" }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          />
        )}
      </div>

      {complete && (
        <motion.div
          className="splash-bottom-lock"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          CINEMATIC STREAMING UNIVERSE
        </motion.div>
      )}
    </motion.div>
  );
}
