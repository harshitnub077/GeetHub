"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2, RotateCcw, Sparkles, HelpCircle, Check } from "lucide-react";
import { guitarAudio } from "@/lib/guitarAudio";

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const STRING_TUNING = [4, 9, 2, 7, 11, 4]; // E2 (4=E), A2 (9=A), D3 (2=D), G3 (7=G), B3 (11=B), E4 (4=E)
const STRING_NAMES = ["E (6th)", "A (5th)", "D (4th)", "G (3rd)", "B (2nd)", "E (1st)"];

// Chord definitions as sets of intervals from root (in semitones)
const CHORD_FORMULAS: Record<string, number[]> = {
  "": [0, 4, 7], // Major
  "m": [0, 3, 7], // Minor
  "7": [0, 4, 7, 10], // Dominant 7
  "maj7": [0, 4, 7, 11], // Major 7
  "m7": [0, 3, 7, 10], // Minor 7
  "sus4": [0, 5, 7], // Sus4
  "sus2": [0, 2, 7], // Sus2
  "dim": [0, 3, 6], // Diminished
  "aug": [0, 4, 8], // Augmented
  "5": [0, 7], // Power chord
  "6": [0, 4, 7, 9], // 6th
  "m6": [0, 3, 7, 9], // Minor 6th
  "9": [0, 4, 7, 10, 2], // 9th
  "add9": [0, 4, 7, 2], // Add9
};

function identifyChordFromFrets(frets: number[]): { name: string; notes: string[]; bassNote: string } | null {
  const notesPlayed: { name: string; semitone: number }[] = [];
  let bassNote = "";

  frets.forEach((fret, strIdx) => {
    if (fret >= 0) {
      const semitone = (STRING_TUNING[strIdx] + fret) % 12;
      const noteName = CHROMATIC[semitone];
      notesPlayed.push({ name: noteName, semitone });
      if (!bassNote) bassNote = noteName;
    }
  });

  if (notesPlayed.length < 2) return null;

  const uniqueSemitones = Array.from(new Set(notesPlayed.map((n) => n.semitone)));
  const uniqueNames = Array.from(new Set(notesPlayed.map((n) => n.name)));

  // Try each note as candidate root
  for (const rootSemitone of uniqueSemitones) {
    const rootName = CHROMATIC[rootSemitone];
    const intervals = uniqueSemitones
      .map((s) => (s - rootSemitone + 12) % 12)
      .sort((a, b) => a - b);

    for (const [suffix, formula] of Object.entries(CHORD_FORMULAS)) {
      const sortedFormula = [...formula].sort((a, b) => a - b);
      const isMatch =
        sortedFormula.length === intervals.length &&
        sortedFormula.every((val, index) => val === intervals[index]);

      if (isMatch) {
        let fullName = `${rootName}${suffix}`;
        if (bassNote && bassNote !== rootName) {
          fullName += `/${bassNote}`;
        }
        return { name: fullName, notes: uniqueNames, bassNote };
      }
    }
  }

  // If partial match (e.g. 3 of 4 notes)
  if (notesPlayed.length >= 3) {
    const rootName = notesPlayed[0].name;
    return { name: `${rootName} (Inversion)`, notes: uniqueNames, bassNote };
  }

  return null;
}

export default function ChordIdentifierPage() {
  // 6 strings, frets: -1 (mute), 0 (open), 1..12
  const [frets, setFrets] = useState<number[]>([-1, 3, 2, 0, 1, 0]); // defaults to C Major

  const identified = useMemo(() => identifyChordFromFrets(frets), [frets]);

  const toggleFret = (stringIdx: number, fret: number) => {
    setFrets((prev) => {
      const next = [...prev];
      if (next[stringIdx] === fret) {
        next[stringIdx] = -1; // mute if already selected
      } else {
        next[stringIdx] = fret;
      }
      return next;
    });
  };

  const handleStrum = () => {
    guitarAudio.strumVoicing(frets);
  };

  const handleReset = () => {
    setFrets([-1, -1, -1, -1, -1, -1]);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--obsidian)", color: "var(--t1)", paddingTop: 100, paddingBottom: 100 }}>
      <div className="container" style={{ maxWidth: 1060 }}>
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
            Reverse <span style={{ color: "var(--purple)" }}>Chord Identifier</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--t3)" }}>
            Click frets on the fretboard below to place your fingers. Our harmonic engine instantly names the chord and its notes.
          </p>
        </div>

        {/* Top Result Banner */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            padding: "20px 28px",
            background: "linear-gradient(135deg, rgba(123, 97, 255, 0.15), rgba(18, 18, 24, 0.95))",
            border: "1px solid rgba(123, 97, 255, 0.3)",
            borderRadius: 18,
            marginBottom: 32,
            boxShadow: "0 14px 40px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--purple)" }}>
              Identified Chord
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <h2 style={{ fontFamily: "var(--f-mono)", fontSize: 38, fontWeight: 900, color: "#fff", margin: "4px 0" }}>
                {identified ? identified.name : "Place fingers on neck..."}
              </h2>
              {identified && (
                <span style={{ fontSize: 13, color: "var(--t3)" }}>
                  Notes: {identified.notes.join(" · ")}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleStrum}
              disabled={!identified}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 12,
                background: identified ? "var(--purple)" : "rgba(255, 255, 255, 0.05)",
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
                border: "none",
                cursor: identified ? "pointer" : "not-allowed",
                boxShadow: identified ? "0 4px 20px rgba(123, 97, 255, 0.4)" : "none",
              }}
            >
              <Volume2 size={16} /> Strum Chord
            </button>
            <button
              onClick={handleReset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 14px",
                borderRadius: 12,
                background: "rgba(255, 255, 255, 0.05)",
                color: "var(--t3)",
                fontWeight: 700,
                fontSize: 13,
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
            >
              <RotateCcw size={14} /> Clear
            </button>
          </div>
        </div>

        {/* Interactive Fretboard Neck (Horizontal) */}
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
          <div style={{ minWidth: 800 }}>
            {/* Fret Numbers Header */}
            <div style={{ display: "grid", gridTemplateColumns: "100px 50px repeat(12, 1fr)", marginBottom: 8, textAlign: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t4)", textAlign: "left" }}>String</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--amber)" }}>Open</span>
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} style={{ fontSize: 12, fontWeight: 700, color: [3, 5, 7, 9, 12].includes(i + 1) ? "var(--amber)" : "var(--t4)" }}>
                  {i + 1}
                </span>
              ))}
            </div>

            {/* 6 Guitar Strings */}
            {[5, 4, 3, 2, 1, 0].map((strIdx) => {
              const currentFret = frets[strIdx];

              return (
                <div
                  key={strIdx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 50px repeat(12, 1fr)",
                    alignItems: "center",
                    position: "relative",
                    height: 48,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  {/* String Name + Mute status */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => toggleFret(strIdx, -1)}
                      title="Mute String"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: currentFret === -1 ? "rgba(255, 77, 79, 0.2)" : "rgba(255, 255, 255, 0.05)",
                        border: `1px solid ${currentFret === -1 ? "#ff4d4f" : "var(--border)"}`,
                        color: currentFret === -1 ? "#ff4d4f" : "var(--t4)",
                        fontSize: 12,
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--f-mono)" }}>
                      {STRING_NAMES[strIdx]}
                    </span>
                  </div>

                  {/* Open String Button */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                      onClick={() => toggleFret(strIdx, 0)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: currentFret === 0 ? "var(--amber)" : "transparent",
                        border: `2px solid ${currentFret === 0 ? "var(--amber)" : "rgba(255, 255, 255, 0.25)"}`,
                        color: currentFret === 0 ? "#000" : "var(--t3)",
                        fontWeight: 900,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      {currentFret === 0 ? "O" : ""}
                    </button>
                  </div>

                  {/* Frets 1 to 12 */}
                  {Array.from({ length: 12 }).map((_, fIdx) => {
                    const fretNum = fIdx + 1;
                    const isSelected = currentFret === fretNum;
                    const semitone = (STRING_TUNING[strIdx] + fretNum) % 12;
                    const noteName = CHROMATIC[semitone];

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
                        {/* String Wire */}
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: 0,
                            right: 0,
                            height: 1 + strIdx * 0.4,
                            background: "rgba(255, 255, 255, 0.2)",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                          }}
                        />

                        {/* Interactive Finger Dot */}
                        <button
                          onClick={() => toggleFret(strIdx, fretNum)}
                          style={{
                            position: "relative",
                            zIndex: 2,
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: isSelected ? "var(--purple)" : "transparent",
                            border: isSelected ? "2px solid #fff" : "none",
                            color: isSelected ? "#fff" : "transparent",
                            fontWeight: 800,
                            fontSize: 11,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background = "rgba(123, 97, 255, 0.2)";
                              e.currentTarget.style.color = "var(--t3)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.color = "transparent";
                            }
                          }}
                        >
                          {isSelected ? noteName : noteName}
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
