"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, Sliders } from "lucide-react";
import { guitarAudio } from "@/lib/guitarAudio";

interface ProgressionTemplate {
  name: string;
  genre: string;
  chords: string[]; // e.g. ["C", "G", "Am", "F"]
  roman: string[]; // e.g. ["I", "V", "vi", "IV"]
}

const TEMPLATES: ProgressionTemplate[] = [
  { name: "Pop / 4-Chord Hit", genre: "Pop", chords: ["C", "G", "Am", "F"], roman: ["I", "V", "vi", "IV"] },
  { name: "50s Doo-Wop", genre: "Classic", chords: ["C", "Am", "F", "G"], roman: ["I", "vi", "IV", "V"] },
  { name: "Classic Rock Anthem", genre: "Rock", chords: ["D", "C", "G", "D"], roman: ["I", "bVII", "IV", "I"] },
  { name: "Jazz Standard ii-V-I", genre: "Jazz", chords: ["Dm", "G", "C", "C"], roman: ["ii", "V", "I", "I"] },
  { name: "Blues 12-Bar Shorthand", genre: "Blues", chords: ["E", "A", "E", "B"], roman: ["I", "IV", "I", "V"] },
  { name: "Acoustic Ballad", genre: "Folk", chords: ["G", "Em", "C", "D"], roman: ["I", "vi", "IV", "V"] },
];

const CHORD_FRETS: Record<string, number[]> = {
  C: [-1, 3, 2, 0, 1, 0],
  G: [3, 2, 0, 0, 0, 3],
  Am: [-1, 0, 2, 2, 1, 0],
  F: [1, 3, 3, 2, 1, 1],
  Dm: [-1, -1, 0, 2, 3, 1],
  Em: [0, 2, 2, 0, 0, 0],
  D: [-1, -1, 0, 2, 3, 2],
  E: [0, 2, 2, 1, 0, 0],
  A: [-1, 0, 2, 2, 2, 0],
  B: [-1, 2, 4, 4, 4, 2],
};

export default function ProgressionsStudioPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bpm, setBpm] = useState(100);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPlayback = () => {
    setIsPlaying(true);
    let step = 0;
    setCurrentStep(0);

    // Initial play
    const chordName = selectedTemplate.chords[0];
    const frets = CHORD_FRETS[chordName] || [-1, 3, 2, 0, 1, 0];
    guitarAudio.strumVoicing(frets);

    const intervalMs = (60 / bpm) * 2 * 1000; // 2 beats per chord
    timerRef.current = setInterval(() => {
      step = (step + 1) % selectedTemplate.chords.length;
      setCurrentStep(step);
      const c = selectedTemplate.chords[step];
      const f = CHORD_FRETS[c] || [-1, 3, 2, 0, 1, 0];
      guitarAudio.strumVoicing(f);
    }, intervalMs);
  };

  const stopPlayback = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setCurrentStep(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
            Chord <span style={{ color: "#4cd137" }}>Progressions Studio</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--t3)" }}>
            Discover and practice classic chord progressions across all genres with interactive strumming playback.
          </p>
        </div>

        {/* Preset Selector */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "#4cd137", marginBottom: 10 }}>
            Choose Progression Preset
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {TEMPLATES.map((t) => (
              <button
                key={t.name}
                onClick={() => {
                  stopPlayback();
                  setSelectedTemplate(t);
                }}
                style={{
                  padding: "10px 16px",
                  borderRadius: 12,
                  background: selectedTemplate.name === t.name ? "#4cd137" : "rgba(255, 255, 255, 0.05)",
                  color: selectedTemplate.name === t.name ? "#000" : "#fff",
                  border: `1px solid ${selectedTemplate.name === t.name ? "#4cd137" : "rgba(255, 255, 255, 0.1)"}`,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {t.name} <span style={{ opacity: 0.7, fontSize: 11 }}>({t.genre})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Progression Stage Display */}
        <div
          style={{
            background: "rgba(18, 18, 24, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 24,
            padding: 36,
            marginBottom: 32,
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
          }}
        >
          {/* Chord Sequence Cards */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${selectedTemplate.chords.length}, 1fr)`, gap: 16, marginBottom: 36 }}>
            {selectedTemplate.chords.map((chord, idx) => {
              const isActive = isPlaying && currentStep === idx;
              return (
                <div
                  key={idx}
                  style={{
                    padding: "24px 16px",
                    borderRadius: 16,
                    background: isActive ? "linear-gradient(135deg, rgba(76, 209, 55, 0.25), rgba(18, 18, 24, 0.95))" : "rgba(255, 255, 255, 0.03)",
                    border: `2px solid ${isActive ? "#4cd137" : "rgba(255, 255, 255, 0.08)"}`,
                    textAlign: "center",
                    transform: isActive ? "scale(1.05)" : "scale(1)",
                    transition: "all 0.15s ease",
                    boxShadow: isActive ? "0 10px 30px rgba(76, 209, 55, 0.3)" : "none",
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 800, color: isActive ? "#4cd137" : "var(--t4)", textTransform: "uppercase" }}>
                    {selectedTemplate.roman[idx]}
                  </span>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 36, fontWeight: 900, color: "#fff", margin: "6px 0" }}>
                    {chord}
                  </div>
                  <span style={{ fontSize: 11, color: "var(--t3)" }}>Bar {idx + 1}</span>
                </div>
              );
            })}
          </div>

          {/* Controls Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            {/* Play/Pause Button */}
            <button
              onClick={() => (isPlaying ? stopPlayback() : startPlayback())}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 28px",
                borderRadius: 30,
                background: isPlaying ? "#ff4d4f" : "#4cd137",
                color: isPlaying ? "#fff" : "#000",
                fontWeight: 800,
                fontSize: 15,
                border: "none",
                cursor: "pointer",
                boxShadow: isPlaying ? "none" : "0 4px 20px rgba(76, 209, 55, 0.4)",
              }}
            >
              {isPlaying ? (
                <>
                  <Pause size={18} /> Stop Progression
                </>
              ) : (
                <>
                  <Play size={18} /> Play Progression
                </>
              )}
            </button>

            {/* Tempo BPM Slider */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--t3)" }}>Tempo:</span>
              <input
                type="range"
                min="60"
                max="160"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                style={{ width: 140, accentColor: "#4cd137" }}
              />
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 16, fontWeight: 800, color: "#4cd137" }}>
                {bpm} BPM
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
