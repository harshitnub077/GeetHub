"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Layers, Volume2, Play, Sparkles } from "lucide-react";
import { guitarAudio } from "@/lib/guitarAudio";

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const STRING_TUNING = [4, 9, 2, 7, 11, 4]; // E2, A2, D3, G3, B3, E4
const STRING_NAMES = ["E (6th)", "A (5th)", "D (4th)", "G (3rd)", "B (2nd)", "E (1st)"];

interface ScaleDef {
  name: string;
  category: string;
  intervals: number[]; // semitones from root
  degrees: string[];
}

const SCALES: ScaleDef[] = [
  { name: "Minor Pentatonic", category: "Pentatonic", intervals: [0, 3, 5, 7, 10], degrees: ["1", "b3", "4", "5", "b7"] },
  { name: "Blues Scale", category: "Blues", intervals: [0, 3, 5, 6, 7, 10], degrees: ["1", "b3", "4", "b5", "5", "b7"] },
  { name: "Major Pentatonic", category: "Pentatonic", intervals: [0, 2, 4, 7, 9], degrees: ["1", "2", "3", "5", "6"] },
  { name: "Major (Ionian)", category: "Diatonic", intervals: [0, 2, 4, 5, 7, 9, 11], degrees: ["1", "2", "3", "4", "5", "6", "7"] },
  { name: "Natural Minor (Aeolian)", category: "Diatonic", intervals: [0, 2, 3, 5, 7, 8, 10], degrees: ["1", "2", "b3", "4", "5", "b6", "b7"] },
  { name: "Dorian Mode", category: "Modes", intervals: [0, 2, 3, 5, 7, 9, 10], degrees: ["1", "2", "b3", "4", "5", "6", "b7"] },
  { name: "Mixolydian Mode", category: "Modes", intervals: [0, 2, 4, 5, 7, 9, 10], degrees: ["1", "2", "3", "4", "5", "6", "b7"] },
  { name: "Phrygian Mode", category: "Modes", intervals: [0, 1, 3, 5, 7, 8, 10], degrees: ["1", "b2", "b3", "4", "5", "b6", "b7"] },
  { name: "Lydian Mode", category: "Modes", intervals: [0, 2, 4, 6, 7, 9, 11], degrees: ["1", "2", "3", "#4", "5", "6", "7"] },
  { name: "Harmonic Minor", category: "Exotic", intervals: [0, 2, 3, 5, 7, 8, 11], degrees: ["1", "2", "b3", "4", "5", "b6", "7"] },
];

export default function ScalesExplorerPage() {
  const [root, setRoot] = useState("A");
  const [selectedScale, setSelectedScale] = useState(SCALES[0]); // A Minor Pentatonic
  const [displayMode, setDisplayMode] = useState<"notes" | "degrees">("notes");

  const rootIndex = CHROMATIC.indexOf(root);

  // Notes in the selected scale
  const scaleNotes = useMemo(() => {
    return selectedScale.intervals.map((semitone) => {
      const idx = (rootIndex + semitone) % 12;
      return CHROMATIC[idx];
    });
  }, [rootIndex, selectedScale]);

  const handlePlayScale = () => {
    // Play an ascending octave sequence
    const baseFreq = guitarAudio.noteToFreq(root, 3);
    selectedScale.intervals.forEach((semitone, idx) => {
      const freq = baseFreq * Math.pow(2, semitone / 12);
      guitarAudio.playPluck(freq, 1.2, undefined);
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--obsidian)", color: "var(--t1)", paddingTop: 100, paddingBottom: 100 }}>
      <div className="container" style={{ maxWidth: 1100 }}>
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
            Guitar <span style={{ color: "#00d2ff" }}>Scales & Modes Visualizer</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--t3)" }}>
            Unlock the fretboard with interactive scale charts, root highlights, and scale degree patterns across 15 frets.
          </p>
        </div>

        {/* Controls Row */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
          {/* Root Note Selector */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#00d2ff", marginBottom: 8 }}>
              1. Root Key
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CHROMATIC.map((r) => (
                <button
                  key={r}
                  onClick={() => setRoot(r)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    background: root === r ? "#00d2ff" : "rgba(255, 255, 255, 0.05)",
                    color: root === r ? "#000" : "#fff",
                    border: `1px solid ${root === r ? "#00d2ff" : "rgba(255, 255, 255, 0.1)"}`,
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

          {/* Scale Selector */}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#00d2ff", marginBottom: 8 }}>
              2. Scale / Mode
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SCALES.map((s) => (
                <button
                  key={s.name}
                  onClick={() => setSelectedScale(s)}
                  style={{
                    padding: "7px 13px",
                    borderRadius: 8,
                    background: selectedScale.name === s.name ? "rgba(0, 210, 255, 0.15)" : "rgba(255, 255, 255, 0.03)",
                    color: selectedScale.name === s.name ? "#00d2ff" : "var(--t2)",
                    border: `1px solid ${selectedScale.name === s.name ? "rgba(0, 210, 255, 0.4)" : "var(--border)"}`,
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: "pointer",
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scale Info Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            padding: "16px 24px",
            background: "rgba(18, 18, 24, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 16,
            marginBottom: 24,
          }}
        >
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 4px 0" }}>
              {root} {selectedScale.name}
            </h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {scaleNotes.map((note, i) => (
                <span
                  key={note}
                  style={{
                    padding: "2px 8px",
                    borderRadius: 6,
                    background: note === root ? "var(--amber)" : "rgba(255, 255, 255, 0.08)",
                    color: note === root ? "#000" : "#fff",
                    fontWeight: 800,
                    fontSize: 12,
                    fontFamily: "var(--f-mono)",
                  }}
                >
                  {note} <span style={{ opacity: 0.6, fontSize: 10 }}>({selectedScale.degrees[i]})</span>
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {/* Display Mode Toggle */}
            <div style={{ display: "flex", background: "rgba(255, 255, 255, 0.05)", borderRadius: 8, padding: 3, border: "1px solid var(--border)" }}>
              <button
                onClick={() => setDisplayMode("notes")}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  background: displayMode === "notes" ? "rgba(255, 255, 255, 0.12)" : "transparent",
                  color: displayMode === "notes" ? "#fff" : "var(--t3)",
                  border: "none",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Notes
              </button>
              <button
                onClick={() => setDisplayMode("degrees")}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  background: displayMode === "degrees" ? "rgba(255, 255, 255, 0.12)" : "transparent",
                  color: displayMode === "degrees" ? "#fff" : "var(--t3)",
                  border: "none",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Degrees
              </button>
            </div>

            <button
              onClick={handlePlayScale}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 10,
                background: "#00d2ff",
                color: "#000",
                fontWeight: 800,
                fontSize: 13,
                border: "none",
                cursor: "pointer",
              }}
            >
              <Play size={14} /> Play Scale
            </button>
          </div>
        </div>

        {/* 15-Fret Horizontal Fretboard */}
        <div
          style={{
            background: "rgba(18, 18, 24, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 20,
            padding: "24px 20px",
            overflowX: "auto",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
          }}
        >
          <div style={{ minWidth: 920 }}>
            {/* Header Fret Markers */}
            <div style={{ display: "grid", gridTemplateColumns: "90px 44px repeat(15, 1fr)", marginBottom: 8, textAlign: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t4)", textAlign: "left" }}>String</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "var(--amber)" }}>Open</span>
              {Array.from({ length: 15 }).map((_, i) => (
                <span key={i} style={{ fontSize: 11, fontWeight: 700, color: [3, 5, 7, 9, 12, 15].includes(i + 1) ? "var(--amber)" : "var(--t4)" }}>
                  {i + 1}
                </span>
              ))}
            </div>

            {/* 6 Strings */}
            {[5, 4, 3, 2, 1, 0].map((strIdx) => (
              <div
                key={strIdx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "90px 44px repeat(15, 1fr)",
                  alignItems: "center",
                  position: "relative",
                  height: 44,
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                }}
              >
                {/* String Label */}
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--f-mono)", color: "var(--t2)" }}>
                  {STRING_NAMES[strIdx]}
                </span>

                {/* Open String (Fret 0) */}
                {(() => {
                  const openSemitone = STRING_TUNING[strIdx];
                  const noteName = CHROMATIC[openSemitone];
                  const inScale = scaleNotes.includes(noteName);
                  const isRoot = noteName === root;
                  const degreeIdx = scaleNotes.indexOf(noteName);
                  const degree = degreeIdx !== -1 ? selectedScale.degrees[degreeIdx] : "";

                  return (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      {inScale && (
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            background: isRoot ? "var(--amber)" : "rgba(0, 210, 255, 0.2)",
                            border: `1.5px solid ${isRoot ? "var(--amber)" : "#00d2ff"}`,
                            color: isRoot ? "#000" : "#fff",
                            fontSize: 11,
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {displayMode === "notes" ? noteName : degree}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Frets 1 to 15 */}
                {Array.from({ length: 15 }).map((_, fIdx) => {
                  const fretNum = fIdx + 1;
                  const semitone = (STRING_TUNING[strIdx] + fretNum) % 12;
                  const noteName = CHROMATIC[semitone];
                  const inScale = scaleNotes.includes(noteName);
                  const isRoot = noteName === root;
                  const degreeIdx = scaleNotes.indexOf(noteName);
                  const degree = degreeIdx !== -1 ? selectedScale.degrees[degreeIdx] : "";
                  const isBlueNote = selectedScale.name.includes("Blues") && degree === "b5";

                  return (
                    <div
                      key={fIdx}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        borderLeft: "2px solid rgba(255, 255, 255, 0.12)",
                        position: "relative",
                      }}
                    >
                      {/* Wire */}
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: 0,
                          right: 0,
                          height: 1 + strIdx * 0.4,
                          background: "rgba(255, 255, 255, 0.18)",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />

                      {inScale && (
                        <div
                          style={{
                            position: "relative",
                            zIndex: 2,
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            background: isRoot
                              ? "var(--amber)"
                              : isBlueNote
                              ? "#ff5252"
                              : "rgba(18, 18, 24, 0.9)",
                            border: `2px solid ${isRoot ? "var(--amber)" : isBlueNote ? "#ff5252" : "#00d2ff"}`,
                            color: isRoot ? "#000" : isBlueNote ? "#fff" : "#00d2ff",
                            fontSize: 10.5,
                            fontWeight: 900,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: isRoot ? "0 0 10px rgba(245, 166, 35, 0.5)" : "none",
                          }}
                        >
                          {displayMode === "notes" ? noteName : degree}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
