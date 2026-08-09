import { motion } from "framer-motion";

export default function AnimatedTitle({ text, className = "", style = {} }) {
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      }
    }
  };

  const childVariants = {
    hidden: {
      opacity: 0,
      y: 12,
      filter: "blur(3px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        y: {
          type: "spring",
          damping: 14,
          stiffness: 120
        },
        filter: {
          duration: 0.3,
          ease: "easeOut"
        },
        opacity: {
          duration: 0.25,
          ease: "easeOut"
        }
      }
    }
  };

  return (
    <motion.span
      className={`animated-title-container ${className}`}
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        ...style
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, wordIdx) => (
        <span
          key={wordIdx}
          style={{
            whiteSpace: "nowrap",
            marginRight: "0.25em",
            display: "inline-flex"
          }}
        >
          {word.split("").map((char, charIdx) => (
            <motion.span
              key={charIdx}
              variants={childVariants}
              style={{ display: "inline-block" }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  );
}
