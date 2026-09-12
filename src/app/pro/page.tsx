"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, Zap, ShieldCheck, ArrowRight, Star } from "lucide-react";
import { useProStore } from "@/lib/proStore";

const COMPARISON = [
  { feature: "Access to 174,000+ Songs & Chords", free: true, pro: true },
  { feature: "Interactive Auto-Scroll & Transpose", free: true, pro: true },
  { feature: "Guitar Chord Dictionary & Voicings", free: "Basic", pro: "Full 2,700+" },
  { feature: "Reverse Chord Identifier", free: "Limited", pro: "Unlimited" },
  { feature: "Scales & Modes Visualizer (15 Frets)", free: "Pentatonic only", pro: "All 10 Modes" },
  { feature: "Full Masterclasses & Video Courses", free: false, pro: true },
  { feature: "Community Video Shots & Riff Uploads", free: "1 per month", pro: "Unlimited" },
  { feature: "Verified Pro Musician Profile Badge", free: false, pro: true },
  { feature: "Downloadable Tab & Chord Sheet PDFs", free: false, pro: true },
  { feature: "Completely Ad-Free Experience", free: false, pro: true },
];

export default function ProPricingPage() {
  const { isPro, setPro, openProModal } = useProStore();
  const [annual, setAnnual] = useState(true);

  return (
    <div style={{ minHeight: "100vh", background: "var(--obsidian)", color: "var(--t1)", paddingTop: 100, paddingBottom: 100 }}>
      <div className="container" style={{ maxWidth: 1000 }}>
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 56px auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 20,
              background: "rgba(245, 166, 35, 0.15)",
              color: "var(--amber)",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            <Sparkles size={14} /> GeetHub Pro Membership
          </div>

          <h1
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "clamp(34px, 5vw, 56px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Supercharge Your <br />
            <span style={{ color: "var(--amber)" }}>Guitar Journey</span>
          </h1>

          <p style={{ fontSize: 16, color: "var(--t3)", lineHeight: 1.6 }}>
            Masterclasses, unlimited video sharing, full interactive scale visualizers, and backing tracks to play your best.
          </p>

          {/* Billing Switch */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: 30,
              padding: 4,
              border: "1px solid var(--border)",
              marginTop: 24,
            }}
          >
            <button
              onClick={() => setAnnual(true)}
              style={{
                padding: "8px 20px",
                borderRadius: 24,
                background: annual ? "var(--amber)" : "transparent",
                color: annual ? "#000" : "var(--t3)",
                fontWeight: 800,
                fontSize: 13,
                border: "none",
                cursor: "pointer",
              }}
            >
              Annual (Save 50%)
            </button>
            <button
              onClick={() => setAnnual(false)}
              style={{
                padding: "8px 20px",
                borderRadius: 24,
                background: !annual ? "var(--amber)" : "transparent",
                color: !annual ? "#000" : "var(--t3)",
                fontWeight: 800,
                fontSize: 13,
                border: "none",
                cursor: "pointer",
              }}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, marginBottom: 64 }}>
          {/* Free Tier */}
          <div
            style={{
              background: "rgba(18, 18, 24, 0.8)",
              border: "1px solid var(--border)",
              borderRadius: 24,
              padding: 36,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--t4)", textTransform: "uppercase" }}>
              Standard
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "12px 0 16px 0" }}>
              <span style={{ fontSize: 48, fontWeight: 900, fontFamily: "var(--f-mono)" }}>$0</span>
              <span style={{ color: "var(--t3)", fontSize: 14 }}>free forever</span>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--t3)", lineHeight: 1.5, marginBottom: 28 }}>
              Essential chord sheets, auto-scroll, and basic guitar tuner.
            </p>

            <button
              disabled
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 12,
                background: "rgba(255, 255, 255, 0.05)",
                color: "var(--t3)",
                fontWeight: 800,
                fontSize: 14,
                border: "none",
                marginBottom: 28,
              }}
            >
              Current Free Plan
            </button>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["174k Songs & Chords", "Standard Guitar Tuner", "Transpose & Auto-Scroll"].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Check size={16} style={{ color: "#4cd137" }} />
                  <span style={{ fontSize: 13, color: "var(--t2)" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tier (Featured) */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(245, 166, 35, 0.1), rgba(18, 18, 24, 0.98))",
              border: "2px solid var(--amber)",
              borderRadius: 24,
              padding: 36,
              position: "relative",
              boxShadow: "0 20px 60px rgba(245, 166, 35, 0.2)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -12,
                right: 24,
                padding: "4px 14px",
                borderRadius: 20,
                background: "var(--amber)",
                color: "#000",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              RECOMMENDED
            </div>

            <span style={{ fontSize: 12, fontWeight: 800, color: "var(--amber)", textTransform: "uppercase" }}>
              GeetHub Pro
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "12px 0 16px 0" }}>
              <span style={{ fontSize: 48, fontWeight: 900, fontFamily: "var(--f-mono)", color: "#fff" }}>
                {annual ? "$4.99" : "$9.99"}
              </span>
              <span style={{ color: "var(--t3)", fontSize: 14 }}>/ month {annual ? "(billed annually)" : ""}</span>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--t2)", lineHeight: 1.5, marginBottom: 28 }}>
              Full access to masterclasses, unlimited video sharing, and professional guitar tutor tools.
            </p>

            <button
              onClick={() => openProModal("GeetHub Pro")}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 14,
                background: "var(--amber)",
                color: "#000",
                fontWeight: 900,
                fontSize: 15,
                border: "none",
                cursor: "pointer",
                marginBottom: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 20px rgba(245, 166, 35, 0.4)",
              }}
            >
              {isPro ? (
                <>
                  <Check size={16} /> Pro Membership Active
                </>
              ) : (
                <>
                  <Zap size={16} /> Get Pro Access <ArrowRight size={16} />
                </>
              )}
            </button>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "All Video Masterclasses & Courses",
                "Unlimited Community Video Uploads",
                "Full Scales, Modes & Arpeggios Suite",
                "Verified Pro Musician Profile Badge",
                "Ad-Free Strumming Experience",
              ].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Check size={16} style={{ color: "var(--amber)" }} />
                  <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full Feature Comparison Table */}
        <div
          style={{
            background: "rgba(18, 18, 24, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 24,
            padding: 32,
            overflowX: "auto",
          }}
        >
          <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>Compare All Features</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", color: "var(--t3)", fontSize: 13 }}>Feature</th>
                <th style={{ padding: "12px 16px", color: "var(--t3)", fontSize: 13, width: 140 }}>Free</th>
                <th style={{ padding: "12px 16px", color: "var(--amber)", fontSize: 13, width: 140 }}>Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <td style={{ padding: "14px 16px", fontSize: 13.5, color: "var(--t2)" }}>{row.feature}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--t3)" }}>
                    {typeof row.free === "boolean" ? (row.free ? <Check size={16} color="#4cd137" /> : "—") : row.free}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--amber)", fontWeight: 700 }}>
                    {typeof row.pro === "boolean" ? (row.pro ? <Check size={16} color="var(--amber)" /> : "—") : row.pro}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
