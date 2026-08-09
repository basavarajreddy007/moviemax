import { NavLink } from "react-router-dom";
import { HiHome, HiSearch, HiBookmark, HiSparkles, HiUser } from "react-icons/hi";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

export default function MobileBottomNav() {
  const { user } = useAuth();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        right: 16,
        height: 64,
        zIndex: 1000,
        display: "none"
      }}
      className="mobile-bottom-nav-wrap"
    >
      <div
        style={{
          height: "100%",
          width: "100%",
          background: "rgba(16, 18, 23, 0.85)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 8px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(229, 9, 20, 0.15)"
        }}
      >
        <NavLink
          to="/"
          end
          style={({ isActive }) => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            color: isActive ? "#E50914" : "#A8B0C0",
            fontSize: 11,
            fontWeight: 600,
            textDecoration: "none"
          })}
        >
          <HiHome style={{ fontSize: 22 }} />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/search"
          style={({ isActive }) => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            color: isActive ? "#E50914" : "#A8B0C0",
            fontSize: 11,
            fontWeight: 600,
            textDecoration: "none"
          })}
        >
          <HiSearch style={{ fontSize: 22 }} />
          <span>Search</span>
        </NavLink>

        <NavLink
          to="/ai/script"
          style={({ isActive }) => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            color: isActive ? "#00D4FF" : "#A8B0C0",
            fontSize: 11,
            fontWeight: 600,
            textDecoration: "none"
          })}
        >
          <HiSparkles style={{ fontSize: 22 }} />
          <span>AI Studio</span>
        </NavLink>

        <NavLink
          to="/watchlist"
          style={({ isActive }) => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            color: isActive ? "#E50914" : "#A8B0C0",
            fontSize: 11,
            fontWeight: 600,
            textDecoration: "none"
          })}
        >
          <HiBookmark style={{ fontSize: 22 }} />
          <span>Watchlist</span>
        </NavLink>

        <NavLink
          to={user ? "/profile" : "/login"}
          style={({ isActive }) => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            color: isActive ? "#E50914" : "#A8B0C0",
            fontSize: 11,
            fontWeight: 600,
            textDecoration: "none"
          })}
        >
          <HiUser style={{ fontSize: 22 }} />
          <span>{user ? "Profile" : "Sign In"}</span>
        </NavLink>
      </div>
    </div>
  );
}
