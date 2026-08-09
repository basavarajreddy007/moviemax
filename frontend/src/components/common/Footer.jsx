import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaArrowUp } from "react-icons/fa";
import { motion } from "framer-motion";
import { Reveal } from "../../animations";
import { genreAPI } from "../../services/api";
import "../../css/Footer.css";
import Logo from "./Logo";

export default function Footer() {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    genreAPI.getAll().then(({ data }) => setGenres(data.data.slice(0, 5))).catch(() => {});
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer">
      <Reveal direction="up" duration={0.65} once={true} amount={0.1}>
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-section">
              <Link to="/" className="footer-logo"><Logo size={28} gap={5} /></Link>
              <p className="footer-desc">
                Your premium destination for unlimited movies, TV shows, and web series. Experience entertainment like never before.
              </p>
              <div className="social-links">
                <motion.a href="#" className="social-link" whileHover={{ scale: 1.2, rotate: 8 }} whileTap={{ scale: 0.95 }} aria-label="Facebook"><FaFacebook /></motion.a>
                <motion.a href="#" className="social-link" whileHover={{ scale: 1.2, rotate: -8 }} whileTap={{ scale: 0.95 }} aria-label="Twitter"><FaTwitter /></motion.a>
                <motion.a href="#" className="social-link" whileHover={{ scale: 1.2, rotate: 8 }} whileTap={{ scale: 0.95 }} aria-label="Instagram"><FaInstagram /></motion.a>
                <motion.a href="#" className="social-link" whileHover={{ scale: 1.2, rotate: -8 }} whileTap={{ scale: 0.95 }} aria-label="Youtube"><FaYoutube /></motion.a>
              </div>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Browse</h4>
              <Link to="/movies" className="footer-link">Movies</Link>
              <Link to="/tv-shows" className="footer-link">TV Shows</Link>
              <Link to="/categories" className="footer-link">Categories</Link>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Genres</h4>
              {genres.map((genre) => (
                <Link key={genre._id} to={`/genre/${genre._id}`} className="footer-link">{genre.name}</Link>
              ))}
              <Link to="/categories" className="footer-link">All Categories</Link>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Support</h4>
              <Link to="/about" className="footer-link">About Us</Link>
              <Link to="/contact" className="footer-link">Contact</Link>
              <Link to="/faq" className="footer-link">FAQ</Link>
              <Link to="/privacy" className="footer-link">Privacy Policy</Link>
              <Link to="/terms" className="footer-link">Terms of Service</Link>
            </div>

            <div className="footer-section newsletter">
              <h4 className="footer-heading">Newsletter</h4>
              <p className="footer-desc">Subscribe to get updates on new releases and exclusive offers.</p>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Your email" className="newsletter-input" />
                <motion.button type="submit" className="btn btn-primary btn-sm" whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>Subscribe</motion.button>
              </form>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="copyright">&copy; 2026 MOVIEMAX. All rights reserved.</p>
            <div className="footer-bottom-links">
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <Link to="/faq">Cookies</Link>
            </div>
          </div>
        </div>
      </Reveal>

      <motion.button
        className="back-to-top"
        onClick={scrollToTop}
        aria-label="Back to top"
        whileHover={{ scale: 1.15, y: -3 }}
        whileTap={{ scale: 0.9 }}
      >
        <FaArrowUp />
      </motion.button>
    </footer>
  );
}
