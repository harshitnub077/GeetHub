"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChordRenderer } from "@/components/ChordRenderer";
import { Send, CheckCircle, FileCode2, Mic2, Zap, Info } from "lucide-react";
import Link from "next/link";

const EXAMPLE = `[Verse 1]
[Am]Today is gonna be the day
That they're gonna [G]throw it back to [D]you
[Am]By now you should've somehow
Realized [G]what you gotta [D]do
I don't believe that [Am]anybody
Feels the way I [G]do about you [D]now

[Chorus]
[F]Because maybe
[G]You're gonna be the one that [Am]saves me
[F]And after [C]all
[G]You're my [Am]wonderwall`;

const GENRES = ["Rock", "Pop", "Bollywood", "Classical", "Jazz", "Blues", "Country", "Metal", "Indie", "Hip-Hop", "Folk", "EDM", "Other"];

export default function CommitPage() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("Pop");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, artist, genre, chord_data: content }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const d = await res.json();
        setError(d.error || "Submission failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setTitle("Wonderwall"); setArtist("Oasis"); setGenre("Rock"); setContent(EXAMPLE);
  };

  if (submitted) return (
    <div style={{ minHeight: "100vh", paddingTop: 60, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--obsidian)", textAlign: "center" }}>
      <motion.div className="container" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(45,212,160,0.12)", border: "2px solid rgba(45,212,160,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <CheckCircle size={36} style={{ color: "var(--green)" }} />
        </div>
        <h1 style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: "clamp(32px,5vw,52px)", marginBottom: 16 }}>Chords Submitted! 🎉</h1>
        <p style={{ fontSize: 16, color: "var(--t2)", maxWidth: 420, margin: "0 auto 32px", lineHeight: 1.7 }}>
          Thanks for contributing! <strong style={{ color: "var(--t1)" }}>"{title}"</strong> by <strong style={{ color: "var(--t1)" }}>{artist}</strong> has been submitted for review.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => { setSubmitted(false); setTitle(""); setArtist(""); setContent(""); }} className="btn btn-surface btn-lg">
            Submit Another
          </button>
          <Link href="/explore" className="btn btn-primary btn-lg">Browse Songs</Link>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", paddingTop: 60, background: "var(--obsidian)" }}>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <span className="section-label"><FileCode2 size={11} /> Open Source · Community</span>
          <h1 style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: "clamp(30px,5vw,52px)", marginBottom: 12 }}>
            Contribute Chords
          </h1>
          <p style={{ fontSize: 16, color: "var(--t2)", maxWidth: 560, lineHeight: 1.7 }}>
            Add songs to the open-source library. Use <code style={{ fontFamily: "var(--f-mono)", background: "rgba(255,255,255,0.07)", padding: "2px 6px", borderRadius: 4, fontSize: 13, color: "var(--amber)" }}>[Chord]</code> before the syllable it lands on.
          </p>
        </div>

        {/* Syntax guide */}
        <div className="glass" style={{ padding: "16px 20px", marginBottom: 36, borderLeft: "3px solid var(--amber)", borderRadius: "0 12px 12px 0", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <Info size={16} style={{ color: "var(--amber)", flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)", marginBottom: 4 }}>ChordPro Syntax</p>
            <p style={{ fontSize: 13, color: "var(--t2)" }}>
              Write chords in square brackets before the lyric syllable: <span style={{ color: "var(--amber)", fontFamily: "var(--f-mono)" }}>[Am]Yesterday [G]all my troubles...</span><br />
              Use <span style={{ color: "var(--amber)", fontFamily: "var(--f-mono)" }}>[Verse 1]</span>, <span style={{ color: "var(--amber)", fontFamily: "var(--f-mono)" }}>[Chorus]</span>, <span style={{ color: "var(--amber)", fontFamily: "var(--f-mono)" }}>[Bridge]</span> as section headers.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }} className="commit-grid">
          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="glass" style={{ padding: 28 }}>
              <h2 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 18, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>Song Details</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Song Title *</label>
                  <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Wonderwall" className="input-field" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Artist *</label>
                  <input required value={artist} onChange={e => setArtist(e.target.value)} placeholder="e.g. Oasis" className="input-field" />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Genre</label>
                <select value={genre} onChange={e => setGenre(e.target.value)}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 16px", color: "var(--t1)", fontFamily: "var(--f-body)", fontSize: 15, outline: "none", cursor: "pointer" }}
                >
                  {GENRES.map(g => <option key={g} value={g} style={{ background: "#1a1a24" }}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="glass" style={{ padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 18 }}>Chord Data *</h2>
                <button type="button" onClick={loadExample} className="btn btn-surface btn-sm" style={{ gap: 6 }}>
                  <Zap size={13} /> Load Example
                </button>
              </div>
              <textarea
                required value={content} onChange={e => setContent(e.target.value)}
                placeholder={`[Verse 1]\n[G]Today is gonna be the day...\n\n[Chorus]\n[F]Because [G]maybe...`}
                className="textarea-field"
              />
              <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 8 }}>
                {content.split("\n").length} lines · {(content.match(/\[[A-G][^\]]*\]/g) || []).length} chord markers detected
              </p>
            </div>

            {error && (
              <div style={{ padding: "12px 16px", borderRadius: 8, background: "rgba(255,92,92,0.1)", border: "1px solid rgba(255,92,92,0.25)", color: "var(--red)", fontSize: 14 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-full" style={{ opacity: loading ? .7 : 1 }}>
              {loading ? "Submitting…" : <><Send size={16} /> Submit Chords</>}
            </button>
          </form>

          {/* Live preview */}
          <div className="glass" style={{ padding: 28, position: "sticky", top: 80 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 18 }}>
                Live Preview
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", animation: "pulse-ring 2s ease-out infinite" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--green)" }}>Live</span>
              </div>
            </div>

            {content.trim() || title ? (
              <div style={{ minHeight: 300, maxHeight: 600, overflowY: "auto" }} className="scrollbar-hide">
                {title && (
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontFamily: "var(--f-display)", fontWeight: 800, fontSize: 22, color: "var(--t1)", marginBottom: 4 }}>{title || "Untitled"}</h3>
                    <p style={{ color: "var(--t2)", display: "flex", alignItems: "center", gap: 6 }}>
                      <Mic2 size={13} /> {artist || "Unknown Artist"} · {genre}
                    </p>
                  </div>
                )}
                <ChordRenderer content={content} transposeBy={0} simplify={false} fontSize={15} />
              </div>
            ) : (
              <div style={{ minHeight: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--t3)" }}>
                <FileCode2 size={40} style={{ opacity: .25, marginBottom: 12 }} />
                <p style={{ fontSize: 14, textAlign: "center" }}>Start typing to see the live chord rendering</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:767px){ .commit-grid{ grid-template-columns:1fr !important; } }
      `}</style>
    </div>
  );
}
