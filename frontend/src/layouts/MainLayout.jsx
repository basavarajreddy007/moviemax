import { useState, useEffect } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import AmbientBackground from "../components/common/AmbientBackground";
import MobileBottomNav from "../components/common/MobileBottomNav";
import { AnimatePresence, motion } from "framer-motion";
import { HiArrowUp } from "react-icons/hi";
import AnimatedPage from "../animations/AnimatedPage";

export default function MainLayout() {
  const location = useLocation();
  const element = useOutlet();
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollBtn(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <AmbientBackground />
      <Navbar />
      <main className="main-content">
        <AnimatePresence mode="wait" initial={false}>
          <AnimatedPage key={location.pathname}>
            {element}
          </AnimatedPage>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            onClick={scrollToTop}
            className="scroll-to-top-btn"
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            whileHover={{ scale: 1.12, y: -3 }}
            whileTap={{ scale: 0.9 }}
            style={{
              position: "fixed",
              bottom: "32px",
              right: "32px",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "var(--color-accent-primary)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              boxShadow: "var(--shadow-glow-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              zIndex: 999
            }}
            aria-label="Scroll back to top"
          >
            <HiArrowUp />
          </motion.button>
        )}
      </AnimatePresence>

      <MobileBottomNav />
      <Footer />
    </>
  );
}
