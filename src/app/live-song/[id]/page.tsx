"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, ArrowLeft, Globe, GitFork, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ChordRenderer } from "@/components/ChordRenderer";
import { generateChordData } from "@/lib/chordEngine";

interface LiveTrack {
  id: number; trackName: string; artistName: string;
  albumName: string; plainLyrics: string; instrumental: boolean;
}

export default function LiveSongPage({ params }: { params: Promise<{ id: string }> }) {
  const [song,      setSong]       = useState<LiveTrack|null>(null);
  const [chordData, setChordData]  = useState("");
  const [loading,   setLoading]    = useState(true);
  const [error,     setError]      = useState("");
  const [transpose, setTranspose]  = useState(0);
  const [simplify,  setSimplify]   = useState(false);
  const [fontSize,  setFontSize]   = useState(16);

  const fetchSong = useCallback(async () => {
    setLoading(true);
    try {
      const { id } = await params;
      const res = await fetch(`/api/songs/${id}`);
      if (!res.ok) throw new Error("Song not found");
      const data: LiveTrack = await res.json();
      setSong(data);
      setChordData(generateChordData(data.plainLyrics, data.trackName));
    } catch {
      setError("Could not load this track. It may have been removed.");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { fetchSong(); }, [fetchSong]);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--obsidian)", flexDirection:"column", gap:16, color:"var(--t3)" }}>
      <Loader2 size={36} style={{ color:"var(--amber)", animation:"spin 0.8s linear infinite" }}/>
      <p style={{ fontSize:14 }}>Fetching from global library…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error || !song) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--obsidian)", textAlign:"center" }}>
      <div>
        <AlertCircle size={48} style={{ color:"var(--red)", margin:"0 auto 16px" }}/>
        <h1 style={{ fontFamily:"var(--f-display)", fontWeight:800, fontSize:28, marginBottom:12 }}>Track Not Found</h1>
        <p style={{ color:"var(--t2)", fontSize:15, marginBottom:28 }}>{error}</p>
        <Link href="/explore" className="btn btn-primary btn-lg">Back to Explore</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--obsidian)", paddingTop:60 }}>
      <div className="container" style={{ paddingTop:28, paddingBottom:80 }}>
        <Link href="/explore" style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:13, color:"var(--t3)", fontWeight:600, marginBottom:24, transition:"color 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.color="var(--amber)"}
          onMouseLeave={e=>e.currentTarget.style.color="var(--t3)"}
        >
          <ArrowLeft size={14}/> Back to Explore
        </Link>

        {/* Header */}
        <div style={{ marginBottom:28, paddingBottom:24, borderBottom:"1px solid var(--border)" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <div>
              <h1 style={{ fontFamily:"var(--f-display)", fontWeight:900, fontSize:"clamp(28px,5vw,48px)", marginBottom:8, lineHeight:1.06 }}>{song.trackName}</h1>
              <p style={{ fontSize:17, color:"var(--t2)" }}>{song.artistName}</p>
              {song.albumName && <p style={{ fontSize:13, color:"var(--t3)", marginTop:4 }}>{song.albumName}</p>}
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"flex-start", flexWrap:"wrap" }}>
              <span className="badge" style={{ background:"rgba(255,255,255,0.05)", color:"var(--t2)", border:"1px solid var(--border)" }}>
                <Globe size={10}/> Global Library
              </span>
              <Link href="/commit" className="btn btn-primary btn-sm" style={{ gap:6 }}>
                <GitFork size={12}/> Improve Chords
              </Link>
            </div>
          </div>
        </div>

        {/* Alert */}
        <div style={{ padding:"12px 16px", borderRadius:10, background:"rgba(245,166,35,0.07)", border:"1px solid rgba(245,166,35,0.2)", display:"flex", alignItems:"flex-start", gap:10, marginBottom:28 }}>
          <AlertCircle size={15} style={{ color:"var(--amber)", flexShrink:0, marginTop:1 }}/>
          <p style={{ fontSize:13, color:"var(--t2)", lineHeight:1.6 }}>
            These chords are <strong style={{ color:"var(--amber)" }}>algorithmically generated</strong> as a starting point. Know the correct chords?{" "}
            <Link href="/commit" style={{ color:"var(--amber)", fontWeight:700 }}>Contribute them!</Link>
          </p>
        </div>

        {/* Sticky toolbar */}
        <div style={{ position:"sticky", top:60, zIndex:30, display:"flex", alignItems:"center", flexWrap:"wrap", gap:8, padding:"10px 16px", background:"rgba(9,9,14,0.96)", backdropFilter:"blur(20px)", border:"1px solid var(--border)", borderTop:"2px solid var(--amber)", borderRadius:12, marginBottom:24 }}>
          {/* Transpose */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:11, color:"var(--t3)", fontWeight:700, textTransform:"uppercase" }}>Key</span>
            <button onClick={()=>setTranspose(t=>t-1)} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid var(--border)", borderRadius:6, color:"var(--t2)", width:26, height:26, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
            <span style={{ fontFamily:"var(--f-mono)", minWidth:24, textAlign:"center", fontWeight:700, fontSize:14, color:"var(--t1)" }}>{transpose>0?`+${transpose}`:transpose}</span>
            <button onClick={()=>setTranspose(t=>t+1)} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid var(--border)", borderRadius:6, color:"var(--t2)", width:26, height:26, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
          </div>
          {/* Simplify */}
          <button onClick={()=>setSimplify(s=>!s)}
            style={{ padding:"6px 12px", borderRadius:7, border:`1px solid ${simplify?"rgba(45,212,160,0.35)":"var(--border)"}`, background:simplify?"rgba(45,212,160,0.1)":"rgba(255,255,255,0.04)", color:simplify?"var(--green)":"var(--t2)", fontSize:12, fontWeight:700, cursor:"pointer", transition:"all 0.2s" }}
          >
            Simplify Chords
          </button>
          {/* Font */}
          <div style={{ marginLeft:"auto", display:"flex", gap:4 }}>
            <button onClick={()=>setFontSize(s=>Math.max(12,s-1))} style={{ padding:"5px 10px", borderRadius:7, border:"1px solid var(--border)", background:"rgba(255,255,255,0.04)", color:"var(--t2)", cursor:"pointer", fontSize:12, fontWeight:700 }}>A−</button>
            <button onClick={()=>setFontSize(s=>Math.min(26,s+1))} style={{ padding:"5px 10px", borderRadius:7, border:"1px solid var(--border)", background:"rgba(255,255,255,0.04)", color:"var(--t2)", cursor:"pointer", fontSize:14, fontWeight:700 }}>A+</button>
          </div>
        </div>

        {/* Chord sheet */}
        <div className="glass" style={{ padding:"28px", borderRadius:16 }}>
          {song.instrumental ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:"var(--t3)" }}>
              <p style={{ fontSize:16, fontWeight:600 }}>🎸 Instrumental track — no lyrics/chords available</p>
            </div>
          ) : (
            <ChordRenderer content={chordData} transposeBy={transpose} simplify={simplify} fontSize={fontSize}/>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
