import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiBell, HiBellAlert, HiBellSlash, HiCheck, HiChevronDown, HiXMark } from "react-icons/hi2";
import { useSubscription } from "../../hooks/useSubscription";
import toast from "react-hot-toast";

export default function SubscribeButton({
  channelId,
  initialSubscribed = false,
  initialPreference = "all",
  initialSubscribersCount = 0,
  onSubScribeChange
}) {
  const {
    isSubscribed,
    notificationPreference: preference,
    subscribersCount,
    subscribe,
    unsubscribe,
    setPreference
  } = useSubscription(channelId, {
    isSubscribed: initialSubscribed,
    notificationPreference: initialPreference,
    subscribersCount: initialSubscribersCount
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubscribeClick = async (e) => {
    e.stopPropagation();
    if (loading) return;

    if (!isSubscribed) {
      setLoading(true);
      try {
        await subscribe("all");
        toast.success("Subscribed successfully");
        if (onSubScribeChange) onSubScribeChange(true);
      } catch (err) {
        toast.error(typeof err === "string" ? err : "Failed to subscribe");
      } finally {
        setLoading(false);
      }
    } else {
      setShowDropdown(!showDropdown);
    }
  };

  const handlePreferenceChange = async (pref, e) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    setShowDropdown(false);

    try {
      await setPreference(pref);
      toast.success(`Notifications set to ${pref}`);
    } catch (err) {
      toast.error("Failed to update notification preference");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (e) => {
    e.stopPropagation();
    if (loading) return;

    setShowDropdown(false);
    setLoading(true);

    try {
      await unsubscribe();
      toast.success("Unsubscribed successfully");
      if (onSubScribeChange) onSubScribeChange(false);
    } catch (err) {
      toast.error("Failed to unsubscribe");
    } finally {
      setLoading(false);
    }
  };

  const getBellIcon = () => {
    if (preference === "all") return <HiBellAlert size={18} />;
    if (preference === "personalized") return <HiBell size={18} />;
    return <HiBellSlash size={18} />;
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }} ref={dropdownRef}>
      <motion.button
        onClick={handleSubscribeClick}
        className={isSubscribed ? "" : "uiverse-glow-button"}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        aria-label={isSubscribed ? "Subscription options" : "Subscribe to channel"}
        style={
          isSubscribed
            ? {
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 22px",
                borderRadius: 24,
                fontSize: 14,
                fontWeight: 600,
                border: "1px solid rgba(255, 255, 255, 0.2)",
                cursor: "pointer",
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                backdropFilter: "blur(12px)",
                outline: "none"
              }
            : {}
        }
      >
        {isSubscribed ? (
          <>
            {getBellIcon()}
            <span>Subscribed</span>
            <HiChevronDown size={14} style={{ transform: showDropdown ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </>
        ) : (
          <span>Subscribe</span>
        )}
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              zIndex: 99,
              width: 210,
              backgroundColor: "rgba(18, 18, 18, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 12,
              padding: 6,
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              backdropFilter: "blur(20px)"
            }}
          >
            <button
              onClick={(e) => handlePreferenceChange("all", e)}
              style={dropdownItemStyle}
            >
              <HiBellAlert size={16} style={{ marginRight: 10 }} />
              <span style={{ flex: 1, textAlign: "left" }}>All Notifications</span>
              {preference === "all" && <HiCheck size={14} />}
            </button>

            <button
              onClick={(e) => handlePreferenceChange("personalized", e)}
              style={dropdownItemStyle}
            >
              <HiBell size={16} style={{ marginRight: 10 }} />
              <span style={{ flex: 1, textAlign: "left" }}>Personalized</span>
              {preference === "personalized" && <HiCheck size={14} />}
            </button>

            <button
              onClick={(e) => handlePreferenceChange("none", e)}
              style={dropdownItemStyle}
            >
              <HiBellSlash size={16} style={{ marginRight: 10 }} />
              <span style={{ flex: 1, textAlign: "left" }}>None</span>
              {preference === "none" && <HiCheck size={14} />}
            </button>

            <div style={{ height: 1, backgroundColor: "rgba(255, 255, 255, 0.1)", margin: "4px 0" }} />

            <button
              onClick={handleUnsubscribe}
              style={{ ...dropdownItemStyle, color: "#E50914" }}
            >
              <HiXMark size={16} style={{ marginRight: 10 }} />
              <span style={{ flex: 1, textAlign: "left" }}>Unsubscribe</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const dropdownItemStyle = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 500,
  color: "#E2E2E2",
  backgroundColor: "transparent",
  border: "none",
  cursor: "pointer",
  transition: "background-color 0.2s",
  outline: "none",
  ":hover": {
    backgroundColor: "rgba(255, 255, 255, 0.08)"
  }
};
