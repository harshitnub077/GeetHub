"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Mic, MicOff, Volume2, RotateCcw, CheckCircle2 } from "lucide-react";
import { guitarAudio } from "@/lib/guitarAudio";

const TUNINGS = [
  {
    name: "Standard",
    notes: ["E2", "A2", "D3", "G3", "B3", "E4"],
    freqs: [82.41, 110.0, 146.83, 196.0, 246.94, 329.63],
  },
  {
    name: "Drop D",
    notes: ["D2", "A2", "D3", "G3", "B3", "E4"],
    freqs: [73.42, 110.0, 146.83, 196.0, 246.94, 329.63],
  },
  {
    name: "Half Step Down",
    notes: ["Eb2", "Ab2", "Db3", "Gb3", "Bb3", "Eb4"],
    freqs: [77.78, 103.83, 138.59, 185.0, 233.08, 311.13],
  },
  {
    name: "DADGAD",
    notes: ["D2", "A2", "D3", "G3", "A3", "D4"],
    freqs: [73.42, 110.0, 146.83, 196.0, 220.0, 293.66],
  },
  {
    name: "Open D",
    notes: ["D2", "A2", "D3", "F#3", "A3", "D4"],
    freqs: [73.42, 110.0, 146.83, 185.0, 220.0, 293.66],
  },
];

export default function GuitarTunerPage() {
  const [selectedTuning, setSelectedTuning] = useState(TUNINGS[0]);
  const [activeString, setActiveString] = useState<number | null>(null);
  const [micActive, setMicActive] = useState(false);
  const [detectedPitch, setDetectedPitch] = useState<{ note: string; freq: number; cents: number } | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Play audio reference pitch
  const playPitch = (strIdx: number) => {
    setActiveString(strIdx);
    const freq = selectedTuning.freqs[strIdx];
    guitarAudio.playPluck(freq, 2.5);
  };

  // Microphone pitch detection via Autocorrelation
  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      setMicActive(true);
      detectPitchLoop();
    } catch (err) {
      console.error("Microphone access failed", err);
      alert("Please allow microphone access to tune your guitar.");
    }
  };

  const stopMic = () => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    setMicActive(false);
    setDetectedPitch(null);
  };

  const detectPitchLoop = () => {
    if (!analyserRef.current || !audioCtxRef.current) return;
    const buffer = new Float32Array(analyserRef.current.fftSize);
    analyserRef.current.getFloatTimeDomainData(buffer);

    // RMS noise gate to reject ambient background hum & room noise
    let sumSquares = 0;
    for (let i = 0; i < buffer.length; i++) {
      sumSquares += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sumSquares / buffer.length);
    if (rms < 0.012) {
      rafIdRef.current = requestAnimationFrame(detectPitchLoop);
      return;
    }

    // Auto-correlation pitch detection
    const sampleRate = audioCtxRef.current.sampleRate;
    let maxCorr = 0;
    let bestPeriod = -1;

    const minPeriod = Math.floor(sampleRate / 800); // 800Hz max
    const maxPeriod = Math.floor(sampleRate / 60); // 60Hz min

    for (let period = minPeriod; period < maxPeriod; period++) {
      let corr = 0;
      for (let i = 0; i < 512; i++) {
        corr += buffer[i] * buffer[i + period];
      }
      if (corr > maxCorr) {
        maxCorr = corr;
        bestPeriod = period;
      }
    }

    if (maxCorr > 5 && bestPeriod > 0) {
      const freq = sampleRate / bestPeriod;
      // Find closest note
      const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
      const midi = 69 + 12 * Math.log2(freq / 440);
      const roundedMidi = Math.round(midi);
      const noteName = notes[roundedMidi % 12];
      const targetFreq = 440 * Math.pow(2, (roundedMidi - 69) / 12);
      const cents = Math.floor(1200 * Math.log2(freq / targetFreq));

      setDetectedPitch({ note: noteName, freq: Math.round(freq), cents });
    }

    rafIdRef.current = requestAnimationFrame(detectPitchLoop);
  };

  useEffect(() => {
    return () => {
      stopMic();
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--obsidian)", color: "var(--t1)", paddingTop: 100, paddingBottom: 100 }}>
      <div className="container" style={{ maxWidth: 860 }}>
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
            Online <span style={{ color: "var(--amber)" }}>Guitar Tuner</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--t3)" }}>
            Tune with audio reference tones or enable live microphone detection for pinpoint pitch precision.
          </p>
        </div>

        {/* Tuning Presets */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--amber)", marginBottom: 10 }}>
            Tuning Preset
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TUNINGS.map((t) => (
              <button
                key={t.name}
                onClick={() => {
                  setSelectedTuning(t);
                  setActiveString(null);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  background: selectedTuning.name === t.name ? "var(--amber)" : "rgba(255, 255, 255, 0.05)",
                  color: selectedTuning.name === t.name ? "#000" : "#fff",
                  border: `1px solid ${selectedTuning.name === t.name ? "var(--amber)" : "rgba(255, 255, 255, 0.1)"}`,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {t.name} ({t.notes.map((n) => n.replace(/\d/, "")).join(" ")})
              </button>
            ))}
          </div>
        </div>

        {/* Main Tuner Display */}
        <div
          style={{
            background: "rgba(18, 18, 24, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 24,
            padding: "36px 28px",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
            marginBottom: 32,
          }}
        >
          {/* Pitch Gauge Needle */}
          <div style={{ maxWidth: 360, margin: "0 auto 32px auto" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--t4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              {micActive ? "Microphone Listening" : "Select String or Enable Mic"}
            </div>

            <div style={{ fontFamily: "var(--f-mono)", fontSize: 56, fontWeight: 900, color: detectedPitch && Math.abs(detectedPitch.cents) <= 5 ? "#4cd137" : "var(--amber)" }}>
              {detectedPitch ? detectedPitch.note : activeString !== null ? selectedTuning.notes[activeString] : "A"}
            </div>

            <div style={{ fontSize: 14, color: "var(--t3)", marginBottom: 16 }}>
              {detectedPitch ? `${detectedPitch.freq} Hz (${detectedPitch.cents > 0 ? `+${detectedPitch.cents}` : detectedPitch.cents} cents)` : "Reference 440 Hz standard"}
            </div>

            {/* Gauge bar */}
            <div style={{ position: "relative", height: 10, background: "rgba(255, 255, 255, 0.08)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "rgba(255, 255, 255, 0.3)" }} />
              {detectedPitch && (
                <div
                  style={{
                    position: "absolute",
                    left: `${Math.min(95, Math.max(5, 50 + detectedPitch.cents))}%`,
                    top: 0,
                    bottom: 0,
                    width: 12,
                    borderRadius: 6,
                    background: Math.abs(detectedPitch.cents) <= 5 ? "#4cd137" : "#ff4d4f",
                    transform: "translateX(-50%)",
                    transition: "all 0.08s ease",
                  }}
                />
              )}
            </div>
          </div>

          {/* Interactive Guitar Headstock Tuning Pegs */}
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 32 }}>
            {selectedTuning.notes.map((note, idx) => {
              const isActive = activeString === idx;
              return (
                <button
                  key={idx}
                  onClick={() => playPitch(idx)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "16px 20px",
                    borderRadius: 16,
                    background: isActive ? "var(--amber)" : "rgba(255, 255, 255, 0.05)",
                    color: isActive ? "#000" : "#fff",
                    border: `1.5px solid ${isActive ? "var(--amber)" : "rgba(255, 255, 255, 0.1)"}`,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = "rgba(245, 166, 35, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.6 }}>
                    String {6 - idx}
                  </span>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 24, fontWeight: 900 }}>
                    {note.replace(/\d/, "")}
                  </span>
                  <span style={{ fontSize: 11, opacity: 0.7 }}>
                    {selectedTuning.freqs[idx]} Hz
                  </span>
                </button>
              );
            })}
          </div>

          {/* Microphone Toggle Button */}
          <button
            onClick={() => (micActive ? stopMic() : startMic())}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 30,
              background: micActive ? "#ff4d4f" : "var(--amber)",
              color: micActive ? "#fff" : "#000",
              fontWeight: 800,
              fontSize: 14,
              border: "none",
              cursor: "pointer",
            }}
          >
            {micActive ? (
              <>
                <MicOff size={16} /> Stop Microphone
              </>
            ) : (
              <>
                <Mic size={16} /> Enable Microphone Tuner
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
