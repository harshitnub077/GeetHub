"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Music,
  Compass,
  Volume2,
  Sliders,
  Layers,
  Sparkles,
  Search,
  Timer,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";

const TOOLS = [
  {
    title: "Guitar Chord Dictionary",
    desc: "Over 2,700 chord voicings with finger placements, intervals, CAGED variations, and real-time strum audio.",
    href: "/tools/chords",
    icon: Music,
    badge: "Most Popular",
    color: "var(--amber)",
  },
  {
    title: "Reverse Chord Identifier",
    desc: "Click frets on the interactive 6-string neck to identify mystery chords and discover their harmonic names.",
    href: "/tools/chord-identifier",
    icon: Search,
    badge: "Smart AI",
    color: "var(--purple)",
  },
  {
    title: "Scales & Modes Explorer",
    desc: "Interactive visualizer for Pentatonic, Blues, Dorian, Mixolydian, Harmonic Minor, and 3-Notes-Per-String boxes.",
    href: "/tools/scales",
    icon: Layers,
    badge: "Fretboard Mastery",
    color: "#00d2ff",
  },
  {
    title: "Guitar Arpeggios",
    desc: "Master sweeps and chord tones with interactive arpeggio shape diagrams across the neck.",
    href: "/tools/arpeggios",
    icon: Sparkles,
    badge: "Soloing Tool",
    color: "#ff5252",
  },
  {
    title: "Chord Progressions Studio",
    desc: "Generate and jam along with classic progressions (I-IV-V, ii-V-I) with interactive audio playback.",
    href: "/tools/progressions",
    icon: Sliders,
    badge: "Jam Studio",
    color: "#4cd137",
  },
  {
    title: "Online Guitar Tuner",
    desc: "Tune by ear with synthesized guitar pitch standards, or enable microphone pitch detection.",
    href: "/tools/tuner",
    icon: Volume2,
    badge: "Precision Audio",
    color: "var(--amber)",
  },
  {
    title: "Interactive Circle of 5ths",
    desc: "Visual harmonic wheel showing key signatures, relative minors, tonic, subdominant, and dominant relationships.",
    href: "/tools/circle-of-fifths",
    icon: Compass,
    badge: "Music Theory",
    color: "var(--purple)",
  },
  {
    title: "Pro Metronome",
    desc: "Keep rock-solid timing with tap tempo, accented beats, visual pulses, and time signature support.",
    href: "/tools/metronome",
    icon: Timer,
    badge: "Essential",
    color: "#00d2ff",
  },
];

export default function ToolsHubPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--obsidian)", color: "var(--t1)", paddingTop: 100, paddingBottom: 100 }}>
      {/* Background Glow */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "1000px",
          height: "400px",
          background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(245, 166, 35, 0.08), transparent)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 56px auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 20,
              background: "rgba(245, 166, 35, 0.1)",
              border: "1px solid rgba(245, 166, 35, 0.25)",
              color: "var(--amber)",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            <Zap size={14} /> Professional Guitar Tutor Suite
          </div>

          <h1
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "clamp(32px, 5vw, 54px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Master the Guitar with <br />
            <span style={{ color: "var(--amber)" }}>Interactive Theory Tools</span>
          </h1>

          <p style={{ fontSize: 16, color: "var(--t3)", lineHeight: 1.6 }}>
            Every tool you need to learn songs, unlock scales, analyze chord shapes, and tune with pinpoint precision — built for both beginners and touring pros.
          </p>
        </div>

        {/* Tools Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 24,
          }}
        >
          {TOOLS.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
              >
                <Link
                  href={tool.href}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                    padding: 28,
                    borderRadius: 20,
                    background: "rgba(18, 18, 24, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.25s ease",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = "rgba(245, 166, 35, 0.35)";
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.3)";
                  }}
                >
                  <div>
                    {/* Top Row: Icon + Badge */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          background: `rgba(255, 255, 255, 0.05)`,
                          border: `1px solid rgba(255, 255, 255, 0.1)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: tool.color,
                        }}
                      >
                        <Icon size={24} />
                      </div>

                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "4px 10px",
                          borderRadius: 20,
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "var(--t3)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {tool.badge}
                      </span>
                    </div>

                    <h2
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        letterSpacing: "-0.02em",
                        marginBottom: 10,
                      }}
                    >
                      {tool.title}
                    </h2>

                    <p style={{ fontSize: 13.5, color: "var(--t3)", lineHeight: 1.5, margin: 0 }}>
                      {tool.desc}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 24,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--amber)",
                    }}
                  >
                    Open Tool <ArrowRight size={14} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
