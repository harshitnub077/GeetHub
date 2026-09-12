"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Pause, Plus, Minus, RotateCcw, Timer } from "lucide-react";
import { guitarAudio } from "@/lib/guitarAudio";

const TIME_SIGNATURES = [
  { label: "4/4", beats: 4 },
  { label: "3/4", beats: 3 },
  { label: "2/4", beats: 2 },
  { label: "6/8", beats: 6 },
];

export default function MetronomePage() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [timeSig, setTimeSig] = useState(TIME_SIGNATURES[0]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tapTimesRef = useRef<number[]>([]);

  // Tap Tempo handler
  const handleTap = () => {
    const now = performance.now();
    const times = tapTimesRef.current;
    times.push(now);

    if (times.length > 4) times.shift();

    if (times.length >= 2) {
      const intervals = [];
      for (let i = 1; i < times.length; i++) {
        intervals.push(times[i] - times[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
      const calculatedBpm = Math.min(260, Math.max(40, Math.round(60000 / avgInterval)));
      setBpm(calculatedBpm);
    }
  };

  const startMetronome = () => {
    setIsPlaying(true);
    let beat = 0;
    setCurrentBeat(0);
    guitarAudio.playClick(true); // beat 1 accent

    const intervalMs = (60 / bpm) * 1000;
    timerRef.current = setInterval(() => {
      beat = (beat + 1) % timeSig.beats;
      setCurrentBeat(beat);
      guitarAudio.playClick(beat === 0);
    }, intervalMs);
  };

  const stopMetronome = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setCurrentBeat(0);
  };

  useEffect(() => {
    if (isPlaying) {
      stopMetronome();
      startMetronome();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [bpm, timeSig]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--obsidian)", color: "var(--t1)", paddingTop: 100, paddingBottom: 100 }}>
      <div className="container" style={{ maxWidth: 680 }}>
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
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              marginBottom: 8,
            }}
          >
            Pro <span style={{ color: "#00d2ff" }}>Metronome</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--t3)" }}>
            Precision timing engine with tap tempo, accented downbeats, and visual pulses.
          </p>
        </div>

        {/* Metronome Unit */}
        <div
          style={{
            background: "rgba(18, 18, 24, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 24,
            padding: "44px 32px",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
          }}
        >
          {/* Visual Beat Indicator Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 36 }}>
            {Array.from({ length: timeSig.beats }).map((_, idx) => {
              const isActive = isPlaying && currentBeat === idx;
              const isAccent = idx === 0;

              return (
                <div
                  key={idx}
                  style={{
                    width: isAccent ? 24 : 18,
                    height: isAccent ? 24 : 18,
                    borderRadius: "50%",
                    background: isActive
                      ? isAccent
                        ? "#00d2ff"
                        : "var(--amber)"
                      : "rgba(255, 255, 255, 0.1)",
                    transform: isActive ? "scale(1.3)" : "scale(1)",
                    transition: "transform 0.08s ease, background 0.08s ease",
                    boxShadow: isActive ? `0 0 16px ${isAccent ? "#00d2ff" : "var(--amber)"}` : "none",
                  }}
                />
              );
            })}
          </div>

          {/* Large BPM Display */}
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 80, fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: 12 }}>
            {bpm}
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Beats Per Minute
          </span>

          {/* Increment / Decrement & Slider */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, margin: "32px 0" }}>
            <button
              onClick={() => setBpm((b) => Math.max(30, b - 1))}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid var(--border)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Minus size={18} />
            </button>

            <input
              type="range"
              min="30"
              max="260"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              style={{ width: 220, accentColor: "#00d2ff" }}
            />

            <button
              onClick={() => setBpm((b) => Math.min(260, b + 1))}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid var(--border)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Time Signature Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 36 }}>
            {TIME_SIGNATURES.map((ts) => (
              <button
                key={ts.label}
                onClick={() => setTimeSig(ts)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 8,
                  background: timeSig.label === ts.label ? "rgba(0, 210, 255, 0.15)" : "rgba(255, 255, 255, 0.04)",
                  color: timeSig.label === ts.label ? "#00d2ff" : "var(--t3)",
                  border: `1px solid ${timeSig.label === ts.label ? "#00d2ff" : "var(--border)"}`,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {ts.label}
              </button>
            ))}
          </div>

          {/* Main Action Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
            <button
              onClick={() => (isPlaying ? stopMetronome() : startMetronome())}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 36px",
                borderRadius: 30,
                background: isPlaying ? "#ff4d4f" : "#00d2ff",
                color: isPlaying ? "#fff" : "#000",
                fontWeight: 900,
                fontSize: 16,
                border: "none",
                cursor: "pointer",
                boxShadow: isPlaying ? "none" : "0 4px 24px rgba(0, 210, 255, 0.4)",
              }}
            >
              {isPlaying ? (
                <>
                  <Pause size={20} /> Stop
                </>
              ) : (
                <>
                  <Play size={20} /> Start
                </>
              )}
            </button>

            <button
              onClick={handleTap}
              style={{
                padding: "14px 24px",
                borderRadius: 30,
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Tap Tempo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
