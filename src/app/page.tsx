"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Mic, Play, Star, Music2, Zap, Shuffle, ListMusic, Wifi,
  Users, Brain, ChevronRight, Flame, Headphones,
  AudioLines, CheckCircle2, Sparkles,
} from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import GenreCard from "@/components/GenreCard";
import InfiniteMarquee from "@/components/InfiniteMarquee";

/* ── High-End Magnetic Button Wrapper ───────────────────── */
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

/* ── Animated Counter ───────────────────────────────────── */
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

/* ── Guitar Waveform ────────────────────────────────────── */
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

/* ── Feature Card ────────────────────────────────────────── */
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

/* ── Data ──────────────────────────────────────────────────── */

const FEATURES = [
  { icon: Play, label: "Play Along", desc: "Real-time mic detection & accuracy scoring. Practice at your own BPM with live audio feedback.", color: "var(--amber)", span: 8, meta: "LATENCY < 1MS", bgImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&q=85" },
  { icon: Brain, label: "AI Simplifier", desc: "Complex chords instantly converted to beginner-friendly shapes.", color: "var(--purple)", span: 4, meta: "V3.2 CORE" },
  { icon: Shuffle, label: "Transpose", desc: "Instant key changes with a built-in capo calculator for guitarists.", color: "var(--teal)", span: 4, meta: "ALGO-V" },
  { icon: Zap, label: "Stage Mode", desc: "Full-screen zero-chrome view designed for live performances on dark stages.", color: "var(--rose)", span: 8, meta: "LIVE-SYNC", bgImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&q=85" },
  { icon: Wifi, label: "Offline Ready", desc: "Save songs and practice without internet connection.", color: "var(--teal)", span: 4, meta: "PWA ENABLED" },
  { icon: Headphones, label: "Mood Search", desc: "'Sad acoustic songs in Am' — just describe it and find it with our natural language search engine.", color: "var(--amber)", span: 8, meta: "AI-SEARCH", bgImage: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&auto=format&q=85" },
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

const TESTIMONIALS = [
  { name: "Rohan M.", role: "Acoustic Guitar", quote: "I learned Stairway to Heaven in 2 weeks using the AI Simplifier. Literally game-changing.", stars: 5 },
  { name: "Priya S.", role: "Ukulele Player", quote: "Play Along mode made my accuracy jump from 58% to 93% in 10 days. Nothing else comes close.", stars: 5 },
  { name: "Alex K.", role: "Electric Guitar", quote: "Replaced Ultimate Guitar entirely. Autoscroll at custom BPM during live gigs is insane.", stars: 5 },
  { name: "Dev R.", role: "Bass + Guitar", quote: "The chord transposition tool is razor accurate. Changed how I teach beginner students.", stars: 5 },
  { name: "Meera T.", role: "Indie Vocalist", quote: "Found every Bollywood song I ever wanted. The search is incredibly fast and accurate.", stars: 5 },
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

        {/* Dark cinematic overlay — stronger at edges, lighter in center */}
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

          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            style={{ marginBottom: 30 }}
          >
            <span className="section-label">
              <Music2 size={10} /> 6,500+ Authentic Songs · Open Source · Free Forever
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
            6,500+ authentic songs. Real-time chord detection. Built for every guitarist — from bedroom to stage.
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
              Search 6,500+ verified songs instantly
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
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Quick Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}
          >
            {[
              { icon: Headphones, label: "6.5K+ Songs" },
              { icon: Users, label: "2M+ Users" },
              { icon: Star, label: "4.9 Rating" },
            ].map((b, i) => (
              <span
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  fontSize: 13, fontWeight: 700,
                  color: "rgba(255,255,255,0.55)", letterSpacing: "0.02em",
                }}
              >
                <b.icon size={16} style={{ color: "var(--amber)" }} />
                {b.label}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Cinematic Bottom Gradient */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "15vh", background: "linear-gradient(to top, var(--obsidian), transparent)", zIndex: 1 }} />
      </section>

      {/* ══════════════════════════════════════════
          CINEMATIC STATS
      ══════════════════════════════════════════ */}
      <section style={{ padding: "160px 0", background: "var(--obsidian)", position: "relative", overflow: "hidden" }}>
        {/* Ambient glows behind cards */}
        <div style={{ position: "absolute", top: "20%", left: "10%", width: "40vw", height: "40vw", borderRadius: "50%", background: "rgba(245,166,35,0.04)", filter: "blur(100px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "10%", width: "35vw", height: "35vw", borderRadius: "50%", background: "rgba(124,111,205,0.03)", filter: "blur(80px)", pointerEvents: "none" }} />

        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />

        {/* Large faint background text — Now with a holographic pulse */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", textAlign: "center", pointerEvents: "none", userSelect: "none" }}>
          <motion.h2 
            animate={{ opacity: [0.035, 0.06, 0.035] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{ 
              fontSize: "22vw", 
              fontFamily: "var(--f-display)", 
              fontWeight: 900, 
              whiteSpace: "nowrap",
              background: "linear-gradient(90deg, var(--amber) 0%, var(--purple) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.05em"
            }}
          >
            MUSIC
          </motion.h2>
        </div>

        <div className="container" style={{ position: "relative", zIndex: 1, maxWidth: 1100 }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "stretch", // Stretch for divider consistency
            gap: 0,
            flexWrap: "nowrap" 
          }}>
            {[
              { to: 6500,   suffix: "+", label: "Songs indexed", desc: "Every genre, era.", icon: Music2, color: "var(--amber)" },
              { to: 2400000, suffix: "+", label: "Musicians", desc: "Practicing daily.", icon: Users, color: "var(--purple)" },
              { to: 99,      suffix: "%", label: "Accuracy Rate", desc: "Studio-verified.", icon: AudioLines, color: "var(--teal)" },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  style={{ 
                    flex: 1,
                    textAlign: "center", 
                    padding: "40px 20px",
                    position: "relative",
                    zIndex: 2
                  }}
                >
                  {/* Subtle soft glow behind each stat */}
                  <div style={{ 
                    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    width: "120%", height: "120%", borderRadius: "50%", 
                    background: `radial-gradient(circle, ${s.color}15 0%, transparent 70%)`,
                    opacity: 0.6, pointerEvents: "none", zIndex: -1
                  }} />

                  <div style={{ 
                    width: 48, height: 48, borderRadius: 14, 
                    background: "rgba(255,255,255,0.03)", 
                    backdropFilter: "blur(8px)",
                    border: `1px solid rgba(255,255,255,0.08)`, 
                    display: "flex", alignItems: "center", justifyContent: "center", 
                    margin: "0 auto 20px",
                    transition: "all 0.3s var(--spring)"
                  }} className="icon-glass">
                    <s.icon size={20} style={{ color: "var(--t1)", opacity: 0.8 }} />
                  </div>

                  <p style={{
                    fontFamily: "var(--f-display)", fontWeight: 900,
                    fontSize: "clamp(52px, 8vw, 84px)",
                    color: "#fff",
                    textShadow: `0 10px 30px ${s.color}44`, // Holographic glow
                    letterSpacing: "-0.05em", lineHeight: 1, marginBottom: 12
                  }}>
                    <Counter to={s.to} suffix={s.suffix} />
                  </p>
                  
                  <p style={{ fontSize: 13, fontWeight: 800, color: s.color, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 10 }}>
                    {s.label}
                  </p>
                  <p style={{ fontSize: 15, color: "var(--t2)", fontWeight: 500, lineHeight: 1.6, maxWidth: "16ch", margin: "0 auto" }}>{s.desc}</p>
                </motion.div>

                {/* Vertical Divider */}
                {i < 2 && (
                  <div style={{ 
                    width: 1, 
                    alignSelf: "center",
                    height: "120px", 
                    background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)" 
                  }} />
                )}
              </React.Fragment>
            ))}
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
            <span className="section-label" style={{ background: "rgba(245,166,35,0.15)", color: "var(--amber)", border: "1px solid rgba(245,166,35,0.3)" }}><Zap size={10} /> AI Powered Stage Mode</span>
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
            <span className="section-label" style={{ background: "rgba(124,111,205,0.12)", color: "var(--purple)", border: "1px solid rgba(124,111,205,0.25)" }}><Sparkles size={10} /> Pro Mastery Tools</span>
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
          PREMIUM ACADEMY SECTION
      ══════════════════════════════════════════ */}
      <section style={{ background: "var(--obsidian)", padding: "0", position: "relative", overflow: "hidden" }}>

        {/* Two-column cinematic split */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 700 }}>

          {/* — Left: HD Image panel — */}
          <div style={{ position: "relative", overflow: "hidden", minHeight: 600 }}>
            <img
              src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1400&q=90&auto=format&fit=crop"
              alt="Person learning guitar with AI assistance"
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
              }}
            />
            {/* Gradient fade into right panel */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(5,5,10,0) 50%, var(--obsidian) 100%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, rgba(5,5,10,0.7) 100%)" }} />

            {/* Floating badge */}
            <div style={{ position: "absolute", bottom: 40, left: 40, padding: "12px 20px", background: "rgba(5,5,10,0.85)", backdropFilter: "blur(20px)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 16 }}>
              <div style={{ fontSize: 11, color: "var(--amber)", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Now available</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>AI-Powered Lessons</div>
            </div>
          </div>

          {/* — Right: Copy + Features — */}
          <div style={{ padding: "80px 60px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative" }}>
            {/* Ambient glow */}
            <div style={{ position: "absolute", top: "30%", right: "-10%", width: "60%", height: "60%", background: "radial-gradient(ellipse, rgba(245,166,35,0.08) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "relative", zIndex: 1 }}
            >
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 14px", background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 100, color: "var(--amber)", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 28 }}>
                <Flame size={13} /> Elite Access
              </div>

              <h2 style={{ fontFamily: "var(--f-display)", fontSize: "clamp(34px, 3.5vw, 52px)", fontWeight: 900, color: "var(--t1)", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 20 }}>
                Premium Guitar <br />
                <span style={{ color: "var(--amber)" }}>Academy.</span>
              </h2>

              <p style={{ fontSize: 17, color: "var(--t3)", lineHeight: 1.7, marginBottom: 40, maxWidth: 440 }}>
                Unlock the internet&apos;s most advanced guitar learning suite. Master any theory concept with industry-first AI tools designed exclusively for guitarists.
              </p>

              {/* Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
                {[
                  { icon: Brain, color: "var(--purple)", title: "Personalized AI Teacher", desc: "Adaptive curriculum that listens and corrects you in real-time." },
                  { icon: CheckCircle2, color: "var(--teal)", title: "Scratch Music Theory Notes", desc: "Bespoke theory notes tailored to every chord progression." },
                  { icon: Zap, color: "var(--amber)", title: "Industry-First AI Simplifier", desc: "Convert complex math-rock & jazz chords into simple shapes instantly." },
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                    style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${f.color}12`, border: `1px solid ${f.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <f.icon size={18} color={f.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)", marginBottom: 3, letterSpacing: "-0.01em" }}>{f.title}</div>
                      <div style={{ fontSize: 13.5, color: "var(--t3)", lineHeight: 1.55 }}>{f.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pricing row */}
              <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "24px 28px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: "var(--t3)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Monthly</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                    <span style={{ fontFamily: "var(--f-display)", fontSize: 42, fontWeight: 900, color: "var(--t1)", letterSpacing: "-0.04em" }}>₹500</span>
                    <span style={{ fontSize: 15, color: "var(--t3)", fontWeight: 500 }}>/mo</span>
                  </div>
                </div>
                <div style={{ width: 1, height: 50, background: "var(--border)", flexShrink: 0 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Magnetic>
                    <button className="btn" style={{ padding: "13px 24px", background: "var(--amber)", color: "#000", fontSize: 15, fontWeight: 800, borderRadius: 12, border: "none", display: "inline-flex", gap: 8, alignItems: "center", cursor: "pointer", whiteSpace: "nowrap" }}>
                      Start Free Trial <ChevronRight size={16} />
                    </button>
                  </Magnetic>
                  <p style={{ fontSize: 12, color: "var(--t3)", textAlign: "center" }}>7-day free · Cancel anytime</p>
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
              <span className="section-label" style={{ background: "rgba(20,184,166,0.15)", color: "var(--teal)", border: "1px solid rgba(20,184,166,0.3)" }}><AudioLines size={10} /> Musical Exploration</span>
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
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="section" style={{ background: "var(--obsidian)", borderTop: "1px solid var(--border)", padding: "120px 0", overflow: "hidden" }}>
        <div className="container" style={{ marginBottom: 60 }}>
          <div style={{ textAlign: "center" }}>
            <span className="section-label" style={{ background: "rgba(244,63,94,0.15)", color: "var(--rose)", border: "1px solid rgba(244,63,94,0.3)" }}><Star size={10} /> Community Vibes</span>
            <h2 style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: "clamp(28px, 4vw, 52px)", letterSpacing: "-0.04em", marginBottom: 12 }}>
              Guitarists <span className="text-gradient">love Geethub.</span>
            </h2>
          </div>
        </div>

        <div className="scrollbar-hide" style={{ display: "flex", gap: 20, overflowX: "auto", paddingInline: "calc((100vw - 1200px) / 2)", paddingBottom: 20 }}>
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <div key={i} className="glass" style={{ padding: "32px", minWidth: 350, maxWidth: 400, flexShrink: 0, display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
                {[...Array(t.stars)].map((_, j) => <Star key={j} size={14} style={{ color: "var(--amber)" }} fill="var(--amber)" />)}
              </div>
              <p style={{ fontSize: 16, color: "var(--t1)", lineHeight: 1.8, marginBottom: 24, fontStyle: "italic", flex: 1, fontWeight: 500 }}>
                "{t.quote}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, var(--amber) 0%, #e08010 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, color: "#050507", flexShrink: 0 }}>
                  {t.name[0]}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)" }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: "var(--t3)", fontWeight: 600, textTransform: "uppercase" }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
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
            <Link href="/commit" className="btn btn-secondary btn-lg" style={{ minWidth: 240, padding: "22px 48px", fontSize: 18, borderRadius: 16 }}>
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
