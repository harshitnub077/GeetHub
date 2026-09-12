"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { X, Guitar, Sparkles, User, ArrowRight, Music2, Loader2 } from "lucide-react";
import Logo from "./Logo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [musicianName, setMusicianName] = useState("");
  const [loading, setLoading] = useState<"google" | "guest" | null>(null);
  const [error, setError] = useState("");

  const handleGuestSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("guest");
    setError("");

    try {
      const res = await signIn("guest", {
        username: musicianName.trim() || "Musician",
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        onClose();
      }
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleSignIn = () => {
    setLoading("google");
    setError("");
    signIn("google", { callbackUrl: window.location.href });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
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
            onClick={onClose}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(5, 5, 8, 0.8)",
              backdropFilter: "blur(16px)",
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 420,
              background: "rgba(14, 14, 20, 0.96)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 24,
              padding: "32px 28px",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(245, 166, 35, 0.15)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Gradient */}
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
              onClick={onClose}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "var(--t3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--t3)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 26 }}>
              <div style={{ display: "inline-flex", marginBottom: 12 }}>
                <Logo size={36} />
              </div>
              <h2
                style={{
                  fontFamily: "var(--f-display)",
                  fontWeight: 900,
                  fontSize: 24,
                  letterSpacing: "-0.03em",
                  color: "#fff",
                  margin: "0 0 6px 0",
                }}
              >
                Welcome to Geet<span style={{ color: "var(--amber)" }}>hub</span>
              </h2>
              <p style={{ fontSize: 13.5, color: "var(--t3)", margin: 0, lineHeight: 1.4 }}>
                Sign in to save favorite chords, transpose keys, and contribute tabs.
              </p>
            </div>

            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(255, 77, 79, 0.1)",
                  border: "1px solid rgba(255, 77, 79, 0.25)",
                  color: "#ff4d4f",
                  fontSize: 12.5,
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            {/* Quick Musician Form */}
            <form onSubmit={handleGuestSignIn} style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--amber)",
                  marginBottom: 8,
                }}
              >
                Instant Musician Access
              </label>

              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <User
                    size={16}
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--t3)",
                    }}
                  />
                  <input
                    type="text"
                    value={musicianName}
                    onChange={(e) => setMusicianName(e.target.value)}
                    placeholder="Enter your name / alias"
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 38px",
                      borderRadius: 12,
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading !== null}
                  style={{
                    padding: "0 18px",
                    borderRadius: 12,
                    background: "var(--amber)",
                    color: "#000",
                    border: "none",
                    fontWeight: 800,
                    fontSize: 13.5,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexShrink: 0,
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {loading === "guest" ? <Loader2 size={16} className="animate-spin" /> : <>Enter <ArrowRight size={14} /></>}
                </button>
              </div>
              <p style={{ fontSize: 11, color: "var(--t4)", margin: 0 }}>
                1-click instant login. No password required.
              </p>
            </form>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "20px 0",
              }}
            >
              <div style={{ flex: 1, height: 1, background: "rgba(255, 255, 255, 0.08)" }} />
              <span style={{ fontSize: 11, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                or
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(255, 255, 255, 0.08)" }} />
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading !== null}
              style={{
                width: "100%",
                padding: "13px 18px",
                borderRadius: 12,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.09)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
              }}
            >
              {loading === "google" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
