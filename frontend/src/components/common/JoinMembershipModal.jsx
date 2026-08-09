import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiXMark, HiCheck, HiStar, HiSparkles, HiShieldCheck } from "react-icons/hi2";
import { channelAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

export default function JoinMembershipModal({ channelId, isOpen, onClose, channelName }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tiers, setTiers] = useState([]);
  const [selectedTier, setSelectedTier] = useState(null);
  const [activeMembership, setActiveMembership] = useState(null);

  useEffect(() => {
    if (!isOpen || !channelId) return;

    const fetchMemberships = async () => {
      setLoading(true);
      try {
        const { data } = await channelAPI.getMemberships(channelId);
        if (data.success) {
          setTiers(data.data.tiers || []);
          setActiveMembership(data.data.activeMembership || null);
          if (data.data.tiers?.length > 0) {
            setSelectedTier(data.data.tiers[0]);
          }
        }
      } catch (err) {
        console.error("Fetch memberships error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberships();
  }, [isOpen, channelId]);

  if (!isOpen) return null;

  const handleJoin = async () => {
    if (!user) {
      toast.error("Please sign in to join channel membership");
      return;
    }

    if (!selectedTier) return;
    setSubmitting(true);

    try {
      const { data } = await channelAPI.joinMembership(channelId, {
        tierName: selectedTier.name,
        price: selectedTier.price,
        badge: selectedTier.badge
      });

      if (data.success) {
        toast.success(data.message || `Welcome to ${selectedTier.name}!`);
        setActiveMembership(data.data);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to join membership tier");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!activeMembership) return;
    setSubmitting(true);

    try {
      const { data } = await channelAPI.cancelMembership(channelId);
      if (data.success) {
        toast.success("Channel membership cancelled");
        setActiveMembership(null);
      }
    } catch (err) {
      toast.error("Failed to cancel membership");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16
        }}
      >

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(12px)"
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 620,
            maxHeight: "90vh",
            overflowY: "auto",
            backgroundColor: "#121216",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 24,
            padding: 28,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
            color: "#ffffff"
          }}
        >

          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              background: "rgba(255, 255, 255, 0.08)",
              border: "none",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
          >
            <HiXMark size={20} />
          </button>

          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 20,
              backgroundColor: "rgba(229, 9, 20, 0.15)",
              color: "#E50914",
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 12
            }}>
              <HiSparkles /> CHANNEL MEMBERSHIP
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>
              Join {channelName || "Creator Channel"}
            </h2>
            <p style={{ fontSize: 14, color: "#A8B0C0", marginTop: 6, margin: 0 }}>
              Unlock exclusive creator perks, loyalty badges, and members-only content
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
              Loading membership tiers...
            </div>
          ) : activeMembership ? (
            <div style={{
              background: "rgba(0, 212, 255, 0.06)",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              borderRadius: 16,
              padding: 20,
              textAlign: "center"
            }}>
              <HiShieldCheck size={44} style={{ color: "#00D4FF", marginBottom: 10 }} />
              <h3 style={{ margin: 0, fontSize: 18 }}>You are a Member!</h3>
              <p style={{ color: "#A8B0C0", fontSize: 13, marginTop: 4 }}>
                Tier: <strong style={{ color: "#fff" }}>{activeMembership.tierName}</strong> ({activeMembership.badge})
              </p>
              <button
                onClick={handleCancel}
                disabled={submitting}
                style={{
                  marginTop: 16,
                  padding: "10px 20px",
                  borderRadius: 20,
                  backgroundColor: "rgba(229, 9, 20, 0.2)",
                  color: "#E50914",
                  border: "1px solid rgba(229, 9, 20, 0.3)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                {submitting ? "Cancelling..." : "Cancel Membership"}
              </button>
            </div>
          ) : (
            <>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
                {tiers.map((tier) => {
                  const isSelected = selectedTier?.id === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(tier)}
                      style={{
                        padding: 16,
                        borderRadius: 16,
                        border: isSelected
                          ? "2px solid #E50914"
                          : "1px solid rgba(255, 255, 255, 0.08)",
                        backgroundColor: isSelected
                          ? "rgba(229, 9, 20, 0.08)"
                          : "rgba(255, 255, 255, 0.03)",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 20 }}>{tier.badge}</span>
                          <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{tier.name}</h4>
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 800, color: "#E50914" }}>
                          ${tier.price}/mo
                        </span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                        {tier.perks.map((perk, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#C5CEE0" }}>
                            <HiCheck size={14} style={{ color: "#00D4FF", flexShrink: 0 }} />
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleJoin}
                disabled={submitting || !selectedTier}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  borderRadius: 24,
                  backgroundColor: "#E50914",
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(229, 9, 20, 0.4)",
                  transition: "transform 0.2s"
                }}
              >
                {submitting ? "Processing..." : `Join ${selectedTier?.name || ""} ($${selectedTier?.price || "2.99"}/mo)`}
              </button>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
