import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { HiMenu, HiX, HiBell, HiUser, HiSparkles, HiCheckCircle, HiHeart, HiCog, HiLogout, HiFilm } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { notificationAPI, movieAPI } from "../../services/api";
import {
  navbarVariants,
  mobileMenuContainerVariants,
  mobileMenuItemVariants,
  navActionIconVariants
} from "../../animations";
import "../../css/Navbar.css";
import Logo from "./Logo";
import UiverseSearchInput from "./UiverseSearchInput";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchPreview, setShowSearchPreview] = useState(false);
  const [notifCount, setNotifCount] = useState(3);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef(null);
  const searchContainerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifCount(0);
      return;
    }
    notificationAPI.getUnreadCount()
      .then(({ data }) => setNotifCount(data?.data?.count || 0))
      .catch(() => setNotifCount(0));
  }, [user]);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearchPreview(false);
      return;
    }
    const timer = setTimeout(() => {
      movieAPI.getAll({ search: searchQuery, limit: 5 })
        .then(({ data }) => {
          const results = data?.data || [];
          setSearchResults(Array.isArray(results) ? results.slice(0, 5) : []);
          setShowSearchPreview(true);
        })
        .catch(() => setSearchResults([]));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchPreview(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setShowSearchPreview(false);
        setShowNotifMenu(false);
        setDropdownOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchPreview(false);
    }
  };

  const handleSelectResult = (item) => {
    setShowSearchPreview(false);
    setSearchQuery("");
    const type = item.type || "Movie";
    const path = type === "Movie" ? `/movies/${item.slug}` : type === "TvShow" ? `/tv-shows/${item.slug}` : `/web-series/${item.slug}`;
    navigate(path);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/");
  };

  const openDropdown = () => {
    clearTimeout(dropdownTimeoutRef.current);
    setDropdownOpen(true);
  };

  const closeDropdown = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 200);
  };

  const closeMenu = () => setMenuOpen(false);

  const [notifications, setNotifications] = useState([]);

  const renderNavLinks = () => (
    <>
      <NavLink to="/" className="nav-link" onClick={closeMenu} end>
        {({ isActive }) => (
          <>
            <span>Home</span>
            {isActive && (
              <motion.span
                layoutId="nav-pill"
                className="nav-link-underline-fm"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "999px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  zIndex: -1
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </>
        )}
      </NavLink>
      <NavLink to="/movies" className="nav-link" onClick={closeMenu}>
        {({ isActive }) => (
          <>
            <span>Movies</span>
            {isActive && (
              <motion.span
                layoutId="nav-pill"
                className="nav-link-underline-fm"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "999px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  zIndex: -1
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </>
        )}
      </NavLink>
      <NavLink to="/tv-shows" className="nav-link" onClick={closeMenu}>
        {({ isActive }) => (
          <>
            <span>TV Shows</span>
            {isActive && (
              <motion.span
                layoutId="nav-pill"
                className="nav-link-underline-fm"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "999px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  zIndex: -1
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </>
        )}
      </NavLink>

      <NavLink to="/categories" className="nav-link" onClick={closeMenu}>
        {({ isActive }) => (
          <>
            <span>Categories</span>
            {isActive && (
              <motion.span
                layoutId="nav-pill"
                className="nav-link-underline-fm"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "999px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  zIndex: -1
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </>
        )}
      </NavLink>
      <div className="navbar-links-extras">
        <Link to="/ai/script" className="nav-link nav-link-ai" onClick={closeMenu}>
          <HiSparkles style={{ color: "#00D4FF" }} /> AI Studio
        </Link>
      </div>
    </>
  );

  return (
    <motion.nav
      className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <Logo size={24} gap={6} />
          </Link>
        </div>

        {!isMobile && (
          <div className="navbar-links">
            {renderNavLinks()}
          </div>
        )}

        <AnimatePresence>
          {isMobile && menuOpen && (
            <>
              <motion.div
                className="navbar-overlay"
                onClick={closeMenu}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ zIndex: 998 }}
              />
              <motion.div
                className="navbar-links open"
                variants={mobileMenuContainerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ zIndex: 999 }}
              >
                <motion.div variants={mobileMenuItemVariants}>
                  <NavLink to="/" className="nav-link" onClick={closeMenu} end>Home</NavLink>
                </motion.div>
                <motion.div variants={mobileMenuItemVariants}>
                  <NavLink to="/movies" className="nav-link" onClick={closeMenu}>Movies</NavLink>
                </motion.div>
                <motion.div variants={mobileMenuItemVariants}>
                  <NavLink to="/tv-shows" className="nav-link" onClick={closeMenu}>TV Shows</NavLink>
                </motion.div>
                <motion.div variants={mobileMenuItemVariants}>
                  <NavLink to="/categories" className="nav-link" onClick={closeMenu}>Categories</NavLink>
                </motion.div>
                <motion.div className="navbar-links-extras" variants={mobileMenuItemVariants}>
                  <Link to="/ai/script" className="nav-link nav-link-ai" onClick={closeMenu}>
                    <HiSparkles /> AI Studio
                  </Link>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="navbar-right">
          <div className="navbar-actions">
            <div className="search-container-wrap" ref={searchContainerRef} style={{ position: "relative" }}>
              <UiverseSearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSubmit={handleSearch}
                onFocus={() => { if (searchResults.length) setShowSearchPreview(true); }}
                placeholder="Search titles..."
              />

              <AnimatePresence>
                {showSearchPreview && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 12px)",
                      right: 0,
                      width: "320px",
                      background: "rgba(16, 18, 23, 0.92)",
                      backdropFilter: "blur(28px) saturate(180%)",
                      WebkitBackdropFilter: "blur(28px) saturate(180%)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "20px",
                      padding: "12px",
                      boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
                      zIndex: 1200
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#A8B0C0", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px", paddingLeft: "4px" }}>
                      Instant Matches
                    </div>
                    {searchResults.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleSelectResult(item)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "8px",
                          borderRadius: "12px",
                          cursor: "pointer",
                          transition: "background 0.2s ease"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <img
                          src={item.poster?.url || item.banner?.url}
                          alt=""
                          style={{ width: "42px", height: "56px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, overflow: "hidden" }}>
                          <div style={{ color: "#fff", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.title}
                          </div>
                          <div style={{ color: "#A8B0C0", fontSize: "11px", display: "flex", gap: "8px", marginTop: "2px" }}>
                            <span>{item.releaseYear}</span>
                            <span>•</span>
                            <span style={{ color: "#FFC107" }}> {item.imdbRating || "8.9"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div style={{ position: "relative" }}>
              <motion.button
                className="nav-icon-btn"
                onClick={() => setShowNotifMenu((prev) => !prev)}
                variants={navActionIconVariants}
                whileHover="hover"
                whileTap="tap"
                aria-label="Notifications"
              >
                <HiBell />
                {notifCount > 0 && (
                  <span className="notif-badge" aria-live="polite">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 12px)",
                      right: 0,
                      width: "320px",
                      background: "rgba(16, 18, 23, 0.95)",
                      backdropFilter: "blur(28px) saturate(180%)",
                      WebkitBackdropFilter: "blur(28px) saturate(180%)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "20px",
                      padding: "16px",
                      boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
                      zIndex: 1200
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>Notifications</span>
                      <span
                        style={{ color: "#E50914", fontSize: "11px", cursor: "pointer", fontWeight: 600 }}
                        onClick={() => { setNotifCount(0); setShowNotifMenu(false); }}
                      >
                        Mark all read
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {notifications && notifications.length > 0 ? (
                        notifications.slice(0, 5).map((n) => (
                          <div key={n._id || n.id} style={{ background: "rgba(255,255,255,0.04)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>{n.title}</div>
                            <div style={{ color: "#A8B0C0", fontSize: "11px", marginTop: "2px" }}>{n.message}</div>
                            <div style={{ color: "#717A8C", fontSize: "10px", marginTop: "4px" }}>{new Date(n.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: "#717A8C", fontSize: "12px", textAlign: "center", padding: "16px 0" }}>
                          No unread notifications
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <div
                className="user-menu"
                onMouseEnter={openDropdown}
                onMouseLeave={closeDropdown}
              >
                <motion.button
                  className="nav-icon-btn nav-avatar-btn"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-label="User menu"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  variants={navActionIconVariants}
                  whileHover="hover"
                  whileTap="tap"
                  style={{
                    border: "2px solid rgba(229, 9, 20, 0.6)",
                    boxShadow: "0 0 16px rgba(229, 9, 20, 0.3)"
                  }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="nav-avatar" />
                  ) : (
                    <HiUser />
                  )}
                </motion.button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      className="user-dropdown open"
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.2 }}
                      role="menu"
                      style={{
                        width: "240px",
                        padding: "12px",
                        background: "rgba(16, 18, 23, 0.95)",
                        backdropFilter: "blur(28px) saturate(180%)",
                        border: "1px solid rgba(255, 255, 255, 0.14)",
                        borderRadius: "22px"
                      }}
                    >
                      <div style={{ padding: "8px 12px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "8px" }}>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>{user.name || "Cinema Fan"}</div>
                        <div style={{ color: "#A8B0C0", fontSize: "11px" }}>{user.email}</div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(229, 9, 20, 0.15)", color: "#E50914", padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: 700, marginTop: "6px" }}>
                          <HiCheckCircle /> PREMIUM 4K HDR
                        </div>
                      </div>

                      <Link to="/profile" className="dropdown-item" role="menuitem" onClick={() => setDropdownOpen(false)}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><HiUser /> Profile</span>
                      </Link>
                      <Link to="/watchlist" className="dropdown-item" role="menuitem" onClick={() => setDropdownOpen(false)}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><HiFilm /> Watchlist</span>
                      </Link>
                      <Link to="/favorites" className="dropdown-item" role="menuitem" onClick={() => setDropdownOpen(false)}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><HiHeart /> Favorites</span>
                      </Link>
                      <Link to="/settings" className="dropdown-item" role="menuitem" onClick={() => setDropdownOpen(false)}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><HiCog /> Settings</span>
                      </Link>
                      {user.role === "admin" && (
                        <Link to="/admin" className="dropdown-item" role="menuitem" onClick={() => setDropdownOpen(false)}>
                          <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#00D4FF" }}> Admin Dashboard</span>
                        </Link>
                      )}
                      <hr className="dropdown-divider" />
                      <button onClick={handleLogout} className="dropdown-item" role="menuitem" style={{ color: "#EF4444" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><HiLogout /> Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="auth-buttons">
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} style={{ display: "inline-block" }}>
                  <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} style={{ display: "inline-block" }}>
                  <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
                </motion.div>
              </div>
            )}

            <button
              className="menu-toggle"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <HiMenu className="menu-icon-closed" style={{ transform: menuOpen ? "rotate(-90deg)" : "rotate(0deg)", opacity: menuOpen ? 0 : 1 }} />
              <HiX className="menu-icon-open" style={{ transform: menuOpen ? "rotate(0deg)" : "rotate(90deg)", opacity: menuOpen ? 1 : 0 }} />
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
