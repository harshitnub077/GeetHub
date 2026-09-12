"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Volume2, Play } from "lucide-react";
import { guitarAudio } from "@/lib/guitarAudio";

const ROOTS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const ARPEGGIO_TYPES = [
  { name: "Major 7th", intervals: [0, 4, 7, 11], formula: "1 - 3 - 5 - 7", frets: [-1, 3, 2, 0, 0, 0] },
  { name: "Minor 7th", intervals: [0, 3, 7, 10], formula: "1 - b3 - 5 - b7", frets: [-1, 0, 2, 0, 1, 0] },
  { name: "Dominant 7th", intervals: [0, 4, 7, 10], formula: "1 - 3 - 5 - b7", frets: [3, 2, 0, 0, 0, 1] },
  { name: "Major Triad", intervals: [0, 4, 7], formula: "1 - 3 - 5", frets: [-1, 3, 2, 0, 1, 0] },
  { name: "Minor Triad", intervals: [0, 3, 7], formula: "1 - b3 - 5", frets: [0, 2, 2, 0, 0, 0] },
  { name: "Diminished 7th", intervals: [0, 3, 6, 9], formula: "1 - b3 - b5 - bb7", frets: [-1, 0, 1, 2, 1, 2] },
];

export default function ArpeggiosPage() {
  const [root, setRoot] = useState("C");
  const [selectedType, setSelectedType] = useState(ARPEGGIO_TYPES[0]);

  const handlePlayArpeggio = () => {
    guitarAudio.playArpeggio(selectedType.frets, 120);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--obsidian)", color: "var(--t1)", paddingTop: 100, paddingBottom: 100 }}>
      <div className="container" style={{ maxWidth: 960 }}>
        {/* Breadcrumb */}
        <Link
          href="/tools"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--t3)",
            fontWeight: 600,
            marginBottom: 24,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} /> Back to All Guitar Tools
        </Link>

        {/* Title */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              marginBottom: 8,
            }}
          >
            Guitar <span style={{ color: "#ff5252" }}>Arpeggios Explorer</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--t3)" }}>
            Master chord tones, sweeps, and soloing patterns across all 12 keys with audio demonstration.
          </p>
        </div>

        {/* Root Selector */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#ff5252", marginBottom: 10 }}>
            Root Note
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ROOTS.map((r) => (
              <button
                key={r}
                onClick={() => setRoot(r)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  background: root === r ? "#ff5252" : "rgba(255, 255, 255, 0.05)",
                  color: root === r ? "#fff" : "#fff",
                  border: `1px solid ${root === r ? "#ff5252" : "rgba(255, 255, 255, 0.1)"}`,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Arpeggio Type Selector */}
        <div style={{ marginBottom: 36 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#ff5252", marginBottom: 10 }}>
            Arpeggio Type
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ARPEGGIO_TYPES.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedType(t)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: selectedType.name === t.name ? "rgba(255, 82, 82, 0.18)" : "rgba(255, 255, 255, 0.04)",
                  color: selectedType.name === t.name ? "#ff5252" : "var(--t2)",
                  border: `1px solid ${selectedType.name === t.name ? "rgba(255, 82, 82, 0.5)" : "var(--border)"}`,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Display Card */}
        <div
          style={{
            background: "rgba(18, 18, 24, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 24,
            padding: 36,
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#ff5252" }}>
                Selected Shape
              </span>
              <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", margin: "4px 0" }}>
                {root} {selectedType.name}
              </h2>
              <span style={{ fontSize: 14, color: "var(--t3)" }}>
                Intervals: {selectedType.formula}
              </span>
            </div>

            <button
              onClick={handlePlayArpeggio}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                borderRadius: 30,
                background: "#ff5252",
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(255, 82, 82, 0.4)",
              }}
            >
              <Play size={16} /> Play Arpeggio
            </button>
          </div>

          <div
            style={{
              padding: 20,
              borderRadius: 14,
              background: "rgba(255, 82, 82, 0.06)",
              border: "1px solid rgba(255, 82, 82, 0.2)",
            }}
          >
            <h4 style={{ fontSize: 14, fontWeight: 800, color: "#ff5252", margin: "0 0 6px 0" }}>
              Soloing & Improvisation Tip
            </h4>
            <p style={{ fontSize: 13.5, color: "var(--t2)", margin: 0, lineHeight: 1.6 }}>
              When soloing over a {root} chord, targeting the {selectedType.formula.split("-")[1]?.trim() || "3rd"} on the downbeat gives your guitar lines an immediate melodic and professional sound.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
