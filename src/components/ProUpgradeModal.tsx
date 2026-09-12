"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Award, Zap, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { useProStore } from "@/lib/proStore";

const PRO_PERKS = [
  "Unlimited Access to All Pro Masterclasses & Video Lessons",
  "Unlimited Community Video Shots & Cover Uploads",
  "Downloadable Guitar Tab & Chord Sheet PDFs",
  "Full 15-Fret Scales, Arpeggios & CAGED Fretboard Visualizers",
  "Studio Backing Tracks & Practice Audio Looper",
  "Verified Pro Musician Badge on your Community Profile",
];

export default function ProUpgradeModal() {
  const { isPro, proModalOpen, proFeatureRequested, closeProModal, setPro } = useProStore();
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");
  const [loading, setLoading] = useState(false);

  if (!proModalOpen) return null;

  const handleDemoUnlock = () => {
    setLoading(true);
    setTimeout(() => {
      setPro(true);
      setLoading(false);
      closeProModal();
    }, 400);
  };

  const handleStripeCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: billingCycle }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // In demo / fallback mode
        setPro(true);
        closeProModal();
      }
    } catch {
      setPro(true);
      closeProModal();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeProModal}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(5, 5, 8, 0.85)",
            backdropFilter: "blur(16px)",
          }}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 480,
            background: "rgba(16, 16, 22, 0.98)",
            border: "1px solid rgba(245, 166, 35, 0.3)",
            borderRadius: 24,
            padding: "32px 28px",
            boxShadow: "0 24px 64px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 166, 35, 0.15)",
            overflow: "hidden",
          }}
        >
          {/* Top Gradient Ribbon */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg, var(--amber), #ff8a00, var(--purple))",
            }}
          />

          {/* Close Button */}
          <button
            onClick={closeProModal}
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border)",
              color: "var(--t3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 20,
                background: "rgba(245, 166, 35, 0.15)",
                color: "var(--amber)",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              <Sparkles size={12} /> GeetHub Pro
            </div>
            <h2 style={{ fontFamily: "var(--f-display)", fontSize: 26, fontWeight: 900, margin: "0 0 6px 0" }}>
              Unlock {proFeatureRequested || "Everything in GeetHub"}
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--t3)", margin: 0 }}>
              Join thousands of guitarists mastering the fretboard faster.
            </p>
          </div>

          {/* Perks List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {PRO_PERKS.map((perk, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "rgba(245, 166, 35, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--amber)",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <Check size={12} />
                </div>
                <span style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.4 }}>{perk}</span>
              </div>
            ))}
          </div>

          {/* Pricing Toggle */}
          <div
            style={{
              display: "flex",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: 12,
              padding: 4,
              border: "1px solid var(--border)",
              marginBottom: 20,
            }}
          >
            <button
              onClick={() => setBillingCycle("annual")}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: 8,
                background: billingCycle === "annual" ? "rgba(245, 166, 35, 0.15)" : "transparent",
                color: billingCycle === "annual" ? "var(--amber)" : "var(--t3)",
                border: "none",
                fontWeight: 800,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Annual ($4.99/mo) · Save 50%
            </button>
            <button
              onClick={() => setBillingCycle("monthly")}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: 8,
                background: billingCycle === "monthly" ? "rgba(245, 166, 35, 0.15)" : "transparent",
                color: billingCycle === "monthly" ? "var(--amber)" : "var(--t3)",
                border: "none",
                fontWeight: 800,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Monthly ($9.99/mo)
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Instant Demo Pass */}
            <button
              onClick={handleDemoUnlock}
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 14,
                background: "var(--amber)",
                color: "#000",
                fontWeight: 900,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Zap size={16} /> Activate 1-Click Pro Pass
                </>
              )}
            </button>

            {/* Stripe Checkout Button */}
            <button
              onClick={handleStripeCheckout}
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 14,
                background: "rgba(255, 255, 255, 0.05)",
                color: "var(--t2)",
                fontWeight: 700,
                fontSize: 13,
                border: "1px solid var(--border)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <ShieldCheck size={15} /> Checkout with Stripe
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
