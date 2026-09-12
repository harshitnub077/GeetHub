"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Sparkles, Sliders, Volume2, Music2, ArrowRight } from "lucide-react";
import { guitarAudio } from "@/lib/guitarAudio";

interface Mood {
  id: string;
  name: string;
  icon: string;
  genre: string;
  tempo: number;
  strumPattern: string;
  chords: string[];
  roman: string[];
  desc: string;
}

const MOODS: Mood[] = [
  {
    id: "lofi",
    name: "Lo-Fi Midnight",
    icon: "🌙",
    genre: "Neo-Soul / Jazz",
    tempo: 78,
    strumPattern: "D - - U - U D -",
    chords: ["C", "Am", "Dm", "G"],
    roman: ["Imaj7", "vi7", "ii7", "V7"],
    desc: "Late-night bedroom chords with lush extended harmony.",
  },
  {
    id: "bollywood",
    name: "Bollywood Romance",
    icon: "🥀",
    genre: "Emotional Acoustic",
    tempo: 86,
    strumPattern: "D - D U D - D U",
    chords: ["Em", "C", "D", "Bm"],
    roman: ["i", "VI", "VII", "v"],
    desc: "Heartfelt, soaring progression used in iconic acoustic ballads.",
  },
  {
    id: "sunset",
    name: "Acoustic Sunset",
    icon: "🌅",
    genre: "Campfire Folk",
    tempo: 98,
    strumPattern: "D - D U - U D U",
    chords: ["G", "D", "Em", "C"],
    roman: ["I", "V", "vi", "IV"],
    desc: "The universal 4-chord progression of timeless radio hits.",
  },
  {
    id: "rock",
    name: "Neon Indie Rock",
    icon: "⚡",
    genre: "Modern Rock",
    tempo: 122,
    strumPattern: "D D D D D D D D",
    chords: ["Dm", "F", "C", "G"],
    roman: ["i", "III", "VII", "IV"],
    desc: "Driving rhythm with high-energy chord changes.",
  },
  {
    id: "flamenco",
    name: "Spanish Flamenco",
    icon: "💃",
    genre: "Andalusian Latin",
    tempo: 108,
    strumPattern: "D - D - D U D U",
    chords: ["Am", "G", "F", "E"],
    roman: ["iv", "bIII", "bII", "I"],
    desc: "The exotic Spanish Phrygian cadence with dramatic tension.",
  },
];

const CHORD_FRETS: Record<string, number[]> = {
  C: [-1, 3, 2, 0, 1, 0],
  Am: [-1, 0, 2, 2, 1, 0],
  Dm: [-1, -1, 0, 2, 3, 1],
  G: [3, 2, 0, 0, 0, 3],
  Em: [0, 2, 2, 0, 0, 0],
  D: [-1, -1, 0, 2, 3, 2],
  Bm: [-1, 2, 4, 4, 3, 2],
  F: [1, 3, 3, 2, 1, 1],
  E: [0, 2, 2, 1, 0, 0],
};

export default function MoodJammer() {
  const [selectedMood, setSelectedMood] = useState<Mood>(MOODS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tempo, setTempo] = useState(selectedMood.tempo);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startJam = () => {
    setIsPlaying(true);
    let step = 0;
    setCurrentStep(0);

    const f = CHORD_FRETS[selectedMood.chords[0]] || [-1, 3, 2, 0, 1, 0];
    guitarAudio.strumVoicing(f);

    const stepMs = (60 / tempo) * 2 * 1000;
    timerRef.current = setInterval(() => {
      step = (step + 1) % selectedMood.chords.length;
      setCurrentStep(step);
      const chordName = selectedMood.chords[step];
      const frets = CHORD_FRETS[chordName] || [-1, 3, 2, 0, 1, 0];
      guitarAudio.strumVoicing(frets);
    }, stepMs);
  };

  const stopJam = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setCurrentStep(0);
  };

  useEffect(() => {
    stopJam();
    setTempo(selectedMood.tempo);
  }, [selectedMood]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div
      style={{
        background: "rgba(16, 16, 22, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 24,
        padding: 32,
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "rgba(124, 111, 205, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--purple)",
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--purple)" }}>
              AI Chord Progression Jammer
            </span>
            <h3 style={{ fontSize: 20, fontWeight: 900, margin: 0, color: "#fff" }}>
              Pick a Mood, Get Instant Chords
            </h3>
          </div>
        </div>

        {/* Play / Stop Button */}
        <button
          onClick={() => (isPlaying ? stopJam() : startJam())}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 22px",
            borderRadius: 30,
            background: isPlaying ? "#ff4d4f" : "var(--purple)",
            color: "#fff",
            fontWeight: 800,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
            boxShadow: isPlaying ? "none" : "0 4px 18px rgba(124, 111, 205, 0.4)",
          }}
        >
          {isPlaying ? (
            <>
              <Pause size={16} /> Stop Jam
            </>
          ) : (
            <>
              <Play size={16} /> Jam Along
            </>
          )}
        </button>
      </div>

      {/* Mood Selector Buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
        {MOODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMood(m)}
            style={{
              padding: "8px 16px",
              borderRadius: 12,
              background: selectedMood.id === m.id ? "rgba(124, 111, 205, 0.2)" : "rgba(255, 255, 255, 0.04)",
              border: `1px solid ${selectedMood.id === m.id ? "var(--purple)" : "var(--border)"}`,
              color: selectedMood.id === m.id ? "#fff" : "var(--t3)",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s ease",
            }}
          >
            <span>{m.icon}</span> {m.name}
          </button>
        ))}
      </div>

      {/* Active Progression Showcase */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${selectedMood.chords.length}, 1fr)`, gap: 12, marginBottom: 24 }}>
        {selectedMood.chords.map((chord, idx) => {
          const isActive = isPlaying && currentStep === idx;
          return (
            <div
              key={idx}
              style={{
                padding: "20px 14px",
                borderRadius: 16,
                background: isActive ? "linear-gradient(135deg, rgba(124, 111, 205, 0.3), rgba(20, 20, 28, 0.95))" : "rgba(255, 255, 255, 0.03)",
                border: `2px solid ${isActive ? "var(--purple)" : "rgba(255, 255, 255, 0.08)"}`,
                textAlign: "center",
                transform: isActive ? "scale(1.04)" : "scale(1)",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 800, color: isActive ? "var(--purple)" : "var(--t4)", textTransform: "uppercase" }}>
                {selectedMood.roman[idx]}
              </span>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 28, fontWeight: 900, color: "#fff", margin: "4px 0" }}>
                {chord}
              </div>
              <span style={{ fontSize: 11, color: "var(--t3)" }}>Bar {idx + 1}</span>
            </div>
          );
        })}
      </div>

      {/* Info strip: Pattern + Tempo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 14,
          padding: "12px 18px",
          background: "rgba(255, 255, 255, 0.03)",
          borderRadius: 12,
          border: "1px solid var(--border)",
        }}
      >
        <span style={{ fontSize: 12, color: "var(--t2)" }}>
          Strumming: <strong style={{ color: "var(--amber)", fontFamily: "var(--f-mono)" }}>{selectedMood.strumPattern}</strong>
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "var(--t3)" }}>Tempo:</span>
          <input
            type="range"
            min="60"
            max="140"
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
            style={{ width: 100, accentColor: "var(--purple)" }}
          />
          <span style={{ fontSize: 12, fontFamily: "var(--f-mono)", fontWeight: 800, color: "var(--purple)" }}>
            {tempo} BPM
          </span>
        </div>
      </div>
    </div>
  );
}
