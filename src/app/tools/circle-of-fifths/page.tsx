"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Volume2, Sparkles } from "lucide-react";
import { guitarAudio } from "@/lib/guitarAudio";

interface KeyInfo {
  major: string;
  minor: string;
  accidentals: string;
  iv: string;
  v: string;
  ii: string;
  iii: string;
}

const CIRCLE_KEYS: KeyInfo[] = [
  { major: "C", minor: "Am", accidentals: "0 sharps/flats", iv: "F", v: "G", ii: "Dm", iii: "Em" },
  { major: "G", minor: "Em", accidentals: "1 sharp (F#)", iv: "C", v: "D", ii: "Am", iii: "Bm" },
  { major: "D", minor: "Bm", accidentals: "2 sharps (F#, C#)", iv: "G", v: "A", ii: "Em", iii: "F#m" },
  { major: "A", minor: "F#m", accidentals: "3 sharps (F#, C#, G#)", iv: "D", v: "E", ii: "Bm", iii: "C#m" },
  { major: "E", minor: "C#m", accidentals: "4 sharps", iv: "A", v: "B", ii: "F#m", iii: "G#m" },
  { major: "B", minor: "G#m", accidentals: "5 sharps", iv: "E", v: "F#", ii: "C#m", iii: "D#m" },
  { major: "F#", minor: "D#m", accidentals: "6 sharps", iv: "B", v: "C#", ii: "G#m", iii: "A#m" },
  { major: "Db", minor: "Bbm", accidentals: "5 flats", iv: "Gb", v: "Ab", ii: "Ebm", iii: "Fm" },
  { major: "Ab", minor: "Fm", accidentals: "4 flats", iv: "Db", v: "Eb", ii: "Bbm", iii: "Cm" },
  { major: "Eb", minor: "Cm", accidentals: "3 flats", iv: "Ab", v: "Bb", ii: "Fm", iii: "Gm" },
  { major: "Bb", minor: "Gm", accidentals: "2 flats", iv: "Eb", v: "F", ii: "Cm", iii: "Dm" },
  { major: "F", minor: "Dm", accidentals: "1 flat (Bb)", iv: "Bb", v: "C", ii: "Gm", iii: "Am" },
];

export default function CircleOfFifthsPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeKey = CIRCLE_KEYS[selectedIdx];

  const handlePlayTonic = () => {
    const freq = guitarAudio.noteToFreq(activeKey.major, 3);
    guitarAudio.playPluck(freq, 2.0);
  };

  const R_OUTER = 160;
  const R_INNER = 105;
  const CX = 220;
  const CY = 220;

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
            Interactive <span style={{ color: "var(--purple)" }}>Circle of Fifths</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--t3)" }}>
            The ultimate music theory wheel. Click any key to view its primary chords, relative minors, and key signatures.
          </p>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 36, alignItems: "center" }}>
          {/* Wheel SVG */}
          <div
            style={{
              background: "rgba(18, 18, 24, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 24,
              padding: 24,
              display: "flex",
              justifyContent: "center",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
            }}
          >
            <svg width={440} height={440} viewBox="0 0 440 440">
              {/* Outer circle line */}
              <circle cx={CX} cy={CY} r={R_OUTER + 24} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <circle cx={CX} cy={CY} r={R_INNER - 24} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

              {/* 12 Keys Segments */}
              {CIRCLE_KEYS.map((k, idx) => {
                const angle = (idx * 30 - 90) * (Math.PI / 180);
                const isSelected = selectedIdx === idx;
                const isSubdominant = k.major === activeKey.iv;
                const isDominant = k.major === activeKey.v;

                // Outer Major position
                const ox = CX + R_OUTER * Math.cos(angle);
                const oy = CY + R_OUTER * Math.sin(angle);

                // Inner Minor position
                const ix = CX + R_INNER * Math.cos(angle);
                const iy = CY + R_INNER * Math.sin(angle);

                return (
                  <g key={idx} onClick={() => setSelectedIdx(idx)} style={{ cursor: "pointer" }}>
                    {/* Highlight circle behind active */}
                    {isSelected && (
                      <circle cx={ox} cy={oy} r={24} fill="var(--purple)" opacity="0.3" filter="drop-shadow(0 0 8px var(--purple))" />
                    )}

                    {/* Major Note */}
                    <circle
                      cx={ox}
                      cy={oy}
                      r={18}
                      fill={isSelected ? "var(--purple)" : isSubdominant ? "rgba(76, 209, 55, 0.25)" : isDominant ? "rgba(245, 166, 35, 0.25)" : "rgba(255, 255, 255, 0.05)"}
                      stroke={isSelected ? "#fff" : isSubdominant ? "#4cd137" : isDominant ? "var(--amber)" : "rgba(255, 255, 255, 0.15)"}
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    <text
                      x={ox}
                      y={oy + 4.5}
                      textAnchor="middle"
                      fill={isSelected ? "#fff" : isSubdominant ? "#4cd137" : isDominant ? "var(--amber)" : "#fff"}
                      fontSize="13"
                      fontWeight="800"
                    >
                      {k.major}
                    </text>

                    {/* Minor Note */}
                    <circle
                      cx={ix}
                      cy={iy}
                      r={14}
                      fill={isSelected ? "rgba(123, 97, 255, 0.3)" : "rgba(255, 255, 255, 0.03)"}
                      stroke="rgba(255, 255, 255, 0.1)"
                    />
                    <text x={ix} y={iy + 3.5} textAnchor="middle" fill="var(--t3)" fontSize="10" fontWeight="700">
                      {k.minor}
                    </text>
                  </g>
                );
              })}

              {/* Center Hub */}
              <circle cx={CX} cy={CY} r={44} fill="rgba(18, 18, 24, 0.98)" stroke="rgba(255, 255, 255, 0.15)" />
              <text x={CX} y={CY - 4} textAnchor="middle" fill="var(--purple)" fontSize="18" fontWeight="900">
                {activeKey.major}
              </text>
              <text x={CX} y={CY + 14} textAnchor="middle" fill="var(--t3)" fontSize="11" fontWeight="700">
                Major
              </text>
            </svg>
          </div>

          {/* Key Details Panel */}
          <div
            style={{
              background: "rgba(18, 18, 24, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 24,
              padding: 32,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--purple)" }}>
                  Key Center
                </span>
                <h2 style={{ fontSize: 32, fontWeight: 900, margin: "2px 0" }}>
                  Key of {activeKey.major} Major
                </h2>
                <span style={{ fontSize: 13, color: "var(--t3)" }}>{activeKey.accidentals}</span>
              </div>

              <button
                onClick={handlePlayTonic}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 10,
                  background: "var(--purple)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 13,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Volume2 size={16} /> Play Key
              </button>
            </div>

            {/* Primary Triads */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--t4)", marginBottom: 10 }}>
                Primary Chords (Diatonic Triads)
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                <div style={{ padding: 12, borderRadius: 10, background: "rgba(123, 97, 255, 0.1)", border: "1px solid rgba(123, 97, 255, 0.3)", textAlign: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--purple)", fontWeight: 800 }}>I (Tonic)</span>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{activeKey.major}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: "rgba(76, 209, 55, 0.1)", border: "1px solid rgba(76, 209, 55, 0.3)", textAlign: "center" }}>
                  <span style={{ fontSize: 11, color: "#4cd137", fontWeight: 800 }}>IV (Subdominant)</span>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{activeKey.iv}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: "rgba(245, 166, 35, 0.1)", border: "1px solid rgba(245, 166, 35, 0.3)", textAlign: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--amber)", fontWeight: 800 }}>V (Dominant)</span>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{activeKey.v}</div>
                </div>
              </div>
            </div>

            {/* Secondary Chords */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--t4)", marginBottom: 10 }}>
                Relative Minor & Secondary Chords
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                <div style={{ padding: 10, borderRadius: 8, background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border)", textAlign: "center" }}>
                  <span style={{ fontSize: 10.5, color: "var(--t3)", fontWeight: 700 }}>vi (Rel Minor)</span>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>{activeKey.minor}</div>
                </div>
                <div style={{ padding: 10, borderRadius: 8, background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border)", textAlign: "center" }}>
                  <span style={{ fontSize: 10.5, color: "var(--t3)", fontWeight: 700 }}>ii (Supertonic)</span>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>{activeKey.ii}</div>
                </div>
                <div style={{ padding: 10, borderRadius: 8, background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border)", textAlign: "center" }}>
                  <span style={{ fontSize: 10.5, color: "var(--t3)", fontWeight: 700 }}>iii (Mediant)</span>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>{activeKey.iii}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
