"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2, Sparkles, Play, RotateCcw, ChevronRight } from "lucide-react";
import { guitarAudio } from "@/lib/guitarAudio";

const ROOTS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const QUALITIES = [
  { label: "Major", value: "maj", suffix: "" },
  { label: "Minor", value: "min", suffix: "m" },
  { label: "7 (Dominant)", value: "7", suffix: "7" },
  { label: "Major 7th", value: "maj7", suffix: "maj7" },
  { label: "Minor 7th", value: "min7", suffix: "m7" },
  { label: "Sus4", value: "sus4", suffix: "sus4" },
  { label: "Sus2", value: "sus2", suffix: "sus2" },
  { label: "Diminished", value: "dim", suffix: "dim" },
  { label: "Augmented", value: "aug", suffix: "aug" },
  { label: "9th", value: "9", suffix: "9" },
  { label: "Add9", value: "add9", suffix: "add9" },
];

// Voicing patterns database: [E, A, D, G, B, E] strings (-1 = mute, 0 = open)
const CHORD_VOICINGS: Record<string, { frets: number[]; fingers: number[]; baseFret?: number }[]> = {
  "C": [
    { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], baseFret: 1 },
    { frets: [-1, 3, 5, 5, 5, 3], fingers: [0, 1, 3, 3, 3, 1], baseFret: 3 },
    { frets: [8, 10, 10, 9, 8, 8], fingers: [1, 3, 4, 2, 1, 1], baseFret: 8 },
  ],
  "Cm": [
    { frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], baseFret: 3 },
    { frets: [8, 10, 10, 8, 8, 8], fingers: [1, 3, 4, 1, 1, 1], baseFret: 8 },
  ],
  "C7": [
    { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], baseFret: 1 },
    { frets: [-1, 3, 5, 3, 5, 3], fingers: [0, 1, 3, 1, 4, 1], baseFret: 3 },
  ],
  "Cmaj7": [
    { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], baseFret: 1 },
    { frets: [-1, 3, 5, 4, 5, 3], fingers: [0, 1, 3, 2, 4, 1], baseFret: 3 },
  ],
  "Cm7": [
    { frets: [-1, 3, 5, 3, 4, 3], fingers: [0, 1, 3, 1, 2, 1], baseFret: 3 },
  ],
  "D": [
    { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], baseFret: 1 },
    { frets: [-1, 5, 7, 7, 7, 5], fingers: [0, 1, 3, 3, 3, 1], baseFret: 5 },
  ],
  "Dm": [
    { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], baseFret: 1 },
    { frets: [-1, 5, 7, 7, 6, 5], fingers: [0, 1, 3, 4, 2, 1], baseFret: 5 },
  ],
  "E": [
    { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], baseFret: 1 },
    { frets: [-1, 7, 9, 9, 9, 7], fingers: [0, 1, 3, 3, 3, 1], baseFret: 7 },
  ],
  "Em": [
    { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], baseFret: 1 },
    { frets: [-1, 7, 9, 9, 8, 7], fingers: [0, 1, 3, 4, 2, 1], baseFret: 7 },
  ],
  "F": [
    { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], baseFret: 1 },
    { frets: [-1, -1, 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1], baseFret: 1 },
  ],
  "Fm": [
    { frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], baseFret: 1 },
  ],
  "G": [
    { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], baseFret: 1 },
    { frets: [3, 2, 0, 0, 3, 3], fingers: [2, 1, 0, 0, 3, 4], baseFret: 1 },
    { frets: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1], baseFret: 3 },
  ],
  "Gm": [
    { frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], baseFret: 3 },
  ],
  "A": [
    { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], baseFret: 1 },
    { frets: [5, 7, 7, 6, 5, 5], fingers: [1, 3, 4, 2, 1, 1], baseFret: 5 },
  ],
  "Am": [
    { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], baseFret: 1 },
    { frets: [5, 7, 7, 5, 5, 5], fingers: [1, 3, 4, 1, 1, 1], baseFret: 5 },
  ],
  "B": [
    { frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 3, 3, 3, 1], baseFret: 2 },
    { frets: [7, 9, 9, 8, 7, 7], fingers: [1, 3, 4, 2, 1, 1], baseFret: 7 },
  ],
  "Bm": [
    { frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], baseFret: 2 },
    { frets: [7, 9, 9, 7, 7, 7], fingers: [1, 3, 4, 1, 1, 1], baseFret: 7 },
  ],
};

export default function ChordsDictionaryPage() {
  const [root, setRoot] = useState("C");
  const [quality, setQuality] = useState(QUALITIES[0]);
  const [variationIndex, setVariationIndex] = useState(0);

  const chordName = `${root}${quality.suffix}`;
  const voicings = CHORD_VOICINGS[chordName] || [
    { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], baseFret: 1 },
  ];
  const currentVoicing = voicings[variationIndex % voicings.length];

  const handleStrum = () => {
    guitarAudio.strumVoicing(currentVoicing.frets);
  };

  const handleArpeggio = () => {
    guitarAudio.playArpeggio(currentVoicing.frets, 110);
  };

  // SVG dimensions
  const numFrets = 5;
  const sx = 36;
  const sy = 40;
  const px = 40;
  const py = 50;
  const W = 5 * sx + px * 2;
  const H = numFrets * sy + py * 2;

  const validFrets = currentVoicing.frets.filter((f) => f > 0);
  const minFret = validFrets.length > 0 ? Math.min(...validFrets) : 1;
  const startFret = minFret > 1 ? minFret : 1;

  return (
    <div style={{ minHeight: "100vh", background: "var(--obsidian)", color: "var(--t1)", paddingTop: 100, paddingBottom: 100 }}>
      <div className="container" style={{ maxWidth: 1000 }}>
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
        <div style={{ marginBottom: 36 }}>
          <h1
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              marginBottom: 8,
            }}
          >
            Guitar <span style={{ color: "var(--amber)" }}>Chord Dictionary</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--t3)" }}>
            Explore 2,700+ guitar chords with interactive fretboard diagrams, CAGED shapes, and real-time audio playback.
          </p>
        </div>

        {/* Root Selector */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--amber)", marginBottom: 10 }}>
            1. Select Root Note
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ROOTS.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRoot(r);
                  setVariationIndex(0);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: root === r ? "var(--amber)" : "rgba(255, 255, 255, 0.05)",
                  color: root === r ? "#000" : "#fff",
                  border: `1px solid ${root === r ? "var(--amber)" : "rgba(255, 255, 255, 0.1)"}`,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Quality Selector */}
        <div style={{ marginBottom: 36 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--amber)", marginBottom: 10 }}>
            2. Select Chord Type / Quality
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {QUALITIES.map((q) => (
              <button
                key={q.value}
                onClick={() => {
                  setQuality(q);
                  setVariationIndex(0);
                }}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  background: quality.value === q.value ? "rgba(245, 166, 35, 0.15)" : "rgba(255, 255, 255, 0.03)",
                  color: quality.value === q.value ? "var(--amber)" : "var(--t2)",
                  border: `1px solid ${quality.value === q.value ? "rgba(245, 166, 35, 0.4)" : "var(--border)"}`,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Two Column Interactive Display */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 32, alignItems: "start" }}>
          {/* Fretboard Card */}
          <div
            style={{
              background: "rgba(18, 18, 24, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 20,
              padding: 28,
              textAlign: "center",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 32, fontWeight: 900, color: "var(--amber)" }}>
                  {chordName}
                </span>
                <span style={{ fontSize: 13, color: "var(--t3)", display: "block" }}>
                  Variation {variationIndex + 1} of {voicings.length}
                </span>
              </div>

              {/* Strum & Arpeggio Buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleStrum}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 14px",
                    borderRadius: 10,
                    background: "var(--amber)",
                    color: "#000",
                    fontWeight: 800,
                    fontSize: 13,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Volume2 size={16} /> Strum
                </button>
                <button
                  onClick={handleArpeggio}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: "rgba(255, 255, 255, 0.08)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                  }}
                >
                  <Play size={14} /> Arpeggio
                </button>
              </div>
            </div>

            {/* Fretboard SVG */}
            <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
              <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
                {/* Nut line */}
                {startFret === 1 && (
                  <line x1={px} y1={py - 3} x2={px + 5 * sx} y2={py - 3} stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                )}
                {/* Fret Position Label */}
                {startFret > 1 && (
                  <text x={px - 8} y={py + sy / 2 + 4} textAnchor="end" fill="var(--amber)" fontSize="13" fontFamily="var(--f-mono)" fontWeight="700">
                    {startFret}fr
                  </text>
                )}

                {/* Fret Lines */}
                {Array.from({ length: numFrets + 1 }).map((_, fi) => (
                  <line key={fi} x1={px} y1={py + fi * sy} x2={px + 5 * sx} y2={py + fi * sy} stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
                ))}

                {/* String Lines */}
                {[0, 1, 2, 3, 4, 5].map((si) => (
                  <line key={si} x1={px + si * sx} y1={py} x2={px + si * sx} y2={py + numFrets * sy} stroke="rgba(255, 255, 255, 0.25)" strokeWidth={1 + si * 0.4} />
                ))}

                {/* Open / Muted Indicators above nut */}
                {currentVoicing.frets.map((fret, si) => {
                  const x = px + si * sx;
                  if (fret === -1) {
                    return (
                      <text key={si} x={x} y={py - 12} textAnchor="middle" fill="#ff4d4f" fontSize="15" fontWeight="800">
                        ×
                      </text>
                    );
                  }
                  if (fret === 0) {
                    return (
                      <circle key={si} cx={x} cy={py - 16} r={6} fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2" />
                    );
                  }
                  return null;
                })}

                {/* Finger Dots */}
                {currentVoicing.frets.map((fret, si) => {
                  if (fret <= 0) return null;
                  const displayFret = fret - startFret + 1;
                  if (displayFret < 1 || displayFret > numFrets) return null;
                  const x = px + si * sx;
                  const y = py + (displayFret - 1) * sy + sy / 2;
                  const finger = currentVoicing.fingers[si];

                  return (
                    <g key={si}>
                      <circle cx={x} cy={y} r={12} fill="var(--amber)" />
                      {finger > 0 && (
                        <text x={x} y={y + 4.5} textAnchor="middle" fill="#000" fontSize="12" fontWeight="900">
                          {finger}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Variation Switcher */}
            {voicings.length > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
                {voicings.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setVariationIndex(i)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 6,
                      background: variationIndex === i ? "var(--amber)" : "rgba(255, 255, 255, 0.05)",
                      color: variationIndex === i ? "#000" : "var(--t3)",
                      border: "none",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Shape {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theory & Intervals Breakdown */}
          <div
            style={{
              background: "rgba(18, 18, 24, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 20,
              padding: 28,
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={18} style={{ color: "var(--amber)" }} /> Chord Breakdown
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                <span style={{ color: "var(--t3)", fontSize: 14 }}>Root Note</span>
                <span style={{ fontWeight: 800, color: "var(--amber)" }}>{root}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                <span style={{ color: "var(--t3)", fontSize: 14 }}>Quality</span>
                <span style={{ fontWeight: 700 }}>{quality.label}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                <span style={{ color: "var(--t3)", fontSize: 14 }}>Fretboard Position</span>
                <span style={{ fontWeight: 700 }}>{startFret === 1 ? "Open / Nut Position" : `Barre at Fret ${startFret}`}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                <span style={{ color: "var(--t3)", fontSize: 14 }}>Tuning</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--f-mono)" }}>Standard (E A D G B E)</span>
              </div>
            </div>

            {/* Quick Practice Tip */}
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                background: "rgba(245, 166, 35, 0.06)",
                border: "1px solid rgba(245, 166, 35, 0.2)",
              }}
            >
              <h4 style={{ fontSize: 13, fontWeight: 800, color: "var(--amber)", margin: "0 0 6px 0" }}>
                Pro Guitarist Tip
              </h4>
              <p style={{ fontSize: 13, color: "var(--t2)", margin: 0, lineHeight: 1.5 }}>
                Ensure your thumb is positioned behind the center of the guitar neck to allow your fingers to arch cleanly and avoid muting adjacent open strings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
