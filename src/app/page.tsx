"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Mic, Play, Star, Music2, Zap, Shuffle, ListMusic, Wifi,
  Users, Brain, ChevronRight, Flame, Headphones,
  AudioLines, CheckCircle2, Sparkles, BookOpen, Layers, Compass, Video, Disc3,
  Sliders, Music, Check, ArrowRight,
} from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import GenreCard from "@/components/GenreCard";
import InfiniteMarquee from "@/components/InfiniteMarquee";
import VirtualGuitar from "@/components/VirtualGuitar";
import SoundVisualizerCanvas from "@/components/SoundVisualizerCanvas";
import MoodJammer from "@/components/MoodJammer";
import InteractiveTabPlayer from "@/components/InteractiveTabPlayer";

/* ── Magnetic Button ────────────────────────── */
function Magnetic({ children }: { children: React.ReactElement }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    // Move 10% of distance from center
    setPosition({ x: middleX * 0.15, y: middleY * 0.15 });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      style={{ position: "relative" }}
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

/* ── Counter ────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setInView(true);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const steps = 55;
    const inc = to / steps;
    const t = setInterval(() => {
      frame++;
      setVal(Math.min(Math.round(frame * inc), to));
      if (frame >= steps) clearInterval(t);
    }, 22);
    return () => clearInterval(t);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {val >= 1000000
        ? `${(val / 1000000).toFixed(1)}M`
        : val >= 1000
          ? `${(val / 1000).toFixed(0)}K`
          : val}
      {suffix}
    </span>
  );
}

/* ── Visual Waveform ────────────────────────── */
function GuitarWaveform() {
  const bars = [35, 60, 45, 80, 55, 90, 40, 70, 50, 85, 38, 65, 48, 78, 42];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 40 }}>
      {bars.map((h, i) => (
        <motion.div
          key={i}
          style={{ width: 3, background: `rgba(245,166,35,${0.28 + (i % 3) * 0.22})`, borderRadius: 2 }}
          animate={{ height: [`${h * 0.4}%`, `${h}%`, `${h * 0.6}%`, `${h}%`] }}
          transition={{ duration: 1.2 + i * 0.14, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
        />
      ))}
    </div>
  );
}

/* ── Feature Component ──────────────────────── */
function FeatureCard({
  icon: Icon, label, desc,
  color = "var(--amber)",
  delay = 0,
  span = 4,
  meta = "",
  bgImage = "",
}: { icon: any; label: string; desc: string; color?: string; delay?: number; span?: number; meta?: string; bgImage?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      style={{ gridColumn: `span ${span}` } as any}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          padding: span > 4 ? "32px 32px" : "28px 24px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          minHeight: span > 4 ? 230 : 190,
          borderRadius: 20,
          background: isHovered
            ? `linear-gradient(145deg, rgba(22,22,30,0.95) 0%, rgba(15,15,22,0.98) 100%)`
            : "rgba(14,14,20,0.8)",
          border: `1px solid ${isHovered ? color + "44" : "rgba(255,255,255,0.06)"}`,
          boxShadow: isHovered
            ? `0 24px 48px rgba(0,0,0,0.6), inset 0 1px 0 ${color}22`
            : "0 2px 16px rgba(0,0,0,0.3)",
          transform: `translateY(${isHovered ? -6 : 0}px)`,
          transition: "all 0.35s cubic-bezier(0.25, 1, 0.5, 1)",
          overflow: "hidden",
          cursor: "default",
        }}
      >
        {/* Top colored accent line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.3s ease",
        }} />

        {/* Ambient background image — no filter on hover */}
        {bgImage && (
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url("${bgImage}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: isHovered ? 0.45 : 0,
            transition: "opacity 0.5s ease",
            zIndex: 0,
          }} />
        )}

        {/* Subtle corner gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at top left, ${color}0a 0%, transparent 60%)`,
          opacity: isHovered ? 1 : 0.4,
          transition: "opacity 0.3s ease",
          zIndex: 1,
          pointerEvents: "none",
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Meta label */}
          {meta && (
            <div style={{
              alignSelf: "flex-end",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: color,
              opacity: 0.7,
              background: `${color}10`,
              padding: "4px 10px",
              borderRadius: 6,
              border: `1px solid ${color}20`,
              marginBottom: 20,
            }}>{meta}</div>
          )}

          {/* Icon */}
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `${color}12`,
            border: `1px solid ${color}25`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            transition: "all 0.3s ease",
            boxShadow: isHovered ? `0 0 20px ${color}25` : "none",
          }}>
            <Icon size={20} color={color} />
          </div>

          {/* Title */}
          <h3 style={{
            fontFamily: "var(--f-display)",
            fontWeight: 800,
            fontSize: span > 4 ? 28 : 22,
            color: "var(--t1)",
            letterSpacing: "-0.03em",
            marginBottom: 12,
            lineHeight: 1.15,
          }}>{label}</h3>

          {/* Description */}
          <p style={{
            fontSize: span > 4 ? 16 : 15,
            color: "var(--t3)",
            lineHeight: 1.7,
            fontWeight: 400,
            marginTop: "auto",
          }}>{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Bollywood 2026 Card ───────────────────── */
const BWOOD_GRADIENTS = [
  "linear-gradient(135deg, #1a0533 0%, #3b1060 50%, #6b21a8 100%)",
  "linear-gradient(135deg, #0f1f3d 0%, #1e3a5f 50%, #1d4ed8 100%)",
  "linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #92400e 100%)",
  "linear-gradient(135deg, #0a1a0f 0%, #14532d 50%, #15803d 100%)",
  "linear-gradient(135deg, #1a0010 0%, #500030 50%, #9d174d 100%)",
  "linear-gradient(135deg, #0f0f1a 0%, #1e1b4b 50%, #4338ca 100%)",
  "linear-gradient(135deg, #180a00 0%, #431407 50%, #b45309 100%)",
  "linear-gradient(135deg, #0c1a1a 0%, #134e4a 50%, #0f766e 100%)",
];

const BWOOD_ACCENT_COLORS = [
  "#c084fc", "#60a5fa", "#fb923c", "#4ade80",
  "#f472b6", "#818cf8", "#fbbf24", "#2dd4bf",
];

function Bollywood2026Card({ song, i }: { song: any; i: number }) {
  const grad = BWOOD_GRADIENTS[i % BWOOD_GRADIENTS.length];
  const accent = BWOOD_ACCENT_COLORS[i % BWOOD_ACCENT_COLORS.length];
  const initials = (song.title || "?")
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() || "")
    .join("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(i * 0.055, 0.55), ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/song/${song.id}`}
        style={{ textDecoration: "none", display: "block" }}
      >
        <div
          style={{
            width: 200,
            borderRadius: 18,
            overflow: "hidden",
            background: grad,
            border: `1px solid ${accent}22`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 ${accent}18`,
            transition: "all 0.3s cubic-bezier(0.25,1,0.5,1)",
            cursor: "pointer",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
            e.currentTarget.style.boxShadow = `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${accent}44, inset 0 1px 0 ${accent}30`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) scale(1)";
            e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 ${accent}18`;
          }}
        >
          {/* Visual art block */}
          <div
            style={{
              height: 140,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* Ambient glow orb */}
            <div style={{
              position: "absolute",
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accent}40 0%, transparent 70%)`,
              filter: "blur(20px)",
            }} />
            {/* Noise texture lines */}
            <div style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 20px,
                ${accent}06 20px,
                ${accent}06 21px
              )`,
            }} />
            {/* Big initials */}
            <span style={{
              fontFamily: "var(--f-display)",
              fontWeight: 900,
              fontSize: 52,
              color: accent,
              opacity: 0.9,
              letterSpacing: "-0.04em",
              position: "relative",
              zIndex: 1,
              textShadow: `0 0 40px ${accent}60`,
              lineHeight: 1,
            }}>
              {initials}
            </span>
            {/* 2026 badge */}
            <div style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: `${accent}22`,
              border: `1px solid ${accent}44`,
              borderRadius: 8,
              padding: "3px 8px",
              fontSize: 9,
              fontWeight: 800,
              color: accent,
              letterSpacing: "0.1em",
              backdropFilter: "blur(8px)",
            }}>
              2026
            </div>
            {/* Hot tag for first 5 */}
            {i < 5 && (
              <div style={{
                position: "absolute",
                top: 10,
                left: 10,
                background: "rgba(245,166,35,0.2)",
                border: "1px solid rgba(245,166,35,0.45)",
                borderRadius: 8,
                padding: "3px 8px",
                fontSize: 9,
                fontWeight: 800,
                color: "var(--amber)",
                letterSpacing: "0.1em",
                display: "flex",
                alignItems: "center",
                gap: 3,
                backdropFilter: "blur(8px)",
              }}>
                🔥 HOT
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{
            padding: "16px",
            borderTop: `1px solid ${accent}18`,
            background: "rgba(0,0,0,0.3)",
          }}>
            <p style={{
              fontFamily: "var(--f-display)",
              fontWeight: 700,
              fontSize: 13.5,
              color: "#fff",
              letterSpacing: "-0.02em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginBottom: 5,
            }}>
              {song.title}
            </p>
            <p style={{
              fontSize: 11.5,
              color: accent,
              opacity: 0.85,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontWeight: 600,
            }}>
              {song.artist}
            </p>
            <div style={{
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.35)",
                background: "rgba(255,255,255,0.06)",
                padding: "3px 8px",
                borderRadius: 6,
                letterSpacing: "0.04em",
              }}>
                Bollywood
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: accent,
                marginLeft: "auto",
                opacity: 0.7,
              }}>
                View Chords →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── App Data ───────────────────────────────── */

const FEATURES = [
  { icon: Play, label: "Play Along", desc: "Real-time mic detection & accuracy scoring. Practice at your own BPM with live audio feedback.", color: "var(--amber)", span: 8, bgImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&q=85" },
  { icon: Brain, label: "Simple Chords", desc: "Complex chords instantly converted to beginner-friendly shapes.", color: "var(--purple)", span: 4 },
  { icon: Shuffle, label: "Transpose", desc: "Instant key changes with a built-in capo calculator for guitarists.", color: "var(--teal)", span: 4 },
  { icon: Zap, label: "Stage Mode", desc: "Full-screen zero-chrome view designed for live performances on dark stages.", color: "var(--rose)", span: 8, bgImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&q=85" },
  { icon: Wifi, label: "Offline Mode", desc: "Save songs and practice without internet connection.", color: "var(--teal)", span: 4 },
  { icon: Headphones, label: "Smart Search", desc: "'Sad acoustic songs in Am' — find the perfect track with our natural search.", color: "var(--amber)", span: 8, bgImage: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&auto=format&q=85" },
];

const GENRES = [
  { name: "Rock", color: "#f87171", image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=1200&auto=format&q=85" },
  { name: "Pop", color: "#f5a623", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&q=85" },
  { name: "Bollywood", color: "#7c6fcd", image: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=1200&auto=format&q=85" },
  { name: "Classical", color: "#34d399", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200&auto=format&q=85" },
  { name: "Jazz", color: "#60a5fa", image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1200&auto=format&q=85" },
  { name: "Blues", color: "#60a5fa", image: "https://images.unsplash.com/photo-1504704911898-68304a7d2807?w=1200&auto=format&q=85" },
  { name: "Country", color: "#f5a623", image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&auto=format&q=85" },
  { name: "Metal", color: "#f87171", image: "https://images.unsplash.com/photo-1573215177236-4e5942e23f25?w=1200&auto=format&q=85" },
  { name: "Indie", color: "#34d399", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&auto=format&q=85" },
  { name: "Hip-Hop", color: "#7c6fcd", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&auto=format&q=85" },
  { name: "Folk", color: "#f5a623", image: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=1200&auto=format&q=85" },
  { name: "EDM", color: "#00d4b4", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&q=85" },
];

const MARQUEE_SONGS = [
  "Hotel California", "Tum Hi Ho", "Wonderwall", "Bohemian Rhapsody", "Stairway to Heaven",
  "Let Her Go", "Shape of You", "Agar Tum Saath Ho", "Nothing Else Matters", "Phir Kabhi",
  "More Than Words", "Tere Bin", "Counting Stars", "Photograph", "Fix You",
  "Kal Ho Na Ho", "Channa Mereya", "Believer", "Demons", "Yellow",
];

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=2400&auto=format&q=85", // Edgy acoustic
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=2400&auto=format&q=85", // Studio neon vibes
  "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=2400&auto=format&q=85", // Concert silhouettes
  "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=2400&auto=format&q=85", // Jazz close-up
  "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=2400&auto=format&q=85", // Folk festival
];

/* ════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const [heroImgIdx, setHeroImgIdx] = useState(0);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [bwood2026, setBwood2026] = useState<any[]>([]);
  const [bwoodLoading, setBwoodLoading] = useState(true);
  const [studioTab, setStudioTab] = useState<"jammer" | "tabs">("jammer");

  const heroRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLDivElement>(null);

  /* ── Mouse parallax on hero ── */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 14;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      // Parallax applied via custom properties to keep slider transitions clean
      hero.style.setProperty("--px", `${x}px`);
      hero.style.setProperty("--py", `${y}px`);
    };
    hero.addEventListener("mousemove", onMove);
    return () => hero.removeEventListener("mousemove", onMove);
  }, []);

  /* ── Auto image slider ── */
  useEffect(() => {
    const t = setInterval(() => {
      setHeroImgIdx((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  /* ── GSAP title reveal ── */
  useGSAP(() => {
    const words = heroTitleRef.current?.querySelectorAll(".hero-word");
    if (!words) return;
    gsap.fromTo(words,
      { opacity: 0, y: 40, skewY: 3 },
      { opacity: 1, y: 0, skewY: 0, stagger: 0.07, duration: 0.85, delay: 0.15, ease: "power3.out" }
    );
  }, []);

  /* ── Bollywood 2026 fetch ── */
  useEffect(() => {
    fetch('/api/songs/trending?limit=20')
      .then((r) => r.json())
      .then((d) => { setBwood2026(d.songs || []); })
      .catch(() => {})
      .finally(() => setBwoodLoading(false));
  }, []);

  /* ── Suggestions ── */
  useEffect(() => {
    if (!query.trim() || query.length < 2) { setSuggestions([]); setShowSug(false); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/songs/suggestions?q=${encodeURIComponent(query)}`);
        const d = await r.json();
        setSuggestions(d.suggestions || []);
        setShowSug(true);
      } catch { setSuggestions([]); }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  /* ── Search results ── */
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/songs/search?q=${encodeURIComponent(query)}&limit=7`);
        const d = await r.json();
        setResults(d.songs || []);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div style={{ background: "var(--obsidian)", minHeight: "100vh", paddingTop: 60 }}>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Parallax Container */}
        <div
          ref={heroImgRef}
          style={{
            position: "absolute",
            inset: "-10%",
            transform: "translate(var(--px, 0px), var(--py, 0px))",
            willChange: "transform",
            transition: "transform 0.1s ease-out",
            zIndex: 0,
          }}
        >
          {/* Slider Images */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={heroImgIdx}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.32, scale: 1.15 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1.5, ease: "easeInOut" },
                scale: { duration: 8, ease: "linear" }
              }}
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url("${HERO_IMAGES[heroImgIdx]}")`,
                backgroundSize: "cover",
                backgroundPosition: "center 30%",
                willChange: "transform, opacity",
              }}
            />
          </AnimatePresence>
        </div>

        {/* Hero Background Elements */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(5,5,7,0.55) 0%, rgba(5,5,7,0.35) 40%, rgba(5,5,7,0.6) 75%, rgba(5,5,7,1) 100%)",
          }}
        />
        {/* Left/right fade */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 85% 75% at 50% 45%, transparent 30%, rgba(5,5,7,0.75) 100%)",
          }}
        />

        {/* Purple glow — top left */}
        <div style={{ position: "absolute", top: "-5%", left: "-5%", width: "40vw", height: "40vw", borderRadius: "50%", background: "rgba(124,111,205,0.07)", filter: "blur(100px)", pointerEvents: "none" }} />
        {/* Amber glow — bottom right */}
        <div style={{ position: "absolute", bottom: "5%", right: "-5%", width: "35vw", height: "35vw", borderRadius: "50%", background: "rgba(245,166,35,0.06)", filter: "blur(100px)", pointerEvents: "none" }} />

        {/* Dot grid */}
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
            maskImage: "radial-gradient(ellipse 75% 65% at 50% 45%, black 0%, transparent 85%)",
            WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 50% 45%, black 0%, transparent 85%)",
            opacity: 0.35,
          }}
        />

        <div className="container" style={{ position: "relative", zIndex: 2, textAlign: "center", paddingTop: 48, paddingBottom: 60 }}>

          {/* Top pill badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 20px",
              borderRadius: 100,
              background: "rgba(245,166,35,0.08)",
              border: "1px solid rgba(245,166,35,0.28)",
              marginBottom: 24,
              boxShadow: "0 0 30px rgba(245,166,35,0.12)",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--amber)", boxShadow: "0 0 10px var(--amber)" }} />
            <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--amber)" }}>
              ⚡ NEXT-GEN GUITAR INTELLIGENCE · 2026 EDITION
            </span>
          </motion.div>

          {/* Headline — smaller, refined */}
          <div
            ref={heroTitleRef}
            style={{
              fontFamily: "var(--f-display)",
              fontWeight: 800,
              fontSize: "clamp(34px, 5.5vw, 68px)",
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              marginBottom: 20,
              maxWidth: 780,
              marginInline: "auto",
            }}
          >
            {["Every song you love.", "Every chord you need."].map((line, li) => (
              <div key={li} style={{ overflow: "hidden", display: "block" }}>
                {line.split(" ").map((word, wi) => (
                  <span
                    key={wi}
                    className="hero-word"
                    style={{
                      display: "inline-block",
                      marginRight: "0.2em",
                      color: li === 1 ? "var(--amber)" : "var(--t1)",
                      opacity: 0,
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* Sub-text */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            style={{
              fontSize: "clamp(14px, 1.8vw, 17px)",
              color: "var(--t2)",
              maxWidth: 480,
              margin: "0 auto 36px",
              lineHeight: 1.75,
              fontWeight: 400,
            }}
          >
            Growing collection of authentic songs. Real-time chord detection. Built for every guitarist.
          </motion.p>

          {/* Integrated Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: focused ? 1.02 : 1,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              maxWidth: focused ? 720 : 680,
              width: "100%",
              margin: "0 auto 48px",
              position: "relative",
              transition: "max-width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 16, opacity: 0.8 }}>
              Search for a song
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: focused ? "rgba(10,10,15,0.7)" : "rgba(255,255,255,0.04)",
                backdropFilter: focused ? "blur(32px) saturate(1.5)" : "blur(24px)",
                WebkitBackdropFilter: focused ? "blur(32px) saturate(1.5)" : "blur(24px)",
                border: `1px solid ${focused ? "var(--amber)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 20,
                padding: focused ? "8px 24px" : "6px 20px",
                boxShadow: focused
                  ? "0 0 0 4px rgba(245,166,35,0.15), 0 30px 80px rgba(0,0,0,0.8)"
                  : "0 10px 40px rgba(0,0,0,0.3)",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {loading
                ? <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid var(--amber)", borderTopColor: "transparent", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
                : <Search size={20} style={{ color: focused ? "var(--amber)" : "var(--t3)", flexShrink: 0, transition: "color 0.2s" }} />
              }
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 200)}
                placeholder="Search any song, artist, or chord…"
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  padding: "16px 20px", fontSize: 16.5, color: "var(--t1)",
                  fontFamily: "var(--f-body)", fontWeight: 500,
                }}
              />
              {!query && (
                <kbd style={{
                  fontSize: 10, color: "var(--t3)", background: "rgba(255,255,255,0.05)",
                  padding: "4px 8px", borderRadius: 8, fontFamily: "var(--f-mono)", flexShrink: 0,
                  border: "1px solid var(--border)",
                }}>⌘K</kbd>
              )}
            </div>

            {/* Hero Suggestions Dropdown */}
            <AnimatePresence>
              {(focused || showSug) && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{
                    position: "absolute", top: "calc(100% + 12px)", left: 0, right: 0,
                    zIndex: 100, borderRadius: 20, overflow: "hidden",
                    background: "rgba(10,10,15,0.92)", backdropFilter: "blur(32px)",
                    border: "1px solid rgba(245,166,35,0.25)",
                    boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
                  }}
                >
                  {/* Results content remains same as previous search bar dropdown logic */}
                  {query.length >= 2 && suggestions.length > 0 && (
                    <div style={{ padding: "16px 12px 6px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "var(--amber)", marginBottom: 8, paddingLeft: 12, letterSpacing: "0.12em" }}>
                        Quick Suggestions
                      </p>
                      {suggestions.map((s, i) => (
                        <Link
                          key={i}
                          href={`/explore?q=${encodeURIComponent(s.title)}`}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, textDecoration: "none", transition: "all 0.2s" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <Zap size={14} style={{ color: "var(--amber)", flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, fontSize: 15, color: "var(--t1)" }}>{s.title}</span>
                          <span style={{ fontSize: 13, color: "var(--t3)", marginLeft: "auto" }}>{s.artist}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {results.length > 0 && (
                    <div style={{ padding: "12px 12px" }}>
                      <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--t3)", marginBottom: 10, paddingLeft: 12 }}>
                        Top Matches
                      </p>
                      {results.map((song) => (
                        <Link
                          key={song.id}
                          href={`/song/${song.id}`}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "12px 14px", borderRadius: 12, transition: "all 0.2s",
                            textDecoration: "none",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <span>
                            <span style={{ fontWeight: 600, fontSize: 15, color: "var(--t1)" }}>{song.title}</span>
                            <span style={{ fontSize: 13, color: "var(--t3)", marginLeft: 12 }}>{song.artist}</span>
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--amber)", background: "rgba(245,166,35,0.1)", padding: "4px 10px", borderRadius: 8 }}>View Tab</span>
                        </Link>
                      ))}
                      <div style={{ padding: "12px 14px", textAlign: "center", marginTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <Link href="/explore" style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)", textDecoration: "none" }}>
                          Browse all songs in library →
                        </Link>
                      </div>
                    </div>
                  )}
                  {!query && (
                    <div style={{ padding: "16px 12px" }}>
                      <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--t3)", marginBottom: 12, paddingLeft: 12 }}>
                        Popular Right Now
                      </p>
                      {["Wonderwall", "Tum Hi Ho", "Hotel California", "Nothing Else Matters"].map((term) => (
                        <button
                          key={term}
                          onMouseDown={() => setQuery(term)}
                          style={{
                            width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12,
                            padding: "12px 14px", borderRadius: 12, background: "transparent",
                            color: "var(--t2)", fontSize: 15, transition: "all 0.2s",
                            cursor: "pointer", border: "none", fontFamily: "var(--f-body)",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <Flame size={14} style={{ color: "var(--amber)", flexShrink: 0 }} />
                          {term}
                        </button>
                      ))}
                      <div style={{ padding: "12px 14px", textAlign: "center", marginTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <Link href="/explore" style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)", textDecoration: "none" }}>
                          Browse all songs in library →
                        </Link>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── HERO INTERACTIVE SHOWCASE ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{
              maxWidth: 1180,
              margin: "16px auto 0",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: 24,
              alignItems: "stretch",
              textAlign: "left",
            }}
          >
            {/* Playable Virtual Guitar */}
            <div style={{
              background: "rgba(10,10,16,0.85)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              border: "1px solid rgba(245,166,35,0.22)",
              borderRadius: 24,
              padding: "24px",
              boxShadow: "0 30px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(245,166,35,0.15)",
              display: "flex",
              flexDirection: "column",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Music2 size={18} color="var(--amber)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--t1)", margin: 0 }}>Playable Virtual Guitar</h3>
                    <p style={{ fontSize: 12, color: "var(--t3)", margin: 0 }}>Hover or click strings · Keys 1–6 · Real acoustic physics</p>
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--amber)", background: "rgba(245,166,35,0.1)", padding: "4px 10px", borderRadius: 8, border: "1px solid rgba(245,166,35,0.2)" }}>
                  Web Audio 2.0
                </span>
              </div>

              <VirtualGuitar />
            </div>

            {/* Creative 3D Artwork Hero Card */}
            <div style={{
              background: "rgba(10,10,16,0.85)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}>
              <div style={{ position: "relative", height: 250, overflow: "hidden" }}>
                <img
                  src="/assets/hero_guitar.jpg"
                  alt="GeetHub Next-Gen Holographic Guitar Artwork"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,16,0.95) 0%, rgba(10,10,16,0.25) 60%, transparent 100%)" }} />

                {/* Floating pill badge */}
                <div style={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(5,5,8,0.75)",
                  backdropFilter: "blur(12px)",
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: "1px solid rgba(245,166,35,0.3)",
                }}>
                  <Sparkles size={12} color="var(--amber)" />
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: "0.05em" }}>Hyper-Acoustic Engine</span>
                </div>

                <div style={{
                  position: "absolute",
                  bottom: 16,
                  left: 20,
                  right: 20,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                }}>
                  <div>
                    <h4 style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>Dynamic Resonance</h4>
                    <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.75)", margin: "4px 0 0" }}>Harmonic frequency spectrum synced to strumming</p>
                  </div>
                </div>
              </div>

              {/* Sound visualizer + Quick Actions */}
              <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--t3)" }}>Spectrum Analyzer</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--teal)" }}>● 44.1 kHz Hi-Fi</span>
                  </div>
                  <SoundVisualizerCanvas active={true} barCount={28} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: "auto" }}>
                  <Link
                    href="/tools/chords"
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "rgba(245,166,35,0.1)",
                      border: "1px solid rgba(245,166,35,0.25)",
                      color: "var(--amber)",
                      textDecoration: "none",
                      fontSize: 12.5,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <BookOpen size={13} /> Chord Library →
                  </Link>
                  <Link
                    href="/community"
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "var(--t1)",
                      textDecoration: "none",
                      fontSize: 12.5,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <Users size={13} /> Artist Hub →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* No stats here anymore */}
      </section>

      {/* ══════════════════════════════════════════
          LIVE PLATFORM STATS BAR
      ══════════════════════════════════════════ */}
      <section style={{
        background: "rgba(10,10,15,0.9)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "24px 0",
        position: "relative",
      }}>
        <div className="container" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 24,
          alignItems: "center",
          textAlign: "center",
        }}>
          <div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 36, fontWeight: 900, color: "var(--amber)", letterSpacing: "-0.03em" }}>
              <Counter to={6500} suffix="+" />
            </div>
            <p style={{ fontSize: 13, color: "var(--t3)", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Verified Chords & Tabs
            </p>
          </div>
          <div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 36, fontWeight: 900, color: "var(--teal)", letterSpacing: "-0.03em" }}>
              100%
            </div>
            <p style={{ fontSize: 13, color: "var(--t3)", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Interactive Audio Strumming
            </p>
          </div>
          <div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 36, fontWeight: 900, color: "var(--purple)", letterSpacing: "-0.03em" }}>
              8 Pro
            </div>
            <p style={{ fontSize: 13, color: "var(--t3)", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Guitar Theory & Lab Tools
            </p>
          </div>
          <div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 36, fontWeight: 900, color: "#f43f5e", letterSpacing: "-0.03em" }}>
              50K+
            </div>
            <p style={{ fontSize: 13, color: "var(--t3)", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Global Community Guitarists
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          GEETHUB STUDIO & INTERACTIVE THEORY LAB
      ══════════════════════════════════════════ */}
      <section className="section" style={{ background: "var(--obsidian)", position: "relative", overflow: "hidden", padding: "100px 0" }}>
        {/* Glow backdrop */}
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translate(-50%, -50%)", width: "60vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,111,205,0.08) 0%, rgba(245,166,35,0.05) 50%, transparent 80%)", filter: "blur(100px)", pointerEvents: "none" }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          {/* Header */}
          <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 48px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 100, background: "rgba(124,111,205,0.1)", border: "1px solid rgba(124,111,205,0.3)", marginBottom: 16 }}>
              <Sliders size={14} color="var(--purple)" />
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--purple)" }}>
                Next-Gen Interactive Lab
              </span>
            </div>
            <h2 style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: "clamp(30px, 4.5vw, 54px)", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16 }}>
              The Studio Suite. <span className="text-gradient">Play, Jam & Master.</span>
            </h2>
            <p style={{ fontSize: 17, color: "var(--t3)", lineHeight: 1.7 }}>
              Switch between our AI Mood Progression Jammer and multi-track interactive tablature player. Test chord variations, tempo shifts, and rhythm patterns directly in your browser.
            </p>

            {/* Tab selector */}
            <div style={{ display: "inline-flex", gap: 8, padding: 6, background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", marginTop: 24 }}>
              <button
                onClick={() => setStudioTab("jammer")}
                style={{
                  padding: "10px 22px",
                  borderRadius: 12,
                  border: "none",
                  background: studioTab === "jammer" ? "var(--amber)" : "transparent",
                  color: studioTab === "jammer" ? "#000" : "var(--t2)",
                  fontWeight: 800,
                  fontSize: 13.5,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.2s ease",
                }}
              >
                <Sparkles size={15} /> AI Mood Jammer
              </button>
              <button
                onClick={() => setStudioTab("tabs")}
                style={{
                  padding: "10px 22px",
                  borderRadius: 12,
                  border: "none",
                  background: studioTab === "tabs" ? "var(--amber)" : "transparent",
                  color: studioTab === "tabs" ? "#000" : "var(--t2)",
                  fontWeight: 800,
                  fontSize: 13.5,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.2s ease",
                }}
              >
                <Music size={15} /> Interactive Tab Player
              </button>
            </div>
          </div>

          {/* Active Tool View */}
          <div style={{ maxWidth: 1040, margin: "0 auto 60px" }}>
            <AnimatePresence mode="wait">
              {studioTab === "jammer" ? (
                <motion.div
                  key="jammer"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <MoodJammer />
                </motion.div>
              ) : (
                <motion.div
                  key="tabs"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                >
                  <InteractiveTabPlayer />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Access to the 8 Professional Tools */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 48 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
              <div>
                <h3 style={{ fontFamily: "var(--f-display)", fontSize: 24, fontWeight: 800, color: "var(--t1)", letterSpacing: "-0.02em" }}>
                  Professional Guitar Theory Suite
                </h3>
                <p style={{ fontSize: 14, color: "var(--t3)", marginTop: 4 }}>
                  Comprehensive interactive utilities modeled after world-class music theory systems
                </p>
              </div>
              <Link href="/tools" style={{ fontSize: 13.5, fontWeight: 700, color: "var(--amber)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                Explore All 8 Tools <ChevronRight size={16} />
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              {[
                { title: "Chord Finder", desc: "Interactive fretboard with 1,000+ chord voicings & audio playback", href: "/tools/chords", icon: BookOpen, color: "var(--amber)" },
                { title: "Reverse Chord Identifier", desc: "Click fret positions to identify unknown chord names and roots", href: "/tools/reverse-chord", icon: Search, color: "var(--teal)" },
                { title: "Scale Explorer", desc: "Pentatonic, Blues, Modes, and harmonic heatmaps across 24 frets", href: "/tools/scales", icon: Layers, color: "var(--purple)" },
                { title: "Circle of Fifths", desc: "Interactive harmonic wheel for key changes and relative minors", href: "/tools/circle-of-fifths", icon: Compass, color: "#f43f5e" },
              ].map((tool, idx) => (
                <Link
                  key={idx}
                  href={tool.href}
                  style={{
                    textDecoration: "none",
                    background: "rgba(14,14,20,0.75)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 18,
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${tool.color}55`;
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = `0 16px 36px rgba(0,0,0,0.5), 0 0 20px ${tool.color}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${tool.color}15`, border: `1px solid ${tool.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <tool.icon size={18} color={tool.color} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--t1)", margin: "0 0 4px" }}>{tool.title}</h4>
                    <p style={{ fontSize: 13, color: "var(--t3)", lineHeight: 1.5, margin: 0 }}>{tool.desc}</p>
                  </div>
                  <div style={{ marginTop: "auto", fontSize: 12, fontWeight: 700, color: tool.color, display: "flex", alignItems: "center", gap: 4 }}>
                    Launch Tool <ChevronRight size={13} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PLAY ALONG
      ══════════════════════════════════════════ */}
      <section className="section" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", position: "relative", overflow: "hidden", padding: "140px 0" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url("https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=2400&auto=format&q=85")`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.12, filter: "grayscale(20%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, var(--obsidian) 30%, transparent 100%)", zIndex: 1 }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "45vw", height: "45vw", borderRadius: "50%", background: "rgba(245,166,35,0.08)", filter: "blur(120px)" }} />

        <div className="container" style={{ display: "flex", gap: "80px", flexWrap: "wrap", alignItems: "center", position: "relative", zIndex: 2 }}>
          <motion.div
            style={{ flex: "1 1 450px" }}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: "clamp(32px, 5vw, 64px)", marginBottom: 24, lineHeight: 1, letterSpacing: "-0.04em" }}>
              The Stage <span className="text-gradient">is Yours.</span>
            </h2>
            <p style={{ fontSize: 18, color: "var(--t2)", lineHeight: 1.8, maxWidth: 500, marginBottom: 40, fontWeight: 500 }}>
              Connect your guitar, enable your mic, and play in real-time. Our AI detects every note, scores your accuracy, and keeps you in the pocket with auto-scroll.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 48 }}>
              {[
                { label: "Real-time chord recognition", icon: AudioLines },
                { label: "Live accuracy scoring engine", icon: Star },
                { label: "Hands-free auto-scroll syncing", icon: Zap }
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <item.icon size={14} style={{ color: "var(--amber)" }} />
                  </div>
                  <span style={{ fontSize: 16, color: "var(--t1)", fontWeight: 600 }}>{item.label}</span>
                </div>
              ))}
            </div>
            <Magnetic>
              <Link href="/play-along" className="btn btn-primary btn-lg" style={{ padding: "18px 36px", fontSize: 16, borderRadius: 14 }}>
                Start Your Session <ChevronRight size={18} />
              </Link>
            </Magnetic>

          </motion.div>

          <motion.div
            style={{ flex: "1 1 400px", maxWidth: 550 }}
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="glass-elevated" style={{ padding: 36, border: "1px solid rgba(245,166,35,0.15)", background: "rgba(10,10,15,0.95)", boxShadow: "0 60px 120px rgba(0,0,0,0.8)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
                <div>
                  <p style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 20, color: "var(--t1)", letterSpacing: "-0.01em" }}>Hotel California</p>
                  <p style={{ fontSize: 13, color: "var(--t3)", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Eagles · BPM 147 · 4/4</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <span style={{ padding: "4px 12px", borderRadius: 10, background: "rgba(52,211,153,0.12)", color: "#34d399", fontSize: 12, fontWeight: 800, marginBottom: 8 }}>STREAK 14</span>
                  <span style={{ fontFamily: "var(--f-mono)", color: "var(--amber)", fontSize: 28, fontWeight: 900 }}>88%</span>
                </div>
              </div>

              <div style={{ height: 110, background: "rgba(255,255,255,0.02)", borderRadius: 16, display: "flex", alignItems: "center", gap: 24, overflow: "hidden", marginBottom: 32, padding: "0 28px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 24, fontWeight: 800, color: "#34d399", opacity: 0.4 }}>Bm</span>
                <motion.div
                  style={{ border: "2px solid var(--amber)", borderRadius: 14, padding: "12px 24px", background: "rgba(245,166,35,0.08)" }}
                  animate={{ boxShadow: ["0 0 0 0 rgba(245,166,35,0.3)", "0 0 30px 10px rgba(245,166,35,0.15)", "0 0 0 0 rgba(245,166,35,0.3)"] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 42, fontWeight: 900, color: "var(--amber)" }}>F#m</span>
                </motion.div>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 24, fontWeight: 800, color: "var(--t1)", opacity: 0.2 }}>A</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <GuitarWaveform />
                <div style={{ marginLeft: 8 }}>
                  <p style={{ fontSize: 12, color: "var(--t3)", fontWeight: 700, textTransform: "uppercase" }}>Analyzing</p>
                  <p style={{ fontFamily: "var(--f-mono)", fontSize: 24, fontWeight: 900, color: "var(--t1)" }}>F#m</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════════ */}
      <section className="section" style={{ background: "var(--obsidian)", borderTop: "1px solid var(--border)", padding: "120px 0" }}>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <h2 style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: "clamp(30px, 4.5vw, 56px)", marginBottom: 20, letterSpacing: "-0.04em" }}>
              Built for <span className="text-gradient">Performance.</span>
            </h2>
            <p style={{ fontSize: 17, color: "var(--t3)", maxWidth: 500, margin: "0 auto", lineHeight: 1.8, fontWeight: 400 }}>
              Pro-grade features designed by musicians, for musicians. Experience the future of practice.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 16,
          }}>
            {FEATURES.map((f, i) => <FeatureCard key={f.label} {...f} delay={i * 0.08} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CREATOR COMMUNITY & PRO MASTERCLASSES
      ══════════════════════════════════════════ */}
      <section className="section" style={{ background: "var(--obsidian)", borderTop: "1px solid var(--border)", padding: "100px 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 56px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 100, background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.3)", marginBottom: 16 }}>
              <Users size={14} color="var(--amber)" />
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--amber)" }}>
                The Global Guitar Network
              </span>
            </div>
            <h2 style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: "clamp(30px, 4.5vw, 54px)", letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16 }}>
              Connect. Learn. <span className="text-gradient">Take the Stage.</span>
            </h2>
            <p style={{ fontSize: 17, color: "var(--t3)", lineHeight: 1.7 }}>
              Whether you are sharing your latest acoustic riff, learning masterclasses from virtuosos, or jamming with global artists — GeetHub is your creative home.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 28 }}>
            {/* Card 1: Creator Community Stage */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{
                position: "relative",
                borderRadius: 24,
                overflow: "hidden",
                border: "1px solid rgba(245,166,35,0.25)",
                background: "rgba(14,14,20,0.9)",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
              }}
            >
              <div style={{ position: "relative", height: 260, overflow: "hidden" }}>
                <img
                  src="/assets/community_stage.jpg"
                  alt="Live Concert Community Jam Stage"
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(14,14,20,0.95) 0%, rgba(14,14,20,0.2) 60%, transparent 100%)" }} />
                <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(5,5,8,0.8)", backdropFilter: "blur(12px)", padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(245,166,35,0.3)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Video size={13} color="var(--amber)" />
                  <span style={{ fontSize: 11, fontWeight: 800, color: "var(--amber)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Creator Community</span>
                </div>
              </div>

              <div style={{ padding: "28px 32px", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <h3 style={{ fontFamily: "var(--f-display)", fontSize: 26, fontWeight: 900, color: "var(--t1)", letterSpacing: "-0.02em", marginBottom: 8 }}>
                    Jam Stage & Video Feed
                  </h3>
                  <p style={{ fontSize: 15, color: "var(--t3)", lineHeight: 1.6 }}>
                    Upload guitar performance videos, attach songs & tabs, like & comment on community posts, and chat live in real-time with fellow musicians worldwide.
                  </p>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "8px 0" }}>
                  {[
                    "🎥 Video Performances",
                    "💬 Real-Time Live Chat",
                    "🎸 Tab Attachments",
                    "🔥 Like & Follow Artists",
                  ].map((feat, i) => (
                    <span key={i} style={{ fontSize: 12, fontWeight: 700, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "5px 12px", borderRadius: 8, color: "var(--t2)" }}>
                      {feat}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: "auto", paddingTop: 12 }}>
                  <Link
                    href="/community"
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center", padding: "14px 24px", borderRadius: 14, fontSize: 14.5, fontWeight: 800 }}
                  >
                    Enter Jam Stage <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Pro Masterclasses & Academy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              style={{
                position: "relative",
                borderRadius: 24,
                overflow: "hidden",
                border: "1px solid rgba(124,111,205,0.3)",
                background: "rgba(14,14,20,0.9)",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
              }}
            >
              <div style={{ position: "relative", height: 260, overflow: "hidden" }}>
                <img
                  src="/assets/masterclass_art.jpg"
                  alt="Vintage Studio Masterclass Guitar"
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(14,14,20,0.95) 0%, rgba(14,14,20,0.2) 60%, transparent 100%)" }} />
                <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(5,5,8,0.8)", backdropFilter: "blur(12px)", padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(124,111,205,0.4)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={13} color="var(--purple)" />
                  <span style={{ fontSize: 11, fontWeight: 800, color: "var(--purple)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Pro Masterclasses</span>
                </div>
              </div>

              <div style={{ padding: "28px 32px", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <h3 style={{ fontFamily: "var(--f-display)", fontSize: 26, fontWeight: 900, color: "var(--t1)", letterSpacing: "-0.02em", marginBottom: 8 }}>
                    GeetHub Academy & Courses
                  </h3>
                  <p style={{ fontSize: 15, color: "var(--t3)", lineHeight: 1.6 }}>
                    Comprehensive curricula from master educators. Learn Fingerstyle acoustic arrangements, Neo-Soul jazz voicings, and soloing techniques with synced video players.
                  </p>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "8px 0" }}>
                  {[
                    "📺 4K Video Instruction",
                    "🎼 Synced Interactive Tab Player",
                    "⚡ Backing Tracks & Drills",
                    "🏆 Certificate on Completion",
                  ].map((feat, i) => (
                    <span key={i} style={{ fontSize: 12, fontWeight: 700, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "5px 12px", borderRadius: 8, color: "var(--t2)" }}>
                      {feat}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", gap: 12 }}>
                  <Link
                    href="/courses"
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: "center", padding: "14px 20px", borderRadius: 14, fontSize: 14.5, fontWeight: 800, background: "linear-gradient(135deg, var(--purple), #6366f1)" }}
                  >
                    Explore Courses <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/pro"
                    className="btn btn-surface"
                    style={{ padding: "14px 20px", borderRadius: 14, fontSize: 14.5, fontWeight: 800, border: "1px solid rgba(245,166,35,0.3)", color: "var(--amber)" }}
                  >
                    Pro Plan
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          GENRES SHOWCASE
      ══════════════════════════════════════════ */}
      <section className="section" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", padding: "120px 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 60 }}>
            <div>
              <h2 style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: "clamp(28px, 4vw, 52px)", letterSpacing: "-0.04em" }}>
                Diversify your <span className="text-gradient">Sound.</span>
              </h2>
            </div>
            <Link href="/explore" className="btn btn-surface btn-md hide-mobile" style={{ gap: 8, padding: "12px 24px", borderRadius: 12 }}>
              View All Genres <ChevronRight size={16} />
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {GENRES.slice(0, 8).map((genre, i) => (
              <motion.div
                key={genre.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <GenreCard
                  name={genre.name}
                  color={genre.color}
                  imageUrl={genre.image}
                  href={`/explore?genre=${genre.name}`}
                  index={i}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BOLLYWOOD 2026 — TRENDING HITS
      ══════════════════════════════════════════ */}
      <section
        style={{
          background: "var(--obsidian)",
          borderTop: "1px solid var(--border)",
          padding: "100px 0 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient background glow */}
        <div style={{
          position: "absolute",
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "70vw",
          height: "60vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, rgba(245,166,35,0.06) 45%, transparent 75%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }} />
        {/* Film grain overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(\"https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=1800&auto=format&q=40\")",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
          opacity: 0.04,
          pointerEvents: "none",
        }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          {/* Section header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "linear-gradient(90deg, rgba(168,85,247,0.15), rgba(245,166,35,0.12))",
                border: "1px solid rgba(168,85,247,0.3)",
                borderRadius: 10,
                padding: "6px 14px",
                marginBottom: 16,
              }}>
                <span style={{ fontSize: 14 }}>🎸</span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  background: "linear-gradient(90deg, #c084fc, #f59e0b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  Best of 2026
                </span>
              </div>
              <h2 style={{
                fontFamily: "var(--f-display)",
                fontWeight: 900,
                fontSize: "clamp(28px, 4vw, 52px)",
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
              }}>
                <span style={{
                  background: "linear-gradient(135deg, #f59e0b 0%, #c084fc 50%, #60a5fa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>Bollywood</span>{" "}
                <span style={{ color: "var(--t1)" }}>Hits 🔥</span>
              </h2>
              <p style={{ fontSize: 14, color: "var(--t3)", marginTop: 8, fontWeight: 500 }}>
                The hottest chords trending on Geethub right now
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href="/explore?genre=Bollywood"
                className="btn btn-surface btn-md hide-mobile"
                style={{ gap: 8, padding: "12px 24px", borderRadius: 12 }}
              >
                All Bollywood Songs <ChevronRight size={16} />
              </Link>
            </motion.div>
          </div>

          {/* Horizontal scroll rail */}
          <div
            className="scrollbar-hide"
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              paddingBottom: 20,
              paddingInline: 2,
              marginInline: -2,
              scrollSnapType: "x mandatory",
            }}
          >
            {bwoodLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton"
                  style={{
                    width: 200,
                    height: 240,
                    borderRadius: 18,
                    flexShrink: 0,
                  }}
                />
              ))
              : bwood2026.map((song, i) => (
                <div key={song.id} style={{ scrollSnapAlign: "start" }}>
                  <Bollywood2026Card song={song} i={i} />
                </div>
              ))
            }
          </div>

          {/* View all mobile CTA */}
          <div style={{ textAlign: "center", marginTop: 32 }} className="show-mobile">
            <Link
              href="/explore?genre=Bollywood"
              className="btn btn-surface btn-md"
              style={{ gap: 8, padding: "12px 24px", borderRadius: 12 }}
            >
              All Bollywood Songs <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER CTA
      ══════════════════════════════════════════ */}
      <section style={{ padding: "160px 0", background: "var(--obsidian)", position: "relative", textAlign: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 100%, rgba(245,166,35,0.12), transparent 75%)" }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <motion.h2
            initial={{ opacity: 0, y: 40, filter: "blur(10px)", scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: "clamp(36px, 6vw, 92px)", letterSpacing: "-0.05em", lineHeight: 0.85, marginBottom: 40 }}
          >
            Master your instrument<br />
            <span style={{ color: "rgba(255,255,255,0.08)" }}>One chord at a time.</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}
          >
            <Link href="/explore" className="btn btn-primary btn-lg" style={{ minWidth: 240, padding: "22px 48px", fontSize: 18, borderRadius: 16 }}>
              Get Started for Free
            </Link>
            <Link href="/contribute" className="btn btn-secondary btn-lg" style={{ minWidth: 240, padding: "22px 48px", fontSize: 18, borderRadius: 16 }}>
              Contribute Chords
            </Link>
          </motion.div>
          <p style={{ fontSize: 13, color: "var(--t3)", marginTop: 40, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            No account needed · Open source · Community powered
          </p>
        </div>
      </section>
    </div>
  );
}
// Final 6.5K+ Song Release
