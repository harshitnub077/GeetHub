"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, Sliders, Zap, Repeat } from "lucide-react";
import { guitarAudio } from "@/lib/guitarAudio";

interface TabNote {
  stringIdx: number; // 0=e, 1=B, 2=G, 3=D, 4=A, 5=E
  fret: number;
  beat: number; // 0..15
}

// Sample classic riff: "Smoke on the Water" / "Sweet Child O' Mine" riff fragment
const SAMPLE_RIFF: TabNote[] = [
  { stringIdx: 3, fret: 0, beat: 0 },
  { stringIdx: 3, fret: 3, beat: 2 },
  { stringIdx: 3, fret: 5, beat: 4 },
  { stringIdx: 3, fret: 0, beat: 6 },
  { stringIdx: 3, fret: 3, beat: 8 },
  { stringIdx: 3, fret: 6, beat: 9 },
  { stringIdx: 3, fret: 5, beat: 10 },
  { stringIdx: 3, fret: 0, beat: 12 },
  { stringIdx: 3, fret: 3, beat: 14 },
];

const STRING_LABELS = ["e", "B", "G", "D", "A", "E"];
const BASE_FREQS = [329.63, 246.94, 196.0, 146.83, 110.0, 82.41]; // high e to low E

export default function InteractiveTabPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [loop, setLoop] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPlayback = () => {
    setIsPlaying(true);
    let beat = currentBeat;

    const beatInterval = (120 / (110 * speed)) * 1000;
    timerRef.current = setInterval(() => {
      // Find note on this beat
      const note = SAMPLE_RIFF.find((n) => n.beat === beat);
      if (note) {
        const base = BASE_FREQS[note.stringIdx];
        const freq = base * Math.pow(2, note.fret / 12);
        guitarAudio.playPluck(freq, 1.2);
      }

      beat = (beat + 1) % 16;
      setCurrentBeat(beat);

      if (beat === 0 && !loop) {
        stopPlayback();
      }
    }, beatInterval);
  };

  const stopPlayback = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
  };

  const resetPlayback = () => {
    stopPlayback();
    setCurrentBeat(0);
  };

  useEffect(() => {
    if (isPlaying) {
      stopPlayback();
      startPlayback();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [speed, loop]);

  return (
    <div
      style={{
        background: "rgba(18, 18, 24, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 24,
        padding: "28px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", color: "#00d2ff" }}>
            Songsterr-Style Tab Player
          </span>
          <h3 style={{ fontSize: 18, fontWeight: 900, margin: "2px 0 0 0", color: "#fff" }}>
            Classic Rock Riff · Animated Playhead
          </h3>
        </div>

        {/* Speed Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[0.5, 0.75, 1.0, 1.25].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                background: speed === s ? "#00d2ff" : "rgba(255, 255, 255, 0.05)",
                color: speed === s ? "#000" : "var(--t3)",
                border: "none",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {s}x
            </button>
          ))}
          <button
            onClick={() => setLoop((l) => !l)}
            style={{
              padding: "5px 8px",
              borderRadius: 6,
              background: loop ? "rgba(0, 210, 255, 0.15)" : "transparent",
              color: loop ? "#00d2ff" : "var(--t4)",
              border: "none",
              cursor: "pointer",
            }}
            title="Toggle Loop"
          >
            <Repeat size={14} />
          </button>
        </div>
      </div>

      {/* Interactive 6-String Tab Staff */}
      <div
        style={{
          background: "rgba(10, 10, 14, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 16,
          padding: "20px 24px",
          overflowX: "auto",
          position: "relative",
        }}
      >
        <div style={{ position: "relative", minWidth: 640 }}>
          {/* Animated Vertical Playhead */}
          <div
            style={{
              position: "absolute",
              top: -6,
              bottom: -6,
              left: `${70 + currentBeat * 36}px`,
              width: 3,
              background: "#00d2ff",
              borderRadius: 2,
              boxShadow: "0 0 12px #00d2ff",
              transition: "left 0.1s linear",
              zIndex: 10,
              pointerEvents: "none",
            }}
          />

          {/* 6 String Lines */}
          {[0, 1, 2, 3, 4, 5].map((strIdx) => (
            <div
              key={strIdx}
              style={{
                display: "flex",
                alignItems: "center",
                height: 24,
                position: "relative",
                borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              {/* String Letter */}
              <span
                style={{
                  width: 30,
                  fontSize: 12,
                  fontFamily: "var(--f-mono)",
                  fontWeight: 900,
                  color: "#00d2ff",
                  flexShrink: 0,
                }}
              >
                {STRING_LABELS[strIdx]}
              </span>

              {/* Beats (16 subdivisions) */}
              <div style={{ display: "flex", flex: 1 }}>
                {Array.from({ length: 16 }).map((_, beatIdx) => {
                  const note = SAMPLE_RIFF.find((n) => n.stringIdx === strIdx && n.beat === beatIdx);
                  const isCurrent = currentBeat === beatIdx;

                  return (
                    <div
                      key={beatIdx}
                      style={{
                        width: 36,
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      {note && (
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            background: isCurrent ? "#00d2ff" : "rgba(255, 255, 255, 0.1)",
                            color: isCurrent ? "#000" : "#fff",
                            fontSize: 12,
                            fontFamily: "var(--f-mono)",
                            fontWeight: 900,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: isCurrent ? "0 0 10px #00d2ff" : "none",
                          }}
                        >
                          {note.fret}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Play / Reset Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18 }}>
        <button
          onClick={() => (isPlaying ? stopPlayback() : startPlayback())}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 24px",
            borderRadius: 12,
            background: isPlaying ? "#ff4d4f" : "#00d2ff",
            color: isPlaying ? "#fff" : "#000",
            fontWeight: 800,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
          }}
        >
          {isPlaying ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Play Tab</>}
        </button>

        <button
          onClick={resetPlayback}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid var(--border)",
            color: "var(--t3)",
            cursor: "pointer",
          }}
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
