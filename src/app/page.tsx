"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Search, Mic, Play, Star, Music2, Zap, Shuffle, ListMusic, Wifi,
  Users, Brain, ChevronRight, Flame, Headphones, ArrowRight, Guitar,
  AudioLines, CheckCircle2, Sparkles
} from "lucide-react";

/* ── Animated counter ───────────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [val, setVal] = useState(0);
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
      {val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}{suffix}
    </span>
  );
}

/* ── Guitar Waveform ────────────────────────────────────────── */
function GuitarWaveform() {
  const bars = [35, 60, 45, 80, 55, 90, 40, 70, 50, 85, 38, 65, 48, 78, 42];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 40 }}>
      {bars.map((h, i) => (
        <motion.div
          key={i}
          style={{ width: 3, background: `rgba(240,154,34,${0.3 + (i % 3) * 0.2})`, borderRadius: 2 }}
          animate={{ height: [`${h * 0.4}%`, `${h}%`, `${h * 0.6}%`, `${h}%`] }}
          transition={{ duration: 1.2 + i * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
        />
      ))}
    </div>
  );
}

/* ── Song Card ──────────────────────────────────────────────── */
const DIFFICULTIES: Record<string, "Beginner" | "Intermediate" | "Expert"> = {
  "Hotel California": "Intermediate", "Wonderwall": "Beginner",
  "Bohemian Rhapsody": "Expert", "Tum Hi Ho": "Intermediate",
  "Let Her Go": "Beginner", "Phir Kabhi": "Beginner",
  "Nothing Else Matters": "Intermediate", "Stairway to Heaven": "Expert",
};

const SONG_COLORS: Record<string, { from: string; to: string }> = {
  "Hotel California":    { from: "#f09a22", to: "#e08010" },
  "Wonderwall":          { from: "#8b7aff", to: "#6b5adf" },
  "Bohemian Rhapsody":   { from: "#f87171", to: "#dc4040" },
  "Tum Hi Ho":           { from: "#34d399", to: "#10b981" },
  "Let Her Go":          { from: "#60a5fa", to: "#3b82f6" },
  "Phir Kabhi":          { from: "#f09a22", to: "#e08010" },
  "Nothing Else Matters":{ from: "#8b7aff", to: "#6b5adf" },
  "Stairway to Heaven":  { from: "#f87171", to: "#dc4040" },
};

function SongCard({ title, artist, delay = 0 }: { title: string; artist: string; delay?: number }) {
  const diff = DIFFICULTIES[title] ?? "Intermediate";
  const colors = SONG_COLORS[title] ?? { from: "#f09a22", to: "#e08010" };
  const bars = (title + artist).split("").slice(0, 10).map((c, i) => ((c.charCodeAt(0) * (i + 3)) % 65) + 30);

  return (
    <motion.div
      className="song-card"
      style={{ width: 200, height: 270, flexShrink: 0 }}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Visual header */}
      <div style={{
        height: "62%",
        background: `linear-gradient(160deg, ${colors.from}18 0%, ${colors.to}08 100%)`,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 4,
        padding: "0 18px 18px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle top glow */}
        <div style={{
          position: "absolute",
          top: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: 2,
          background: `linear-gradient(90deg, transparent, ${colors.from}, transparent)`,
          opacity: 0.6,
        }} />

        {bars.map((h, i) => (
          <motion.div
            key={i}
            style={{
              width: 5,
              background: `linear-gradient(to top, ${colors.from}, ${colors.from}60)`,
              borderRadius: "3px 3px 0 0",
              opacity: 0.7 + i * 0.03,
            }}
            animate={{ height: [`${h}%`, `${h * 0.5}%`, `${h * 1.1}%`, `${h}%`] }}
            transition={{ duration: 2 + i * 0.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.13 }}
          />
        ))}
      </div>

      {/* Play overlay */}
      <div className="song-card-play">
        <div style={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          background: colors.from,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 32px ${colors.from}60`,
        }}>
          <Play size={18} style={{ color: "#060608", marginLeft: 2 }} fill="currentColor" />
        </div>
      </div>

      {/* Metadata */}
      <div style={{ padding: "14px 16px 16px", background: "rgba(6,6,8,0.92)" }}>
        <span className={`badge badge-${diff.toLowerCase()}`} style={{ marginBottom: 8 }}>{diff}</span>
        <p style={{
          fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 14,
          color: "var(--t1)", marginBottom: 3,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{title}</p>
        <p style={{ fontSize: 12, color: "var(--t3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {artist}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Feature Card ───────────────────────────────────────────── */
function FeatureCard({ icon: Icon, label, desc, color = "#f09a22", delay = 0 }: {
  icon: any; label: string; desc: string; color?: string; delay?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2, cy = rect.height / 2;
    const rx = ((y - cy) / cy) * -8;
    const ry = ((x - cx) / cx) * 8;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
    cardRef.current.style.boxShadow = `0 16px 40px rgba(0,0,0,0.4), ${ry * -1}px ${rx}px 24px ${color}18`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    cardRef.current.style.boxShadow = "none";
  };

  return (
    <motion.div
      ref={cardRef}
      className="glass interactive"
      style={{ padding: 24, transition: "transform 0.12s ease-out, box-shadow 0.12s ease-out", transformStyle: "preserve-3d", cursor: "default" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: `${color}14`,
        border: `1px solid ${color}28`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        transform: "translateZ(20px)",
      }}>
        <Icon size={20} style={{ color }} />
      </div>
      <p style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 15, marginBottom: 7, color: "var(--t1)", transform: "translateZ(10px)" }}>
        {label}
      </p>
      <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, transform: "translateZ(5px)" }}>
        {desc}
      </p>
    </motion.div>
  );
}

/* ── Marquee Strip ──────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  "Hotel California", "Tum Hi Ho", "Wonderwall", "Bohemian Rhapsody", "Stairway to Heaven",
  "Let Her Go", "Shape of You", "Agar Tum Saath Ho", "Nothing Else Matters", "Phir Kabhi",
  "More Than Words", "Tere Bin", "Counting Stars", "Photograph", "Fix You",
];
function Marquee() {
  const text = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="marquee" style={{ paddingBlock: 14 }}>
      <div className="marquee-inner">
        {text.map((t, i) => (
          <span key={i} style={{
            fontFamily: "var(--f-display)", fontWeight: 900,
            fontSize: "clamp(28px, 4.5vw, 48px)",
            color: "rgba(255,255,255,0.04)",
            marginRight: 52,
            letterSpacing: "-0.04em",
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function HomePage() {
  const [query, setQuery]     = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSug, setShowSug] = useState(false);

  // Keyboard shortcut: ⌘K focuses the search input
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

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/songs/search?q=${encodeURIComponent(query)}&limit=7`);
        const d = await r.json();
        setResults(d.songs || []);
      } catch { setResults([]); } finally { setLoading(false); }
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  const TRENDING = [
    { title: "Hotel California",    artist: "Eagles" },
    { title: "Wonderwall",          artist: "Oasis" },
    { title: "Bohemian Rhapsody",   artist: "Queen" },
    { title: "Tum Hi Ho",           artist: "Arijit Singh" },
    { title: "Let Her Go",          artist: "Passenger" },
    { title: "Phir Kabhi",          artist: "Arijit Singh" },
    { title: "Nothing Else Matters",artist: "Metallica" },
    { title: "Stairway to Heaven",  artist: "Led Zeppelin" },
  ];

  const FEATURES = [
    { icon: Play,       label: "Play Along",     desc: "Real-time mic detection & accuracy scoring", color: "#f09a22" },
    { icon: Brain,      label: "AI Simplifier",  desc: "Complex chords converted to beginner shapes", color: "#8b7aff" },
    { icon: Shuffle,    label: "Transpose",      desc: "Instant key changes with capo calculator",     color: "#34d399" },
    { icon: ListMusic,  label: "Setlists",       desc: "Organize songs for your next gig or practice", color: "#f09a22" },
    { icon: Zap,        label: "Stage Mode",     desc: "Full-screen zero-chrome performance view",     color: "#f87171" },
    { icon: Wifi,       label: "Offline Ready",  desc: "Save songs & practice without the internet",   color: "#34d399" },
    { icon: Users,      label: "Community",      desc: "Contribute & vote on 50,000+ crowd-sourced tabs", color: "#8b7aff" },
    { icon: Headphones, label: "Mood Search",    desc: "'Sad acoustic songs in Am' — just type it",   color: "#f09a22" },
  ];

  const GENRES = [
    { name: "Rock",      emoji: "🎸", color: "#f87171" },
    { name: "Pop",       emoji: "✨", color: "#f09a22" },
    { name: "Bollywood", emoji: "🎬", color: "#8b7aff" },
    { name: "Classical", emoji: "🎻", color: "#34d399" },
    { name: "Jazz",      emoji: "🎷", color: "#60a5fa" },
    { name: "Blues",     emoji: "🎵", color: "#60a5fa" },
    { name: "Country",   emoji: "🤠", color: "#f09a22" },
    { name: "Metal",     emoji: "🤘", color: "#f87171" },
    { name: "Indie",     emoji: "🌿", color: "#34d399" },
    { name: "Hip-Hop",   emoji: "🎤", color: "#8b7aff" },
    { name: "Folk",      emoji: "🪕", color: "#f09a22" },
    { name: "EDM",       emoji: "⚡", color: "#8b7aff" },
  ];

  const TESTIMONIALS = [
    { name: "Rohan M.", role: "Acoustic Guitar", quote: "I learned Stairway to Heaven in 2 weeks using the AI Simplifier. Literally game-changing.", stars: 5 },
    { name: "Priya S.", role: "Ukulele Player",  quote: "The Play Along mode made my accuracy jump from 58% to 93% in 10 days. Nothing else comes close.", stars: 5 },
    { name: "Alex K.",  role: "Electric Guitar", quote: "Replaced Ultimate Guitar entirely. The autoscroll at BPM during live gigs is insane.", stars: 5 },
  ];

  return (
    <div style={{ background: "var(--obsidian)", minHeight: "100vh", paddingTop: 64 }}>

      {/* ══════════════ HERO ══════════════════════════════════ */}
      <section style={{
        position: "relative",
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}>
        {/* Hero background image */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1800&auto=format&q=80")`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          opacity: 0.12,
          filter: "blur(2px)",
        }} />

        {/* Overlay layers */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 90% 70% at 50% 50%, rgba(6,6,8,0.15) 0%, rgba(6,6,8,0.85) 65%, var(--obsidian) 100%)",
        }} />

        {/* Blobs */}
        <div style={{
          position: "absolute", top: "-10%", left: "-5%",
          width: "50vw", height: "50vw",
          borderRadius: "50%",
          background: "rgba(139,122,255,0.07)",
          filter: "blur(120px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "5%", right: "-3%",
          width: "40vw", height: "40vw",
          borderRadius: "50%",
          background: "rgba(240,154,34,0.06)",
          filter: "blur(120px)", pointerEvents: "none",
        }} />

        {/* Grid pattern */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 0%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 0%, transparent 80%)",
        }} />

        <div className="container" style={{ position: "relative", zIndex: 2, textAlign: "center", paddingTop: 48, paddingBottom: 48 }}>

          {/* Pill label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label" style={{ marginBottom: 32 }}>
              <Music2 size={11} /> 50,000+ Songs · Open Source · Free Forever
            </span>
          </motion.div>

          {/* Hero headline */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "var(--f-display)",
              fontWeight: 900,
              fontSize: "clamp(44px, 8.5vw, 88px)",
              lineHeight: 1.02,
              letterSpacing: "-0.045em",
              marginBottom: 22,
              maxWidth: 900,
              marginInline: "auto",
            }}
          >
            Every song you love.
            <br />
            <span className="text-gradient">Every chord you need.</span>
          </motion.h1>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: "clamp(15px, 2.2vw, 19px)",
              color: "var(--t2)",
              maxWidth: 520,
              margin: "0 auto 40px",
              lineHeight: 1.75,
            }}
          >
            50,000+ songs. Real-time chord detection. Built for every guitarist,
            from bedroom to stage.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 52 }}
          >
            <Link href="/explore" className="btn btn-primary btn-xl pulse-once" style={{ minWidth: 190 }}>
              <Search size={17} /> Find a Song
            </Link>
            <Link href="/play-along" className="btn btn-secondary btn-xl" style={{ minWidth: 190 }}>
              <Mic size={17} className="mic-throb" /> Try Play Along
            </Link>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, flexWrap: "wrap" }}
          >
            {[
              { icon: CheckCircle2, label: "50K+ Songs" },
              { icon: Users, label: "2M+ Musicians" },
              { icon: Star, label: "4.9★ Rated" },
            ].map((b, i) => (
              <>
                {i > 0 && <span key={`dot-${i}`} style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--t4)" }} />}
                <span
                  key={b.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--t3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  <b.icon size={13} style={{ color: "var(--amber)", opacity: 0.8 }} />
                  {b.label}
                </span>
              </>
            ))}
          </motion.div>
        </div>

        {/* Bottom marquee */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2 }}>
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }} />
          <Marquee />
        </div>
      </section>

      {/* ══════════════ SEARCH BAR ════════════════════════════ */}
      <section style={{
        background: "var(--surface)",
        padding: "48px 0",
        position: "relative",
        zIndex: 10,
        borderBottom: "1px solid var(--border)",
      }}>
        <div className="container">
          <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>

            {/* Label */}
            <p style={{
              textAlign: "center",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--t3)",
              marginBottom: 18,
            }}>
              Search 50,000+ songs instantly
            </p>

            {/* Search input */}
            <div style={{
              display: "flex",
              alignItems: "center",
              background: focused ? "rgba(255,255,255,0.048)" : "rgba(255,255,255,0.032)",
              backdropFilter: "blur(20px)",
              border: `1px solid ${focused ? "rgba(240,154,34,0.45)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 16,
              padding: "5px 18px 5px 22px",
              boxShadow: focused
                ? "0 0 0 3px rgba(240,154,34,0.1), 0 8px 40px rgba(0,0,0,0.3)"
                : "0 4px 24px rgba(0,0,0,0.25)",
              transition: "all 0.3s var(--spring)",
            }}>
              {loading
                ? <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid var(--amber)", borderTopColor: "transparent", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
                : <Search size={20} style={{ color: focused ? "var(--amber)" : "var(--t3)", flexShrink: 0, transition: "color 0.2s" }} />
              }

              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 200)}
                placeholder="Search any song, artist, or chord… (⌘K)"
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  padding: "15px 16px", fontSize: 16, color: "var(--t1)", fontFamily: "var(--f-body)",
                }}
              />

              {!query && (
                <kbd style={{
                  fontSize: 10, color: "var(--t3)", background: "rgba(255,255,255,0.05)",
                  padding: "4px 8px", borderRadius: 7, fontFamily: "var(--f-mono)", flexShrink: 0,
                  border: "1px solid var(--border)",
                }}>⌘K</kbd>
              )}
            </div>

            {/* Dropdown */}
            <AnimatePresence>
              {(focused || showSug) && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="glass"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    left: 0, right: 0,
                    zIndex: 60,
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid var(--border-amber)",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
                  }}
                >
                  {/* Suggestions */}
                  {query.length >= 2 && suggestions.length > 0 && (
                    <div style={{ padding: "10px 10px 4px", background: "rgba(240,154,34,0.03)", borderBottom: "1px solid var(--border)" }}>
                      <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", color: "var(--amber)", marginBottom: 4, paddingLeft: 12, letterSpacing: "0.1em" }}>
                        Suggestions
                      </p>
                      {suggestions.map((s, i) => (
                        <Link key={i} href={`/explore?q=${encodeURIComponent(s.title)}`}
                          style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "10px 12px", borderRadius: 10, textDecoration: "none",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <Zap size={13} style={{ color: "var(--amber)", flexShrink: 0 }} />
                          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--t1)" }}>{s.title}</span>
                          <span style={{ fontSize: 12, color: "var(--t3)", marginLeft: "auto" }}>{s.artist}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Trending */}
                  {!query && (
                    <div style={{ padding: "12px 10px" }}>
                      <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--t3)", marginBottom: 8, paddingLeft: 4 }}>
                        Trending now
                      </p>
                      {["Wonderwall", "Tum Hi Ho", "Hotel California", "Let Her Go"].map(term => (
                        <button key={term} onMouseDown={() => setQuery(term)}
                          style={{
                            width: "100%", textAlign: "left",
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "10px 10px", borderRadius: 10,
                            background: "transparent", color: "var(--t2)",
                            fontSize: 14, transition: "background 0.15s",
                            cursor: "pointer", border: "none",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <Flame size={13} style={{ color: "var(--amber)", flexShrink: 0 }} /> {term}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Results */}
                  {results.length > 0 && (
                    <div style={{ padding: "10px 10px" }}>
                      <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--t3)", marginBottom: 8, paddingLeft: 6 }}>
                        Top Matches
                      </p>
                      {results.map(song => (
                        <Link key={song.id} href={`/song/${song.id}`}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "10px 12px", borderRadius: 10, transition: "all 0.15s",
                            textDecoration: "none", border: "1px solid transparent",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.045)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
                        >
                          <span>
                            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--t1)" }}>{song.title}</span>
                            <span style={{ fontSize: 13, color: "var(--t3)", marginLeft: 10 }}>{song.artist}</span>
                          </span>
                          <span className="badge badge-amber">Sheet</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {query && results.length === 0 && !loading && (
                    <div style={{ padding: "36px 0", textAlign: "center", opacity: 0.6 }}>
                      <Search size={22} style={{ color: "var(--t3)", margin: "0 auto 10px" }} />
                      <p style={{ fontSize: 14, color: "var(--t3)" }}>No matches for "{query}"</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </section>

      {/* ══════════════ STATS ═════════════════════════════════ */}
      <section style={{ padding: "80px 0", background: "var(--obsidian)", position: "relative", overflow: "hidden" }}>
        {/* Subtle amber line */}
        <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(240,154,34,0.2), transparent)" }} />

        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 0,
            position: "relative",
          }}>
            {[
              { to: 50000,   suffix: "+", label: "Songs in Archive", icon: Music2 },
              { to: 2400000, suffix: "+", label: "Active Musicians",  icon: Users },
              { to: 4.9,     suffix: "★", label: "Average Rating",   icon: Star },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.55 }}
                style={{
                  textAlign: "center",
                  padding: "36px 32px",
                  borderRight: i < 2 ? "1px solid rgba(240,154,34,0.1)" : undefined,
                }}
              >
                <s.icon size={20} style={{ color: "var(--amber)", opacity: 0.7, margin: "0 auto 12px" }} />
                <p style={{
                  fontFamily: "var(--f-display)", fontWeight: 900,
                  fontSize: "clamp(40px, 6vw, 60px)",
                  color: "var(--t1)", letterSpacing: "-0.05em", lineHeight: 1,
                }}>
                  <Counter to={s.to} suffix={s.suffix} />
                </p>
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 10 }}>
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ TRENDING ══════════════════════════════ */}
      <section className="section" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
            <div>
              <span className="section-label"><Flame size={11} /> Trending Now</span>
              <motion.h2
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: "clamp(26px, 4vw, 42px)" }}
              >
                This week's top songs
              </motion.h2>
            </div>
            <Link href="/explore" className="btn btn-surface btn-md hide-mobile" style={{ gap: 7 }}>
              View all <ChevronRight size={15} />
            </Link>
          </div>

          <div className="scrollbar-hide" style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8, marginInline: -8, paddingInline: 8 }}>
            {TRENDING.map((s, i) => (
              <Link key={i} href={`/explore?q=${encodeURIComponent(s.title)}`} style={{ textDecoration: "none" }}>
                <SongCard title={s.title} artist={s.artist} delay={i * 0.06} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ PLAY ALONG PROMO ══════════════════════ */}
      <section className="section" style={{ background: "var(--obsidian)", position: "relative", overflow: "hidden" }}>
        {/* BG image */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=1400&auto=format&q=60")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.06,
          filter: "blur(4px)",
        }} />

        <div style={{ position: "absolute", bottom: "-20%", right: "5%", width: "38vw", height: "38vw", borderRadius: "50%", background: "rgba(240,154,34,0.06)", filter: "blur(100px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "-10%", left: "0%", width: "28vw", height: "28vw", borderRadius: "50%", background: "rgba(139,122,255,0.05)", filter: "blur(100px)", pointerEvents: "none" }} />

        <div className="container" style={{ display: "flex", gap: "clamp(40px, 7vw, 80px)", flexWrap: "wrap", alignItems: "center", position: "relative", zIndex: 1 }}>
          {/* Left */}
          <motion.div
            style={{ flex: "1 1 300px" }}
            initial={{ opacity: 0, x: -48 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="section-label"><Zap size={11} /> Real-time · AI-powered</span>
            <h2 style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: "clamp(30px, 5vw, 56px)", marginBottom: 22, lineHeight: 1.05 }}>
              Your guitar.<br />Our ears.<br />
              <span className="text-gradient">Instant feedback.</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--t2)", lineHeight: 1.75, maxWidth: 400, marginBottom: 36 }}>
              Enable your microphone and play chord by chord. We detect your notes in real-time,
              score your accuracy, and track your practice streak.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
              {[
                "Real-time chord detection via microphone",
                "Accuracy scoring with visual feedback",
                "BPM-synced autoscroll for live performance",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle2 size={15} style={{ color: "var(--green)", flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "var(--t2)" }}>{item}</span>
                </div>
              ))}
            </div>

            <Link href="/play-along" className="btn btn-primary btn-lg">
              <Play size={16} fill="currentColor" /> Launch Stage Mode
            </Link>
          </motion.div>

          {/* Right — glass mockup */}
          <motion.div
            style={{ flex: "1 1 320px", maxWidth: 500 }}
            initial={{ opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="glass-elevated" style={{
              padding: 30,
              border: "1px solid rgba(240,154,34,0.15)",
              background: "rgba(6,6,8,0.9)",
              boxShadow: "0 48px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(240,154,34,0.08)",
            }}>
              {/* Song info row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  <p style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 17, color: "var(--t1)", letterSpacing: "-0.02em" }}>
                    Hotel California
                  </p>
                  <p style={{ fontSize: 12, color: "var(--t3)", marginTop: 3 }}>Eagles · BPM 147 · 4/4</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ padding: "3px 10px", borderRadius: "999px", background: "var(--green-dim)", color: "var(--green)", fontSize: 11, fontWeight: 800 }}>🔥 12 Streak</span>
                  <span style={{ fontFamily: "var(--f-mono)", color: "var(--amber)", fontSize: 20, fontWeight: 700 }}>84K</span>
                </div>
              </div>

              {/* Chord highway */}
              <div style={{
                height: 100,
                background: "rgba(0,0,0,0.5)",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                gap: 24,
                overflow: "hidden",
                marginBottom: 22,
                padding: "0 24px",
                border: "1px solid rgba(255,255,255,0.04)",
              }}>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 22, fontWeight: 700, color: "var(--green)", opacity: 0.5 }}>Bm</span>
                <motion.div
                  style={{ border: "2px solid rgba(240,154,34,0.65)", borderRadius: 12, padding: "10px 20px", background: "rgba(240,154,34,0.07)" }}
                  animate={{ boxShadow: ["0 0 0 0 rgba(240,154,34,0.4)", "0 0 28px 8px rgba(240,154,34,0.12)", "0 0 0 0 rgba(240,154,34,0.4)"] }}
                  transition={{ duration: 0.55, repeat: Infinity }}
                >
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: 34, fontWeight: 700, color: "var(--amber)" }}>F#m</span>
                </motion.div>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 22, fontWeight: 700, color: "var(--t1)", opacity: 0.2 }}>A</span>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 22, fontWeight: 700, color: "var(--t1)", opacity: 0.1 }}>E</span>
              </div>

              {/* Mic bars */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <GuitarWaveform />
                <div style={{ marginLeft: 6 }}>
                  <p style={{ fontSize: 11, color: "var(--t3)" }}>Detecting</p>
                  <p style={{ fontFamily: "var(--f-mono)", fontSize: 20, fontWeight: 700, color: "var(--t1)" }}>F#m</p>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <p style={{ fontSize: 11, color: "var(--t3)" }}>Accuracy</p>
                  <p style={{ fontFamily: "var(--f-mono)", fontSize: 20, fontWeight: 700, color: "var(--green)" }}>94%</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════════════════════ */}
      <section className="section" style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1400&auto=format&q=50")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.03,
          filter: "blur(8px)",
        }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="section-label"><Sparkles size={11} /> Features</span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: "clamp(26px, 4vw, 46px)", marginBottom: 14 }}
            >
              Everything a guitarist needs
            </motion.h2>
            <p style={{ fontSize: 16, color: "var(--t2)", maxWidth: 460, margin: "0 auto", lineHeight: 1.7 }}>
              One platform. Every tool. Built for the way you actually practice and perform.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
            {FEATURES.map((f, i) => <FeatureCard key={f.label} {...f} delay={i * 0.05} />)}
          </div>
        </div>
      </section>

      {/* ══════════════ GENRES ════════════════════════════════ */}
      <section className="section" style={{ background: "var(--obsidian)", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
            <div>
              <span className="section-label"><AudioLines size={11} /> Genres</span>
              <motion.h2
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: "clamp(24px, 3.5vw, 40px)" }}
              >
                Browse by genre
              </motion.h2>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 10 }}>
            {GENRES.map((g, i) => (
              <motion.div
                key={g.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <Link
                  href={`/explore?genre=${g.name}`}
                  className="genre-card"
                  style={{ textDecoration: "none" }}
                >
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: g.color,
                    borderRadius: "inherit",
                    opacity: 0.07,
                    transition: "opacity 0.25s",
                  }} className="genre-bg" />
                  <span style={{ fontSize: 24, lineHeight: 1 }}>{g.emoji}</span>
                  <span style={{
                    fontFamily: "var(--f-display)",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "var(--t1)",
                    position: "relative",
                    zIndex: 1,
                    letterSpacing: "-0.01em",
                  }}>{g.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ TESTIMONIALS ══════════════════════════ */}
      <section className="section" style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span className="section-label"><Star size={11} /> Reviews</span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: "clamp(24px, 4vw, 42px)", marginBottom: 10 }}
            >
              Guitarists love Geethub
            </motion.h2>
            <p style={{ fontSize: 15, color: "var(--t2)" }}>Real words from real musicians.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                className="glass"
                style={{ padding: 30 }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} size={14} style={{ color: "var(--amber)" }} fill="var(--amber)" />
                  ))}
                </div>
                <p style={{ fontSize: 15, color: "var(--t1)", lineHeight: 1.75, marginBottom: 22, fontStyle: "italic" }}>
                  "{t.quote}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--amber), #e08010)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 15,
                    color: "#060608",
                    flexShrink: 0,
                    fontFamily: "var(--f-display)",
                  }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: "var(--t3)" }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FINAL CTA ═════════════════════════════ */}
      <section style={{
        padding: "100px 0",
        background: "var(--obsidian)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Radial glow */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60vw", height: "60vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(240,154,34,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="section-label"><Zap size={11} /> Get Started</span>
            <h2 style={{
              fontFamily: "var(--f-display)", fontWeight: 900,
              fontSize: "clamp(30px, 6vw, 60px)", marginBottom: 20, letterSpacing: "-0.04em",
            }}>
              Ready to play?
            </h2>
            <p style={{ fontSize: 17, color: "var(--t2)", maxWidth: 420, margin: "0 auto 44px", lineHeight: 1.7 }}>
              Join 2 million guitarists who use Geethub every day. It's free, forever.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link href="/explore" className="btn btn-primary btn-xl">
                <Search size={17} /> Browse Songs
              </Link>
              <Link href="/commit" className="btn btn-secondary btn-xl">
                <Zap size={17} /> Contribute Chords
              </Link>
            </div>

            <p style={{ fontSize: 12, color: "var(--t3)", marginTop: 28 }}>
              No account needed · Open source · Community-driven
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
