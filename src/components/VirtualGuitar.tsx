"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, Sparkles, Music, Hand } from "lucide-react";
import { guitarAudio } from "@/lib/guitarAudio";

const CHORD_PRESETS: Record<string, { label: string; frets: number[] }> = {
  G: { label: "G Major", frets: [3, 2, 0, 0, 0, 3] },
  C: { label: "C Major", frets: [-1, 3, 2, 0, 1, 0] },
  D: { label: "D Major", frets: [-1, -1, 0, 2, 3, 2] },
  Em: { label: "E Minor", frets: [0, 2, 2, 0, 0, 0] },
  Am: { label: "A Minor", frets: [-1, 0, 2, 2, 1, 0] },
  F: { label: "F Major", frets: [1, 3, 3, 2, 1, 1] },
};

const STRING_NAMES = ["E (6th)", "A (5th)", "D (4th)", "G (3rd)", "B (2nd)", "E (1st)"];
const BASE_FREQS = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63];

export default function VirtualGuitar() {
  const [activeChord, setActiveChord] = useState<string>("G");
  const [vibrating, setVibrating] = useState<Record<number, boolean>>({});
  const isDraggingRef = useRef(false);

  const currentFrets = CHORD_PRESETS[activeChord]?.frets || CHORD_PRESETS.G.frets;

  const pluckString = (strIdx: number) => {
    const fret = currentFrets[strIdx];
    if (fret === -1) return; // muted
    const baseFreq = BASE_FREQS[strIdx];
    const freq = baseFreq * Math.pow(2, fret / 12);
    guitarAudio.playPluck(freq, 2.2);

    // Trigger string vibration
    setVibrating((prev) => ({ ...prev, [strIdx]: true }));
    setTimeout(() => {
      setVibrating((prev) => ({ ...prev, [strIdx]: false }));
    }, 450);
  };

  const strumAll = (downstroke: boolean = true) => {
    guitarAudio.strumVoicing(currentFrets, downstroke);

    // Vibrate all active strings in sequence
    const order = downstroke ? [0, 1, 2, 3, 4, 5] : [5, 4, 3, 2, 1, 0];
    order.forEach((strIdx, i) => {
      if (currentFrets[strIdx] >= 0) {
        setTimeout(() => {
          setVibrating((prev) => ({ ...prev, [strIdx]: true }));
          setTimeout(() => {
            setVibrating((prev) => ({ ...prev, [strIdx]: false }));
          }, 450);
        }, i * 35);
      }
    });
  };

  return (
    <div
      style={{
        position: "relative",
        background: "linear-gradient(135deg, rgba(20, 20, 28, 0.95), rgba(12, 12, 16, 0.98))",
        border: "1px solid rgba(245, 166, 35, 0.25)",
        borderRadius: 24,
        padding: "24px 28px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(245, 166, 35, 0.08)",
        overflow: "hidden",
      }}
    >
      {/* Top Controls: Header + Preset Selector */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(245, 166, 35, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--amber)",
            }}
          >
            <Music size={18} />
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--amber)" }}>
              Interactive Virtual Guitar
            </span>
            <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: "#fff" }}>
              Fret: {CHORD_PRESETS[activeChord]?.label}
            </h3>
          </div>
        </div>

        {/* Chord Selector Pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {Object.keys(CHORD_PRESETS).map((key) => (
            <button
              key={key}
              onClick={() => setActiveChord(key)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                background: activeChord === key ? "var(--amber)" : "rgba(255, 255, 255, 0.05)",
                color: activeChord === key ? "#000" : "var(--t2)",
                border: `1px solid ${activeChord === key ? "var(--amber)" : "var(--border)"}`,
                fontWeight: 800,
                fontSize: 12,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Virtual Playable Guitar Strings */}
      <div
        onMouseDown={() => (isDraggingRef.current = true)}
        onMouseUp={() => (isDraggingRef.current = false)}
        onMouseLeave={() => (isDraggingRef.current = false)}
        style={{
          background: "rgba(8, 8, 12, 0.9)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 16,
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          position: "relative",
          cursor: "grab",
        }}
      >
        {[5, 4, 3, 2, 1, 0].map((strIdx) => {
          const fret = currentFrets[strIdx];
          const isMuted = fret === -1;
          const isVib = vibrating[strIdx];
          const stringGauge = 1.5 + strIdx * 0.5; // Thicker low strings

          return (
            <div
              key={strIdx}
              onMouseEnter={() => {
                if (isDraggingRef.current) pluckString(strIdx);
              }}
              onClick={() => pluckString(strIdx)}
              style={{
                display: "flex",
                alignItems: "center",
                height: 28,
                position: "relative",
                cursor: isMuted ? "not-allowed" : "pointer",
              }}
            >
              {/* String Label */}
              <span
                style={{
                  width: 60,
                  fontSize: 11,
                  fontFamily: "var(--f-mono)",
                  fontWeight: 700,
                  color: isMuted ? "#ff4d4f" : "var(--t3)",
                  flexShrink: 0,
                }}
              >
                {STRING_NAMES[strIdx]}
              </span>

              {/* Wire & Vibration Track */}
              <div style={{ flex: 1, position: "relative", height: "100%", display: "flex", alignItems: "center" }}>
                <motion.div
                  animate={
                    isVib
                      ? {
                          y: [-3, 3, -2, 2, -1, 1, 0],
                          filter: ["blur(1px)", "blur(0px)"],
                        }
                      : { y: 0 }
                  }
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: stringGauge,
                    background: isMuted
                      ? "rgba(255, 77, 79, 0.3)"
                      : isVib
                      ? "linear-gradient(90deg, var(--amber), #fff, var(--purple))"
                      : "linear-gradient(90deg, rgba(245,166,35,0.4), rgba(255,255,255,0.7), rgba(245,166,35,0.4))",
                    borderRadius: stringGauge / 2,
                    boxShadow: isVib ? "0 0 12px var(--amber)" : "none",
                  }}
                />
              </div>

              {/* Fret indicator badge */}
              <span
                style={{
                  width: 50,
                  textAlign: "right",
                  fontSize: 11,
                  fontFamily: "var(--f-mono)",
                  fontWeight: 800,
                  color: isMuted ? "#ff4d4f" : fret === 0 ? "var(--amber)" : "#fff",
                }}
              >
                {isMuted ? "MUTE" : fret === 0 ? "OPEN" : `Fret ${fret}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action Footer: Strum Buttons & Tip */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 18 }}>
        <span style={{ fontSize: 12, color: "var(--t3)", display: "flex", alignItems: "center", gap: 6 }}>
          <Hand size={14} /> Click strings or swipe across to strum
        </span>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => strumAll(true)}
            style={{
              padding: "8px 18px",
              borderRadius: 12,
              background: "var(--amber)",
              color: "#000",
              fontWeight: 800,
              fontSize: 13,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 4px 14px rgba(245, 166, 35, 0.3)",
            }}
          >
            <Volume2 size={14} /> Down Strum
          </button>
          <button
            onClick={() => strumAll(false)}
            style={{
              padding: "8px 14px",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.08)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              border: "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            Up Strum
          </button>
        </div>
      </div>
    </div>
  );
}
