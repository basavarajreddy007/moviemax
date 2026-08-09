import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AmbientBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden"
      }}
    >
      <motion.div
        animate={{
          x: mousePos.x - 250,
          y: mousePos.y - 250
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 150,
          mass: 0.5
        }}
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(229,9,20,0.06) 0%, rgba(108,92,231,0.04) 40%, transparent 70%)",
          filter: "blur(60px)"
        }}
      />
    </div>
  );
}
