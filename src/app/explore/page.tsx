"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Loader2, Music, ChevronRight, X, Guitar,
  Headphones, Mic2, Music2, Zap, Flame,
} from "lucide-react";

/* ── Genre images ── */
const GENRE_IMAGES: Record<string, string> = {
  Rock:      "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=1200&auto=format&q=85",
  Pop:       "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&q=85",
  Bollywood: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=1200&auto=format&q=85",
  Classical: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200&auto=format&q=85",
  Jazz:      "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=1200&auto=format&q=85",
  Blues:     "https://images.unsplash.com/photo-1504704911898-68304a7d2807?w=1200&auto=format&q=85",
  Country:   "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&auto=format&q=85",
  Metal:     "https://images.unsplash.com/photo-1573215177236-4e5942e23f25?w=1200&auto=format&q=85",
  Indie:     "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&auto=format&q=85",
  "Hip-Hop": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&auto=format&q=85",
  Folk:      "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=1200&auto=format&q=85",
  EDM:       "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&q=85",
};

const GENRE_COLORS: Record<string, string> = {
  Rock: "#f87171", Pop: "#f5a623", Bollywood: "#a78bfa", Classical: "#34d399",
  Jazz: "#60a5fa", Blues: "#60a5fa", Country: "#f5a623", Metal: "#f87171",
  Indie: "#34d399", "Hip-Hop": "#a78bfa", Folk: "#f5a623", EDM: "#00d4b4",
};

/* ── Filter tabs ── */
const GENRES = ["Rock", "Pop", "Bollywood", "Classical", "Jazz", "Blues", "Country", "Metal", "Indie", "Hip-Hop", "Folk", "EDM"];
const LEVELS = ["Beginner", "Intermediate", "Expert"];

function SkeletonRow() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "14px 18px", borderRadius: 12,
      border: "1px solid var(--border)", marginBottom: 6,
      background: "rgba(255,255,255,0.015)",
    }}>
      <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
        <div className="skeleton" style={{ height: 13, width: "38%", borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 11, width: "22%", borderRadius: 5 }} />
      </div>
      <div className="skeleton" style={{ height: 24, width: 70, borderRadius: 8 }} />
    </div>
  );
}

/* ── Song Row ── */
const DIFF_COLOR: Record<string, { bg: string; color: string }> = {
  "Beginner":     { bg: "rgba(52,211,153,0.1)",  color: "var(--green)" },
  "Intermediate": { bg: "rgba(245,166,35,0.1)",  color: "var(--amber)" },
  "Expert":       { bg: "rgba(248,113,113,0.12)", color: "var(--rose)" },
};

function SongRow({ song, i }: { song: any; i: number }) {
  const diff = song.difficulty || "Beginner";
  const dc = DIFF_COLOR[diff] || DIFF_COLOR["Beginner"];

  // Generate a unique index-based color dot
  const hue = (i * 47 + 30) % 360;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(i * 0.018, 0.38), ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/song/${song.id}`}
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "13px 16px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.055)",
          background: "rgba(255,255,255,0.016)",
          marginBottom: 6,
          transition: "all 0.2s var(--spring)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.036)";
          e.currentTarget.style.borderColor = "rgba(245,166,35,0.2)";
          e.currentTarget.style.transform = "translateX(2px)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.016)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.055)";
          e.currentTarget.style.transform = "translateX(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Avatar — colored square with initials */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 9,
            background: `hsl(${hue}, 55%, 12%)`,
            border: `1px solid hsl(${hue}, 55%, 22%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 13,
            fontWeight: 700,
            color: `hsl(${hue}, 75%, 65%)`,
            fontFamily: "var(--f-display)",
          }}
        >
          {(song.title?.[0] || "?").toUpperCase()}
        </div>

        {/* Title + artist */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: 14.5, color: "var(--t1)", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
            {song.title}
          </p>
          <p style={{ fontSize: 12.5, color: "var(--t3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {song.artist}
            {song.genre && <span style={{ marginLeft: 8, opacity: 0.65 }}>· {song.genre}</span>}
          </p>
        </div>

        {/* Difficulty badge */}
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 7,
            fontSize: 11,
            fontWeight: 700,
            background: dc.bg,
            color: dc.color,
            flexShrink: 0,
            letterSpacing: "0.02em",
          }}
        >
          {diff}
        </span>

        <ChevronRight size={14} style={{ color: "var(--t4)", flexShrink: 0 }} />
      </Link>
    </motion.div>
  );
}

/* ── Genre Chip ── */
function GenreChip({ name, active, onClick }: { name: string; active: boolean; onClick: () => void }) {
  const img = GENRE_IMAGES[name];
  const col = GENRE_COLORS[name] || "var(--amber)";
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        height: 80,
        minWidth: 110,
        borderRadius: 12,
        border: `2px solid ${active ? col : "rgba(255,255,255,0.07)"}`,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.22s var(--spring)",
        flexShrink: 0,
        background: "transparent",
        padding: 0,
        boxShadow: active ? `0 4px 20px ${col}35` : "none",
        transform: active ? "scale(1.03)" : "scale(1)",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = `${col}60`;
          e.currentTarget.style.transform = "scale(1.02)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
          e.currentTarget.style.transform = "scale(1)";
        }
      }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url("${img}")`, backgroundSize: "cover", backgroundPosition: "center", opacity: active ? 0.45 : 0.22, transition: "opacity 0.22s" }} />
      <div style={{ position: "absolute", inset: 0, background: active ? `linear-gradient(180deg, transparent 0%, rgba(5,5,7,0.7) 100%)` : "rgba(5,5,7,0.55)" }} />
      <span style={{ position: "relative", fontSize: 12, fontWeight: 700, color: active ? "#fff" : "var(--t2)", letterSpacing: "-0.01em", fontFamily: "var(--f-display)", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        {name}
      </span>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════ */
function ExploreContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [query,  setQuery]  = useState(searchParams.get("q") || "");
  const [genre,  setGenre]  = useState(searchParams.get("genre") || "");
  const [level,  setLevel]  = useState("");
  const [songs,  setSongs]  = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<any>(null);
  const [page,   setPage]   = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [focused, setFocused] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const doSearch = async (q: string, g: string, p: number, append = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (g) params.set("artist", g);
      params.set("page", String(p));
      params.set("limit", "25");
      const r = await fetch(`/api/songs/search?${params}`);
      const d = await r.json();
      if (append) setSongs((prev) => [...prev, ...(d.songs || [])]);
      else setSongs(d.songs || []);
      setPagination(d.pagination);
    } catch { if (!append) setSongs([]); }
    finally { setLoading(false); setLoadingMore(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      doSearch(query, genre, 1);
      const p = new URLSearchParams();
      if (query) p.set("q", query);
      if (genre) p.set("genre", genre);
      router.replace(`/explore${p.toString() ? "?" + p : ""}`);
    }, 280);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, genre, level]);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setGenre(searchParams.get("genre") || "");
  }, [searchParams]);

  const loadMore = useCallback(() => {
    if (loadingMore || !pagination || page >= pagination.pages) return;
    const next = page + 1;
    setPage(next);
    doSearch(query, genre, next, true);
  }, [page, pagination, loadingMore, query, genre]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) loadMore(); }, { threshold: 0.1 });
    obs.observe(target);
    return () => obs.unobserve(target);
  }, [loadMore]);

  const activeGenreImg = genre ? GENRE_IMAGES[genre] : null;
  const hasFilters = !!query || !!genre || !!level;

  return (
    <div style={{ background: "var(--obsidian)", minHeight: "100vh", paddingTop: 60 }}>

      {/* ── Page Header ── */}
      <div
        style={{
          position: "relative",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {/* HD background if genre selected */}
        <AnimatePresence>
          {activeGenreImg && (
            <motion.div
              key={genre}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute", inset: 0,
                backgroundImage: `url("${activeGenreImg}")`,
                backgroundSize: "cover", backgroundPosition: "center 35%",
                opacity: 0.1, filter: "blur(1px)",
              }}
            />
          )}
        </AnimatePresence>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,5,7,0) 0%, rgba(5,5,7,0.95) 100%)" }} />

        <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: 40, paddingBottom: 0 }}>
          {/* Title */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: "clamp(26px, 4.5vw, 48px)", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              {genre
                ? <><span className="text-gradient">{genre}</span> songs</>
                : query
                ? <>Results for <span className="text-gradient">"{query}"</span></>
                : <>Explore <span className="text-gradient">all songs</span></>
              }
            </h1>
            {pagination?.total && (
              <p style={{ fontSize: 13, color: "var(--t3)", marginTop: 5 }}>
                {pagination.total.toLocaleString()} songs found
              </p>
            )}
          </div>

          {/* Search bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: focused ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${focused ? "rgba(245,166,35,0.45)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 13,
              padding: "4px 16px 4px 18px",
              boxShadow: focused ? "0 0 0 3px rgba(245,166,35,0.09), 0 6px 28px rgba(0,0,0,0.3)" : "0 2px 16px rgba(0,0,0,0.2)",
              transition: "all 0.25s var(--spring)",
              marginBottom: 22,
            }}
          >
            <Search size={17} style={{ color: focused ? "var(--amber)" : "var(--t3)", flexShrink: 0, transition: "color 0.2s" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search any song, artist, or chord…"
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                padding: "13px 14px", fontSize: 15, color: "var(--t1)",
                fontFamily: "var(--f-body)", fontWeight: 400,
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", padding: 4, display: "flex" }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Genre chips — horizontal scroll */}
          <div className="scrollbar-hide" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 20, marginInline: -2, paddingInline: 2 }}>
            {/* All button */}
            <button
              onClick={() => setGenre("")}
              style={{
                height: 80, minWidth: 80, borderRadius: 12, flexShrink: 0,
                border: `2px solid ${!genre ? "var(--amber)" : "rgba(255,255,255,0.07)"}`,
                background: !genre ? "rgba(245,166,35,0.08)" : "rgba(255,255,255,0.025)",
                color: !genre ? "var(--amber)" : "var(--t3)",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
                fontFamily: "var(--f-display)",
                transition: "all 0.22s var(--spring)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              <Music2 size={16} />
              All
            </button>

            {GENRES.map((g) => (
              <GenreChip
                key={g}
                name={g}
                active={genre === g}
                onClick={() => setGenre(genre === g ? "" : g)}
              />
            ))}
          </div>

          {/* Level filter row */}
          <div style={{ display: "flex", gap: 8, paddingBottom: 20, flexWrap: "wrap" }}>
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(level === l ? "" : l)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: `1px solid ${level === l ? "rgba(245,166,35,0.4)" : "rgba(255,255,255,0.08)"}`,
                  background: level === l ? "rgba(245,166,35,0.08)" : "transparent",
                  color: level === l ? "var(--amber)" : "var(--t3)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  fontFamily: "var(--f-body)",
                }}
              >
                {l}
              </button>
            ))}

            {/* Clear all */}
            {hasFilters && (
              <button
                onClick={() => { setQuery(""); setGenre(""); setLevel(""); }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: "1px solid rgba(248,113,113,0.3)",
                  background: "rgba(248,113,113,0.06)",
                  color: "var(--rose)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                  fontFamily: "var(--f-body)",
                  transition: "all 0.15s",
                  marginLeft: "auto",
                }}
              >
                <X size={11} /> Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="container" style={{ paddingTop: 28, paddingBottom: 80 }}>
        {loading ? (
          <div>{[...Array(10)].map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : songs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Music size={48} style={{ color: "var(--t3)", margin: "0 auto 18px", opacity: 0.22 }} />
            <p style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--f-display)", letterSpacing: "-0.02em", marginBottom: 6 }}>
              No songs found
            </p>
            <p style={{ fontSize: 13.5, color: "var(--t3)", marginBottom: 22 }}>
              Try a different search or genre.
            </p>
            <button
              onClick={() => { setQuery(""); setGenre(""); setLevel(""); }}
              className="btn btn-surface btn-md"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <div key={`${query}-${genre}-${level}`}>
                {songs.map((s, i) => <SongRow key={s.id} song={s} i={i} />)}
              </div>
            </AnimatePresence>

            {/* Infinite scroll sentinel */}
            {pagination && page < pagination.pages && (
              <div ref={observerTarget} style={{ textAlign: "center", paddingBlock: 32 }}>
                {loadingMore && <Loader2 size={22} style={{ color: "var(--amber)", animation: "spin 0.7s linear infinite", margin: "0 auto" }} />}
              </div>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={28} style={{ color: "var(--amber)", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
