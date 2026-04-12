"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart, Share2, Download, Play, Pause, ChevronUp,
  ChevronDown, Minus, Plus, Star, AudioLines, PlayCircle,
  Zap, ArrowLeft, Users, Music
} from "lucide-react";
import { ChordRenderer, ChordDiagram } from "./ChordRenderer";
import { AnimatePresence } from "framer-motion";

interface Song { id:string; title:string; artist:string; genre:string; contributor_username:string; chord_data:string; bpm:number; music_key:string; capo:number; }

export function SongViewer({ song }:{ song:Song }) {
  const [transpose, setTranspose] = useState(0);
  const [simplify,  setSimplify]  = useState(false);
  const [fontSize,  setFontSize]  = useState(18);
  const [bpm,       setBpm]       = useState(song.bpm || 90);
  const [scrolling, setScrolling] = useState(false);
  const [liked,     setLiked]     = useState(false);
  const [starHover, setStarHover] = useState(0);
  const [rating,    setRating]    = useState(0);
  const [popover,   setPopover]   = useState<{chord:string;x:number;y:number}|null>(null);
  const [stageMode, setStageMode] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const summaryRef  = useRef<HTMLDivElement>(null);

  /* Auto-scroll */
  const startScroll = useCallback(()=>{
    intervalRef.current = setInterval(()=>{ window.scrollBy({ top:bpm/60*0.9 }); }, 80);
  }, [bpm]);
  const stopScroll = useCallback(()=>{ if(intervalRef.current) clearInterval(intervalRef.current); }, []);

  useEffect(()=>{
    if (song.bpm) setBpm(song.bpm);
  }, [song.bpm]);

  useEffect(()=>{ if(scrolling) startScroll(); else stopScroll(); return stopScroll; }, [scrolling, startScroll, stopScroll]);

  /* Unique chords */
  const chords = Array.from(new Set(
    (song.chord_data.match(/\[([A-G][^\]]*)\]/g)||[]).map(m=>m.slice(1,-1))
  )).slice(0,14);

  return (
    <div style={{ minHeight:"100vh", background:stageMode?"#050508":"var(--obsidian)", color:"var(--t1)", paddingTop:stageMode?20:60, transition:"all 0.4s ease" }}>
      {/* Purple ambient */}
      {!stageMode && <div style={{ position:"fixed", top:0, left:0, right:0, height:"50vh", background:"radial-gradient(ellipse 70% 50% at 30% 0%, rgba(123,97,255,0.055), transparent)", pointerEvents:"none", zIndex:0 }}/>}

      <div className="container" style={{ position:"relative", zIndex:1, paddingTop:24, paddingBottom:80, maxWidth: stageMode ? 900 : undefined }}>
        {/* Breadcrumb */}
        {!stageMode && (
          <Link href="/explore" style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:13, color:"var(--t3)", fontWeight:600, marginBottom:24, transition:"color 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.color="var(--amber)"}
            onMouseLeave={e=>e.currentTarget.style.color="var(--t3)"}
          >
            <ArrowLeft size={14}/> Back to Explore
          </Link>
        )}

        {/* Two-column */}
        <div style={{ display:"flex", gap:"clamp(20px,4vw,48px)", alignItems:"flex-start", flexDirection: stageMode ? "column" : "row" }}>

          {/* ─── LEFT COLUMN ─── */}
          <div style={{ flex:"1 1 0", minWidth:0, width:"100%" }}>
            {/* Header */}
            {!stageMode && (
              <div style={{ marginBottom:16, paddingBottom:16, borderBottom:"1px solid var(--border)" }}>
                <h1 style={{ fontFamily:"var(--f-display)", fontWeight:900, fontSize:"clamp(28px,5vw,48px)", letterSpacing:"-0.03em", lineHeight:1.06, marginBottom:8 }}>
                  {song.title}
                </h1>
                <Link href="#" style={{ fontSize:18, color:"var(--t2)", fontWeight:500, display:"inline-block", marginBottom:16, transition:"color 0.2s" }}
                  onMouseEnter={e=>e.currentTarget.style.color="var(--amber)"}
                  onMouseLeave={e=>e.currentTarget.style.color="var(--t2)"}
                >
                  {song.artist}
                </Link>

                {/* Badges */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:18 }}>
                  <span className="badge badge-intermediate">Guitar</span>
                  <span className="badge badge-beginner">{song.music_key || "C"} Key</span>
                  {(song.capo !== undefined && song.capo > 0) && <span className="badge badge-expert">Capo {song.capo}</span>}
                  {song.genre && <span className="badge" style={{ background:"rgba(255,255,255,0.05)", color:"var(--t2)", border:"1px solid var(--border)" }}>{song.genre}</span>}
                  <span className="badge" style={{ background:"rgba(255,255,255,0.05)", color:"var(--t2)", border:"1px solid var(--border)" }}>{bpm} BPM</span>
                </div>

                {/* Actions */}
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {[
                    { icon:Heart,   label:"Save",  active:liked,  onClick:()=>setLiked(l=>!l) },
                    { icon:Share2,  label:"Share", active:false,  onClick:()=>navigator.share?.({ title:song.title, url:window.location.href }).catch(()=>{}) },
                    { icon:Download,label:"PDF",   active:false,  onClick:()=>window.print() },
                  ].map(({icon:Icon,label,active,onClick})=>(
                    <button key={label} onClick={onClick}
                      style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:8, background:active?"rgba(245,166,35,0.1)":"rgba(255,255,255,0.03)", border:`1px solid ${active?"rgba(245,166,35,0.3)":"var(--border)"}`, color:active?"var(--amber)":"var(--t2)", fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.2s" }}
                      onMouseEnter={e=>{ e.currentTarget.style.color="var(--amber)"; e.currentTarget.style.borderColor="rgba(245,166,35,0.3)"; }}
                      onMouseLeave={e=>{ if(!active){ e.currentTarget.style.color="var(--t2)"; e.currentTarget.style.borderColor="var(--border)"; } }}
                    >
                      <Icon size={14}/> {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stage Mode specific header */}
            {stageMode && (
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32, borderBottom:"1px solid var(--border)", paddingBottom:20 }}>
                <div>
                  <h1 style={{ fontSize:24, fontWeight:900, marginBottom:4 }}>{song.title}</h1>
                  <p style={{ fontSize:14, color:"var(--t3)" }}>{song.artist} · Stage Mode active</p>
                </div>
                <button onClick={()=>setStageMode(false)} className="btn btn-surface btn-sm">Exit Stage</button>
              </div>
            )}

            {/* Sticky toolbar */}
            <div className="sticky-toolbar" style={{ 
              position:"sticky", top:60, zIndex:30, display:"flex", alignItems:"center", flexWrap:"wrap", gap:8, 
              padding:"8px 12px", background:"rgba(9,9,14,0.96)", backdropFilter:"blur(20px)", 
              border:"1px solid var(--border)", borderTop: stageMode ? "none" : "2px solid var(--amber)", 
              borderRadius:12, marginBottom:16 
            }}>
              {/* Auto-scroll */}
              <button onClick={()=>setScrolling(s=>!s)}
                style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"8px 12px", borderRadius:8, background:scrolling?"var(--amber)":"rgba(255,255,255,0.05)", color:scrolling?"var(--obsidian)":"var(--t1)", border:"none", fontWeight:700, fontSize:12, cursor:"pointer", transition:"all 0.2s" }}
              >
                {scrolling?<><Pause size={14}/> Stop</>:<><Play size={14}/> Scroll</>}
              </button>

              {/* Stage Mode Toggle */}
              {!stageMode && (
                <button onClick={()=>setStageMode(!stageMode)}
                  style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"8px 12px", borderRadius:8, background:"rgba(255,255,255,0.05)", color:"white", border:"none", fontWeight:700, fontSize:12, cursor:"pointer", transition:"all 0.2s" }}
                >
                  <Zap size={14} style={{ color:"var(--purple)" }}/> <span className="hide-mobile">Stage</span>
                </button>
              )}

              {/* BPM */}
              <div style={{ display:"flex", alignItems:"center", gap:4, background:"rgba(255,255,255,0.04)", border:"1px solid var(--border)", borderRadius:8, padding:"4px 8px" }}>
                <span style={{ fontSize:9, color:"var(--t3)", fontWeight:800, textTransform:"uppercase" }}>BPM</span>
                <button onClick={()=>setBpm(b=>Math.max(40,b-5))} style={{ background:"none", border:"none", color:"var(--t2)", cursor:"pointer", padding:2 }}><ChevronDown size={12}/></button>
                <span style={{ fontFamily:"var(--f-mono)", fontWeight:700, fontSize:12, color:"var(--t1)", minWidth:22, textAlign:"center" }}>{bpm}</span>
                <button onClick={()=>setBpm(b=>Math.min(220,b+5))} style={{ background:"none", border:"none", color:"var(--t2)", cursor:"pointer", padding:2 }}><ChevronUp size={12}/></button>
              </div>

              {/* Transpose */}
              <div style={{ display:"flex", alignItems:"center", gap:4, background:"rgba(255,255,255,0.04)", border:"1px solid var(--border)", borderRadius:8, padding:"4px 8px" }}>
                <span style={{ fontSize:9, color:"var(--t3)", fontWeight:800, textTransform:"uppercase" }}>Key</span>
                <button onClick={()=>setTranspose(t=>t-1)} style={{ background:"none", border:"none", color:"var(--t2)", cursor:"pointer", padding:2 }}><Minus size={12}/></button>
                <span style={{ fontFamily:"var(--f-mono)", fontWeight:700, fontSize:12, color:"var(--t1)", minWidth:20, textAlign:"center" }}>{transpose>0?`+${transpose}`:transpose}</span>
                <button onClick={()=>setTranspose(t=>t+1)} style={{ background:"none", border:"none", color:"var(--t2)", cursor:"pointer", padding:2 }}><Plus size={12}/></button>
              </div>

              {/* Font Size */}
              <div style={{ marginLeft:"auto", display:"flex", gap:4 }} className="hide-mobile">
                <button onClick={()=>setFontSize(s=>Math.max(12,s-1))} style={{ padding:"5px 10px", borderRadius:7, border:"1px solid var(--border)", background:"rgba(255,255,255,0.04)", color:"var(--t2)", cursor:"pointer", fontSize:12, fontWeight:700 }}>A−</button>
                <button onClick={()=>setFontSize(s=>Math.min(26,s+1))} style={{ padding:"5px 10px", borderRadius:7, border:"1px solid var(--border)", background:"rgba(255,255,255,0.04)", color:"var(--t2)", cursor:"pointer", fontSize:14, fontWeight:700 }}>A+</button>
              </div>
            </div>

            {/* Chord Sheet */}
            <ChordRenderer content={song.chord_data} transposeBy={transpose} simplify={simplify} fontSize={fontSize}/>
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <div style={{ width:"clamp(240px,30%,320px)", flexShrink:0 }} className="panel-sticky hide-mobile">
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* Performance Profile */}
              <div ref={summaryRef} className="glass" style={{ padding:22, position:"relative", border:"1px solid var(--border-amber)", background:"rgba(245,166,35,0.03)" }}>
                <AnimatePresence>
                  {popover && (
                    <>
                      <div style={{ position:"fixed", inset:0, zIndex:100 }} onClick={()=>setPopover(null)}/>
                      <motion.div
                        initial={{ opacity:0, scale:0.9, y:10 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.9 }}
                        style={{ 
                          position:"absolute", left:-200, top:0, 
                          width:180, zIndex:110, background:"var(--elevated)", 
                          border:"1px solid var(--border-amber)", borderRadius:14, 
                          boxShadow:"0 20px 50px rgba(0,0,0,0.8)" 
                        }}
                      >
                        <ChordDiagram chord={popover.chord}/>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                  <div style={{ width:24, height:24, borderRadius:6, background:"rgba(245,166,35,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Music size={14} style={{ color:"var(--amber)" }}/>
                  </div>
                  <span style={{ fontFamily:"var(--f-display)", fontWeight:800, fontSize:14, textTransform:"uppercase", letterSpacing:"0.05em" }}>Performance Guide</span>
                </div>

                <p style={{ fontSize:10, fontWeight:800, color:"var(--t3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>
                  Harmonic Profile · {chords.length} Chords
                </p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:24 }}>
                  {chords.map(c => (
                    <motion.div key={c}
                      whileHover={{ y:-2, scale:1.05, background:"var(--amber)" }}
                      onClick={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        const pr = summaryRef.current?.getBoundingClientRect();
                        if(!pr) return;
                        setPopover({ chord:c, x: r.left-pr.left+r.width/2, y: r.top-pr.top });
                      }}
                      style={{ 
                        fontFamily:"var(--f-mono)", fontSize:12, fontWeight:800, 
                        color:"var(--amber)", background:"rgba(245,166,35,0.08)", 
                        padding:"6px 10px", borderRadius:6, border:"1px solid rgba(245,166,35,0.15)",
                        cursor:"help", transition:"all 0.2s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color="var(--obsidian)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color="var(--amber)"; }}
                    >
                      {c}
                    </motion.div>
                  ))}
                </div>

                <div style={{ paddingTop:18, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
                  <p style={{ fontSize:10, fontWeight:800, color:"var(--t3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>
                    Standard Strumming · 4/4
                  </p>
                  <div style={{ display:"flex", gap:3 }}>
                    {["D","-","D","-","U","-","U","-","D","-","U"].map((s,i)=>(
                      <div key={i} style={{ 
                        flex:1, height:32, borderRadius:4, 
                        background: s==="-" ? "transparent" : "rgba(255,255,255,0.03)", 
                        border: s==="-" ? "none" : "1px solid var(--border)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:11, fontWeight:900, color: s==="D" ? "var(--amber)" : s==="U" ? "var(--purple)" : "rgba(255,255,255,0.1)"
                      }}>
                        {s==='-' ? '·' : s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Play Along */}
              <div className="glass-purple" style={{ padding:22, textAlign:"center", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 60% at 80% 20%, rgba(123,97,255,0.1), transparent)", pointerEvents:"none" }}/>
                <div style={{ position:"relative", zIndex:1 }}>
                  <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(123,97,255,0.15)", border:"1px solid rgba(123,97,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                    <AudioLines size={22} style={{ color:"var(--purple)" }}/>
                  </div>
                  <p style={{ fontFamily:"var(--f-display)", fontWeight:800, fontSize:16, marginBottom:8 }}>Play Along</p>
                  <p style={{ fontSize:12, color:"var(--t2)", lineHeight:1.6, marginBottom:16 }}>Use your microphone for real-time chord detection and accuracy scoring.</p>
                  <Link href="/play-along" className="btn btn-primary btn-md btn-full" style={{ gap:8 }}>
                    <PlayCircle size={15}/> Launch Stage Mode
                  </Link>
                </div>
              </div>

              {/* AI Simplifier */}
              <div className="glass" style={{ padding:18 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:14 }}>
                  <Zap size={15} style={{ color:"var(--amber)" }}/>
                  <span style={{ fontFamily:"var(--f-display)", fontWeight:700, fontSize:14 }}>AI Simplifier</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4, background:"rgba(0,0,0,0.25)", borderRadius:9, padding:4 }}>
                  {([["Beginner",true],["Original",false],["Advanced",null]] as const).map(([label,val])=>(
                    <button key={label} disabled={val===null}
                      onClick={()=>{ if(val!==null) setSimplify(val); }}
                      style={{ padding:"7px 4px", borderRadius:6, border:"none", textAlign:"center",
                        background:val===null?"transparent":simplify===val?"var(--amber)":"transparent",
                        color:val===null?"var(--t3)":simplify===val?"var(--obsidian)":"var(--t2)",
                        fontSize:11, fontWeight:700, cursor:val===null?"not-allowed":"pointer", transition:"all 0.2s"
                      }}
                    >{label}</button>
                  ))}
                </div>
                <p style={{ fontSize:11, color:"var(--t3)", marginTop:10, textAlign:"center" }}>
                  {simplify?"Simplified to beginner-friendly chords":"Showing original chords"}
                </p>
              </div>

              {/* Rating */}
              <div className="glass" style={{ padding:18 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:14 }}>
                  <Star size={15} style={{ color:"var(--amber)" }}/>
                  <span style={{ fontFamily:"var(--f-display)", fontWeight:700, fontSize:14 }}>Rate this tab</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(0,0,0,0.2)", borderRadius:9, padding:"12px 14px" }}>
                  <div style={{ display:"flex", gap:4 }}>
                    {[1,2,3,4,5].map(s=>(
                      <Star key={s} size={22}
                        style={{ color:s<=(starHover||rating)?"var(--amber)":"var(--t3)", fill:s<=(starHover||rating)?"var(--amber)":"none", cursor:"pointer", transition:"all 0.12s" }}
                        onMouseEnter={()=>setStarHover(s)}
                        onMouseLeave={()=>setStarHover(0)}
                        onClick={()=>setRating(s)}
                      />
                    ))}
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontFamily:"var(--f-mono)", fontWeight:800, fontSize:20, color:"var(--t1)" }}>4.8</p>
                    <p style={{ fontSize:10, color:"var(--t3)" }}>1,247 ratings</p>
                  </div>
                </div>
              </div>

              {/* High-fidelity Artist Card */}
              <div className="glass" style={{ padding:20, border:"1px solid var(--border-amber)", background:"rgba(245,166,35,0.02)" }}>
                <p style={{ fontSize:10, fontWeight:900, textTransform:"uppercase", color:"var(--amber)", letterSpacing:"0.08em", marginBottom:12 }}>
                  Artist Focus
                </p>
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
                  <div style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg, var(--amber), #e8920e)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:18, color:"var(--obsidian)" }}>
                    {song.artist[0]}
                  </div>
                  <div>
                    <p style={{ fontWeight:800, fontSize:15, color:"var(--t1)" }}>{song.artist}</p>
                    <p style={{ fontSize:12, color:"var(--t3)" }}>Verified Global Artist</p>
                  </div>
                </div>
                <Link href={`/explore?artist=${encodeURIComponent(song.artist)}`} className="btn btn-surface btn-sm btn-full" style={{ fontSize:11, letterSpacing:"0.02em" }}>
                  View Full Discography
                </Link>
              </div>

              {/* Related Songs Component placeholder (Future Phase) */}
              <div className="glass" style={{ padding:20 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", color:"var(--t3)", letterSpacing:"0.08em" }}>
                    Top Hits
                  </p>
                  <Music size={12} style={{ color:"var(--t3)" }}/>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {["Wonderwall", "Tum Hi Ho", "Hotel California"].map(t => (
                    <Link key={t} href="/explore" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
                      <div style={{ width:32, height:32, borderRadius:6, background:"rgba(255,255,255,0.03)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", transition:"border-color 0.2s" }}>
                        <Play size={10} style={{ color:"var(--t3)" }}/>
                      </div>
                      <span style={{ fontSize:13, color:"var(--t2)", fontWeight:600 }}>{t}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Contributor */}
              <div className="glass" style={{ padding:16 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Users size={13} style={{ color:"var(--t3)" }}/>
                    <span style={{ fontSize:12, color:"var(--t2)", fontWeight:600 }}>Contributed by</span>
                  </div>
                  <span style={{ fontFamily:"var(--f-mono)", fontSize:12, color:"var(--amber)", fontWeight:700 }}>@{song.contributor_username||"community"}</span>
                </div>
              </div>

              {/* Explore more */}
              <Link href="/explore" className="btn btn-surface btn-md btn-full" style={{ gap:8 }}>
                <Music size={14}/> Browse more songs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="show-mobile" style={{ position:"fixed", bottom:0, left:0, right:0, padding:"12px 16px 20px", background:"rgba(9,9,14,0.97)", backdropFilter:"blur(20px)", borderTop:"1px solid var(--border)", gap:10, zIndex:40 }}>
        <button onClick={()=>setScrolling(s=>!s)} className={`btn btn-${scrolling?"primary":"surface"} btn-md`} style={{ flex:1 }}>
          {scrolling?<><Pause size={15}/> Stop</>:<><Play size={15}/> Auto-scroll</>}
        </button>
        <Link href="/play-along" className="btn btn-primary btn-md" style={{ flex:1, gap:7, textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <AudioLines size={15}/> Play Along
        </Link>
      </div>
    </div>
  );
}
