"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Search, Mic, Play, Star, Music, Zap, Shuffle, ListMusic, Wifi,
  Users, Brain, ChevronRight, Flame, AudioLines, Headphones
} from "lucide-react";

/* ─────────────────────────────────────────────
   Animated counter
───────────────────────────────────────────── */
function Counter({ to, suffix="" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin:"-80px" });
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
  return <span ref={ref}>{val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : val >= 1000 ? `${(val/1000).toFixed(0)}K` : val}{suffix}</span>;
}

/* ─────────────────────────────────────────────
   Guitar string SVG
───────────────────────────────────────────── */
function GuitarString({ opacity = 0.12 }: { opacity?: number }) {
  return (
    <div style={{ position:"absolute", left:0, right:0, top:"50%", transform:"translateY(-50%)", height:80, pointerEvents:"none" }}>
      <svg viewBox="0 0 1000 80" preserveAspectRatio="none" style={{ width:"100%", height:"100%" }}>
        <motion.path
          fill="none" stroke="#F5A623" strokeWidth="1.5"
          style={{ opacity }}
          initial={{ d:"M0,40 Q500,40 1000,40" }}
          animate={{ d:["M0,40 Q500,40 1000,40","M0,40 Q250,12 500,40 T1000,40","M0,40 Q500,40 1000,40","M0,40 Q250,68 500,40 T1000,40","M0,40 Q500,40 1000,40"] }}
          transition={{ duration:7, repeat:Infinity, ease:"easeInOut" }}
        />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Marquee strip
───────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  "Hotel California","Tum Hi Ho","Wonderwall","Bohemian Rhapsody","Stairway to Heaven",
  "Let Her Go","Shape of You","Agar Tum Saath Ho","Nothing Else Matters","Phir Kabhi",
  "More Than Words","Tere Bin","Counting Stars","Photograph","Fix You",
];
function Marquee() {
  const text = [...MARQUEE_ITEMS,...MARQUEE_ITEMS];
  return (
    <div className="marquee" style={{ paddingBlock:12 }}>
      <div className="marquee-inner">
        {text.map((t,i)=>(
          <span key={i} style={{
            fontFamily:"var(--f-display)", fontWeight:900,
            fontSize: "clamp(32px,5vw,52px)",
            color:"rgba(255,255,255,0.04)", marginRight:56, letterSpacing:"-0.02em"
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Song card (trending)
───────────────────────────────────────────── */
const DIFFICULTIES: Record<string, "Beginner"|"Intermediate"|"Expert"> = {
  "Hotel California":"Intermediate","Wonderwall":"Beginner","Bohemian Rhapsody":"Expert",
  "Tum Hi Ho":"Intermediate","Let Her Go":"Beginner","Phir Kabhi":"Beginner",
  "Nothing Else Matters":"Intermediate","Stairway to Heaven":"Expert",
};

function SongCard({ title, artist, delay=0 }: { title:string; artist:string; delay?:number }) {
  const diff = DIFFICULTIES[title] ?? "Intermediate";
  const bars = (title+artist).split("").slice(0,8).map((c,i)=>((c.charCodeAt(0)*(i+3))%65)+30);
  return (
    <motion.div
      className="song-card"
      style={{ width:210, height:280, flexShrink:0 }}
      initial={{ opacity:0, y:24 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, margin:"-40px" }}
      transition={{ duration:0.5, delay, ease:[0.16,1,0.3,1] }}
    >
      {/* Visualization */}
      <div style={{ height:"62%", overflow:"hidden", background:"linear-gradient(180deg,rgba(245,166,35,0.07),transparent)", display:"flex", alignItems:"flex-end", justifyContent:"center", gap:5, padding:"0 16px 16px" }}>
        {bars.map((h,i)=>(
          <motion.div key={i}
            style={{ width:8, background:`rgba(245,166,35,${0.2+i*0.09})`, borderRadius:"3px 3px 0 0" }}
            animate={{ height:[`${h}%`,`${h*0.55}%`,`${h*1.15}%`,`${h}%`] }}
            transition={{ duration:2+i*0.25, repeat:Infinity, ease:"easeInOut", delay:i*0.12 }}
          />
        ))}
      </div>

      {/* Play overlay */}
      <div className="song-card-play">
        <div style={{ width:52, height:52, borderRadius:"50%", background:"var(--amber)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 28px rgba(245,166,35,0.5)" }}>
          <Play size={20} style={{ color:"var(--obsidian)", marginLeft:2 }} fill="currentColor"/>
        </div>
      </div>

      {/* Metadata */}
      <div style={{ padding:"12px 14px 14px", background:"rgba(9,9,14,0.95)" }}>
        <span className={`badge badge-${diff.toLowerCase()}`} style={{ marginBottom:6 }}>{diff}</span>
        <p style={{ fontFamily:"var(--f-display)", fontWeight:700, fontSize:14, color:"var(--t1)", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{title}</p>
        <p style={{ fontSize:12, color:"var(--t2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{artist}</p>
        {/* Amber underline on hover */}
        <div style={{ marginTop:10, height:2, background:"linear-gradient(90deg,var(--amber),transparent)", opacity:0, transition:"opacity 0.2s" }} className="song-card-line"/>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Feature card
───────────────────────────────────────────── */
function FeatureCard({ icon:Icon, label, desc, color="#F5A623", delay=0 }:{ icon:any; label:string; desc:string; color?:string; delay?:number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    cardRef.current.style.boxShadow = `0 15px 30px rgba(0,0,0,0.3), ${rotateY * -1}px ${rotateX}px 20px ${color}15`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    cardRef.current.style.boxShadow = `none`;
  };

  return (
    <motion.div className="glass interactive" style={{ padding:22, transition: "transform 0.1s ease-out, box-shadow 0.1s ease-out", transformStyle: "preserve-3d" }}
      ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      initial={{ opacity:0, scale:0.94 }} whileInView={{ opacity:1, scale:1 }}
      viewport={{ once:true, margin:"-40px" }}
      transition={{ duration:0.45, delay, ease:[0.16,1,0.3,1] }}
    >
      <div style={{ width:40, height:40, borderRadius:10, background:`${color}16`, border:`1px solid ${color}28`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14, transform:"translateZ(20px)" }}>
        <Icon size={19} style={{ color }}/>
      </div>
      <p style={{ fontFamily:"var(--f-display)", fontWeight:700, fontSize:15, marginBottom:6, color:"var(--t1)", transform:"translateZ(10px)" }}>{label}</p>
      <p style={{ fontSize:13, color:"var(--t2)", lineHeight:1.55, transform:"translateZ(5px)" }}>{desc}</p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Genre card
───────────────────────────────────────────── */
const GENRES = [
  { name:"Rock",      emoji:"🎸", color:"#FF5C5C" },
  { name:"Pop",       emoji:"✨", color:"#F5A623" },
  { name:"Bollywood", emoji:"🎬", color:"#7B61FF" },
  { name:"Classical", emoji:"🎻", color:"#2DD4A0" },
  { name:"Jazz",      emoji:"🎷", color:"#F5A623" },
  { name:"Blues",     emoji:"🎵", color:"#6B9AFF" },
  { name:"Country",   emoji:"🤠", color:"#F5A623" },
  { name:"Metal",     emoji:"🤘", color:"#FF5C5C" },
  { name:"Indie",     emoji:"🌿", color:"#2DD4A0" },
  { name:"Hip-Hop",   emoji:"🎤", color:"#7B61FF" },
  { name:"Folk",      emoji:"🪕", color:"#F5A623" },
  { name:"EDM",       emoji:"⚡", color:"#7B61FF" },
];

/* ─────────────────────────────────────────────
   Testimonials
───────────────────────────────────────────── */
const TESTIMONIALS = [
  { name:"Rohan M.", role:"Acoustic Guitar", quote:"I learned Stairway to Heaven in 2 weeks using the AI Simplifier. Literally game-changing.", stars:5 },
  { name:"Priya S.", role:"Ukulele Player",  quote:"The Play Along mode made my accuracy jump from 58% to 93% in 10 days. Nothing else comes close.", stars:5 },
  { name:"Alex K.",  role:"Electric Guitar", quote:"Replaced Ultimate Guitar entirely. The autoscroll at BPM during live gigs is insane.", stars:5 },
];

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function HomePage() {
  const [query, setQuery]         = useState("");
  const [focused, setFocused]     = useState(false);
  const [results, setResults]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSug, setShowSug]         = useState(false);

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

  // Handle results separately or merge suggestions? Usually suggestions are prefix match.
  // We'll keep the results for full search results, but suggestions for the dropdown.

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

  const TRENDING = [
    { title:"Hotel California", artist:"Eagles" },
    { title:"Wonderwall",       artist:"Oasis" },
    { title:"Bohemian Rhapsody",artist:"Queen" },
    { title:"Tum Hi Ho",        artist:"Arijit Singh" },
    { title:"Let Her Go",       artist:"Passenger" },
    { title:"Phir Kabhi",       artist:"Arijit Singh" },
    { title:"Nothing Else Matters", artist:"Metallica" },
    { title:"Stairway to Heaven",   artist:"Led Zeppelin" },
  ];

  const FEATURES = [
    { icon:Play,       label:"Play Along",    desc:"Real-time mic detection & accuracy scoring",     color:"#F5A623" },
    { icon:Brain,      label:"AI Simplifier", desc:"Complex chords converted to beginner shapes",    color:"#7B61FF" },
    { icon:Shuffle,    label:"Transpose",     desc:"Instant key changes with capo calculator",        color:"#2DD4A0" },
    { icon:ListMusic,  label:"Setlists",      desc:"Organize songs for your next gig or practice",   color:"#F5A623" },
    { icon:Zap,        label:"Stage Mode",    desc:"Full-screen zero-chrome performance view",        color:"#FF5C5C" },
    { icon:Wifi,       label:"Offline",       desc:"Save songs & practice without the internet",      color:"#2DD4A0" },
    { icon:Users,      label:"Community",     desc:"Contribute & vote on 50,000+ crowd-sourced tabs",color:"#7B61FF" },
    { icon:Headphones, label:"Mood Search",   desc:"'Sad acoustic songs in Am' — just type it",     color:"#F5A623" },
  ];

  return (
    <div style={{ background:"var(--obsidian)", minHeight:"100vh", paddingTop:60 }}>

      {/* ═══ HERO ═══════════════════════════════════════════ */}
      <section style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
        {/* BG photo */}
        <div style={{ position:"absolute", inset:0, backgroundImage:`url("https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1600&auto=format&q=70")`, backgroundSize:"cover", backgroundPosition:"center", opacity:0.07, filter:"blur(40px)" }}/>
        {/* Vignette */}
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 90% 70% at 50% 50%, rgba(9,9,14,0.3), rgba(9,9,14,0.96))" }}/>
        {/* Amber blob */}
        <div style={{ position:"absolute", top:"-15%", left:"-8%", width:"45vw", height:"45vw", borderRadius:"50%", background:"rgba(245,166,35,0.07)", filter:"blur(100px)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:"10%", right:"-5%", width:"35vw", height:"35vw", borderRadius:"50%", background:"rgba(123,97,255,0.06)", filter:"blur(100px)", pointerEvents:"none" }}/>

        <GuitarString opacity={0.14}/>

        <div className="container" style={{ position:"relative", zIndex:2, textAlign:"center", paddingTop:40, paddingBottom:40 }}>
          {/* Label */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
            <span className="section-label" style={{ marginBottom:28 }}>
              <Music size={11}/> 50,000+ Songs · Open Source · Free Forever
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.08, ease:[0.16,1,0.3,1] }}
            style={{ fontFamily:"var(--f-display)", fontWeight:900, fontSize:"clamp(42px,8vw,82px)", lineHeight:1.04, letterSpacing:"-0.035em", marginBottom:20 }}
          >
            Every song you love.<br/>
            <span className="text-gradient">Every chord you need.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.16, ease:[0.16,1,0.3,1] }}
            style={{ fontSize:"clamp(15px,2.5vw,19px)", color:"var(--t2)", maxWidth:500, margin:"0 auto 36px", lineHeight:1.7 }}
          >
            50,000+ songs. Real-time chord detection. Built for every guitarist from bedroom to stage.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.24, ease:[0.16,1,0.3,1] }}
            style={{ display:"flex", justifyContent:"center", gap:14, flexWrap:"wrap", marginBottom:40 }}
          >
            <Link href="/explore" className="btn btn-primary btn-xl pulse-once" style={{ minWidth:180 }}>
              <Search size={18}/> Find a Song
            </Link>
            <Link href="/play-along" className="btn btn-ghost btn-xl" style={{ minWidth:180 }}>
              <Mic size={18} style={{ color:"var(--amber)" }} className="mic-throb"/> Try Play Along
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.8, delay:0.4 }}
            style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:20, flexWrap:"wrap" }}
          >
            {["50K+ Songs","2M+ Musicians","4.9★ Rated"].map((b,i)=>(
              <span key={b} style={{ display:"flex", alignItems:"center", gap:10, fontSize:12, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                {i>0 && <span style={{ width:4, height:4, borderRadius:"50%", background:"var(--amber)", opacity:.6 }}/>}
                {b}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Marquee at bottom of hero */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:2 }}>
          <Marquee/>
        </div>
      </section>

      {/* ═══ SEARCH BAR ════════════════════════════════════ */}
      <section style={{ background:"var(--surface)", padding:"40px 0", position:"relative", zIndex:10 }}>
        <div className="container">
          <div style={{ maxWidth:700, margin:"0 auto", position:"relative" }}>
            <div style={{
              display:"flex", alignItems:"center",
              background:"rgba(255,255,255,0.035)", backdropFilter:"blur(16px)",
              border:`1px solid ${focused?"rgba(245,166,35,0.5)":"rgba(255,255,255,0.08)"}`,
              borderRadius:14, padding:"4px 16px 4px 20px",
              boxShadow: focused?"0 0 0 3px rgba(245,166,35,0.1), 0 0 40px rgba(245,166,35,0.08)":"none",
              transition:"all 0.3s",
            }}>
              {loading
                ? <div style={{ width:20, height:20, borderRadius:"50%", border:"2px solid var(--amber)", borderTopColor:"transparent", animation:"spin 0.6s linear infinite", flexShrink:0 }}/>
                : <Search size={20} style={{ color:focused?"var(--amber)":"var(--t3)", flexShrink:0, transition:"color 0.2s" }}/>
              }
              <input
                value={query}
                onChange={e=>setQuery(e.target.value)}
                onFocus={()=>setFocused(true)}
                onBlur={()=>setTimeout(()=>setFocused(false),200)}
                placeholder="Search any song, artist, or chord... (⌘K)"
                style={{ flex:1, background:"transparent", border:"none", outline:"none", padding:"14px 16px", fontSize:16, color:"var(--t1)", fontFamily:"var(--f-body)" }}
              />
              {!query && (
                <kbd style={{ fontSize:10, color:"var(--t3)", background:"rgba(255,255,255,0.06)", padding:"4px 8px", borderRadius:6, fontFamily:"var(--f-mono)", flexShrink:0 }}>⌘K</kbd>
              )}
            </div>

            {/* Results dropdown */}
            <AnimatePresence>
              {(focused || showSug) && (
                <motion.div
                  initial={{ opacity:0, y:8, scale:0.98 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:8, scale:0.98 }}
                  transition={{ duration:0.12 }}
                  className="glass"
                  style={{ position:"absolute", top:"calc(100% + 8px)", left:0, right:0, zIndex:60, borderRadius:14, overflow:"hidden", border:"1px solid var(--border-amber)", boxShadow:"0 20px 40px rgba(0,0,0,0.6)" }}
                >
                  {/* Suggestions (Typeahead) */}
                  {query.length >= 2 && suggestions.length > 0 && (
                    <div style={{ padding:8, background:"rgba(245,166,35,0.03)", borderBottom:"1px solid var(--border)" }}>
                      <p style={{ fontSize:10, fontWeight:900, textTransform:"uppercase", color:"var(--amber)", marginBottom:4, paddingLeft:12 }}>Suggestions</p>
                      {suggestions.map((s,i)=>(
                        <Link key={i} href={`/explore?q=${encodeURIComponent(s.title)}`}
                          style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:10, textDecoration:"none", transition:"background 0.2s" }}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,240,200,0.05)"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                        >
                          <Zap size={14} style={{ color:"var(--amber)" }}/>
                          <span style={{ fontWeight:700, fontSize:14, color:"var(--t1)" }}>{s.title}</span>
                          <span style={{ fontSize:12, color:"var(--t3)", marginLeft:"auto" }}>{s.artist}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {!query && (
                    <div style={{ padding:12 }}>
                      <p style={{ fontSize:11, fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--t3)", marginBottom:10 }}>Trending Searches</p>
                      {["Wonderwall","Tum Hi Ho","Hotel California","Let Her Go"].map(term=>(
                        <button key={term} onMouseDown={()=>setQuery(term)}
                          style={{ width:"100%", textAlign:"left", display:"flex", alignItems:"center", gap:10, padding:"10px 8px", borderRadius:8, background:"transparent", color:"var(--t2)", fontSize:14, transition:"background 0.15s", cursor:"pointer", border:"none" }}
                          onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.04)")}
                          onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
                        >
                          <Flame size={13} style={{ color:"var(--amber)", flexShrink:0 }}/> {term}
                        </button>
                      ))}
                    </div>
                  )}

                  {results.length > 0 && (
                    <div style={{ padding:8 }}>
                      <p style={{ fontSize:11, fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--t3)", marginBottom:10, paddingLeft:4 }}>Top Hits</p>
                      {results.map(song => (
                        <Link key={song.id} href={`/song/${song.id}`}
                          style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", borderRadius:10, transition:"all 0.2s", textDecoration:"none", border:"1px solid transparent" }}
                          onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.05)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="transparent"; }}
                        >
                          <span>
                            <span style={{ fontWeight:700, fontSize:14, color:"var(--t1)" }}>{song.title}</span>
                            <span style={{ fontSize:12, color:"var(--t3)", marginLeft:10 }}>{song.artist}</span>
                          </span>
                          <span className="badge badge-intermediate">Sheet</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {query && results.length === 0 && !loading && (
                    <div style={{ padding:32, textAlign:"center", opacity:0.6 }}>
                      <Search size={24} style={{ color:"var(--t3)", marginBottom:12 }}/>
                      <p style={{ fontSize:14, color:"var(--t3)" }}>No matches for "{query}"</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </section>

      {/* ═══ STATS ══════════════════════════════════════════ */}
      <section style={{ padding:"72px 0", background:"var(--obsidian)" }}>
        <div className="container">
          <div style={{ display:"flex", justifyContent:"center", flexWrap:"wrap" }}>
            {[
              { to:50000,    suffix:"+", label:"Songs in Archive" },
              { to:2400000,  suffix:"+", label:"Active Musicians" },
              { to:4.9,      suffix:"★",  label:"Average Rating" },
            ].map((s,i)=>(
              <div key={s.label} style={{
                flex:"1 1 200px", textAlign:"center", padding:"24px 32px",
                borderLeft: i > 0 ? "1px solid rgba(245,166,35,0.2)" : undefined,
              }}>
                <motion.p
                  initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
                  transition={{ delay:i*0.1, duration:0.5 }}
                  style={{ fontFamily:"var(--f-display)", fontWeight:900, fontSize:"clamp(38px,6vw,58px)", color:"var(--t1)", letterSpacing:"-0.04em", lineHeight:1 }}
                >
                  <Counter to={s.to} suffix={s.suffix}/>
                </motion.p>
                <p style={{ fontSize:12, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:"0.07em", marginTop:8 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TRENDING ═══════════════════════════════════════ */}
      <section className="section" style={{ background:"var(--surface)" }}>
        <div className="container">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:36 }}>
            <div>
              <span className="section-label"><Flame size={11}/> Live now</span>
              <motion.h2
                initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
                transition={{ duration:0.55, ease:[0.16,1,0.3,1] }}
                style={{ fontFamily:"var(--f-display)", fontWeight:900, fontSize:"clamp(26px,4vw,40px)" }}
              >
                Trending this week
              </motion.h2>
            </div>
            <Link href="/explore" className="btn btn-surface btn-sm" style={{ gap:6 }}>
              View all <ChevronRight size={14}/>
            </Link>
          </div>

          <div className="scrollbar-hide" style={{ display:"flex", gap:14, overflowX:"auto", paddingBottom:4 }}>
            {TRENDING.map((s,i)=>(
              <Link key={i} href={`/explore?q=${encodeURIComponent(s.title)}`} style={{ textDecoration:"none" }}>
                <SongCard title={s.title} artist={s.artist} delay={i*0.06}/>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PLAY ALONG PROMO ═══════════════════════════════ */}
      <section className="section" style={{ background:"var(--obsidian)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", bottom:"-20%", right:"5%", width:"35vw", height:"35vw", borderRadius:"50%", background:"rgba(245,166,35,0.07)", filter:"blur(80px)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", top:"-10%", left:"0%",  width:"25vw", height:"25vw", borderRadius:"50%", background:"rgba(123,97,255,0.06)", filter:"blur(80px)", pointerEvents:"none" }}/>

        <div className="container" style={{ display:"flex", gap:"clamp(32px,6vw,72px)", flexWrap:"wrap", alignItems:"center", position:"relative", zIndex:1 }}>
          {/* Left */}
          <motion.div style={{ flex:"1 1 300px" }}
            initial={{ opacity:0, x:-40 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
            transition={{ duration:0.75, ease:[0.16,1,0.3,1] }}
          >
            <span className="section-label"><Zap size={11}/> Real-time · AI-powered</span>
            <h2 style={{ fontFamily:"var(--f-display)", fontWeight:900, fontSize:"clamp(30px,5vw,52px)", marginBottom:20, lineHeight:1.08 }}>
              Your guitar.<br/>Our ears.<br/><span className="text-gradient">Instant feedback.</span>
            </h2>
            <p style={{ fontSize:16, color:"var(--t2)", lineHeight:1.7, maxWidth:420, marginBottom:32 }}>
              Enable your microphone and play chord by chord. We detect your notes in real-time, score your accuracy, and track your practice streak.
            </p>
            <Link href="/play-along" className="btn btn-primary btn-lg">
              <Play size={18} fill="currentColor"/> Launch Stage Mode
            </Link>
          </motion.div>

          {/* Right — mockup */}
          <motion.div style={{ flex:"1 1 320px", maxWidth:480 }}
            initial={{ opacity:0, scale:0.88 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }}
            transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}
          >
            <div className="glass" style={{ padding:28, border:"1px solid rgba(245,166,35,0.15)", background:"rgba(9,9,14,0.95)", boxShadow:"0 40px 80px rgba(0,0,0,0.5)" }}>
              {/* Header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                <div>
                  <p style={{ fontFamily:"var(--f-display)", fontWeight:700, fontSize:17, color:"var(--t1)" }}>Hotel California</p>
                  <p style={{ fontSize:12, color:"var(--t3)" }}>Eagles · BPM 147 · 4/4</p>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ padding:"4px 10px", borderRadius:999, background:"rgba(45,212,160,0.15)", color:"var(--green)", fontSize:11, fontWeight:800 }}>🔥 12 Streak</span>
                  <span style={{ fontFamily:"var(--f-mono)", color:"var(--amber)", fontSize:18, fontWeight:700 }}>84K</span>
                </div>
              </div>

              {/* Chord highway */}
              <div style={{ height:96, background:"rgba(0,0,0,0.4)", borderRadius:12, display:"flex", alignItems:"center", gap:28, overflow:"hidden", marginBottom:20, padding:"0 20px" }}>
                <span style={{ fontFamily:"var(--f-mono)", fontSize:24, fontWeight:700, color:"var(--green)", opacity:.5 }}>Bm</span>
                <motion.div style={{ border:"2px solid rgba(245,166,35,0.7)", borderRadius:12, padding:"10px 18px", background:"rgba(245,166,35,0.07)" }}
                  animate={{ boxShadow:["0 0 0 0 rgba(245,166,35,0.4)","0 0 24px 6px rgba(245,166,35,0.15)","0 0 0 0 rgba(245,166,35,0.4)"] }}
                  transition={{ duration:0.5, repeat:Infinity }}
                >
                  <span style={{ fontFamily:"var(--f-mono)", fontSize:34, fontWeight:700, color:"var(--amber)" }}>F#m</span>
                </motion.div>
                <span style={{ fontFamily:"var(--f-mono)", fontSize:24, fontWeight:700, color:"var(--t1)", opacity:.22 }}>A</span>
                <span style={{ fontFamily:"var(--f-mono)", fontSize:24, fontWeight:700, color:"var(--t1)", opacity:.1 }}>E</span>
              </div>

              {/* Mic bars */}
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:28 }}>
                  {[40,70,30,90,55,80,35,65,45,75].map((h,i)=>(
                    <motion.div key={i} className="mic-bar"
                      style={{ height:`${h*0.28}px`, background:"var(--green)" }}
                      animate={{ scaleY:[1, h/40, 0.4, 1] }}
                      transition={{ duration:0.45+i*0.06, repeat:Infinity, ease:"easeInOut" }}
                    />
                  ))}
                </div>
                <div>
                  <p style={{ fontSize:11, color:"var(--t3)" }}>Detecting</p>
                  <p style={{ fontFamily:"var(--f-mono)", fontSize:20, fontWeight:700, color:"var(--t1)" }}>F#m</p>
                </div>
                <div style={{ marginLeft:"auto", textAlign:"right" }}>
                  <p style={{ fontSize:11, color:"var(--t3)" }}>Accuracy</p>
                  <p style={{ fontFamily:"var(--f-mono)", fontSize:20, fontWeight:700, color:"var(--green)" }}>94%</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FEATURES ═══════════════════════════════════════ */}
      <section className="section" style={{ background:"var(--surface)" }}>
        <div className="container">
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <motion.h2
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              transition={{ duration:0.55 }}
              style={{ fontFamily:"var(--f-display)", fontWeight:900, fontSize:"clamp(26px,4vw,44px)", marginBottom:12 }}
            >
              Everything a guitarist needs
            </motion.h2>
            <p style={{ fontSize:16, color:"var(--t2)", maxWidth:440, margin:"0 auto" }}>One platform. Every tool. Built for the way you actually practice and perform.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", gap:14 }}>
            {FEATURES.map((f,i)=><FeatureCard key={f.label} {...f} delay={i*0.05}/>)}
          </div>
        </div>
      </section>

      {/* ═══ GENRES ═════════════════════════════════════════ */}
      <section className="section" style={{ background:"var(--obsidian)" }}>
        <div className="container">
          <motion.h2
            initial={{ opacity:0, x:-20 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
            transition={{ duration:0.55 }}
            style={{ fontFamily:"var(--f-display)", fontWeight:900, fontSize:"clamp(24px,3.5vw,38px)", marginBottom:28 }}
          >
            Browse by genre
          </motion.h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(140px,1fr))", gap:10 }}>
            {GENRES.map((g,i)=>(
              <motion.div key={g.name}
                initial={{ opacity:0, scale:0.92 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }}
                transition={{ duration:0.4, delay:i*0.04 }}
              >
                <Link href={`/explore?genre=${g.name}`} className="genre-card"
                  style={{ textDecoration:"none" }}
                >
                  <div style={{ position:"absolute", inset:0, background:g.color, opacity:0.1, transition:"opacity 0.25s" }} className="genre-bg"/>
                  <span style={{ fontSize:22 }}>{g.emoji}</span>
                  <span style={{ fontFamily:"var(--f-display)", fontWeight:700, fontSize:14, color:"var(--t1)", position:"relative", zIndex:1 }}>{g.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══════════════════════════════════ */}
      <section className="section" style={{ background:"var(--surface)" }}>
        <div className="container">
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <motion.h2
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
              transition={{ duration:0.55 }}
              style={{ fontFamily:"var(--f-display)", fontWeight:900, fontSize:"clamp(24px,4vw,38px)", marginBottom:10 }}
            >
              Guitarists love Geethub
            </motion.h2>
            <p style={{ fontSize:15, color:"var(--t2)" }}>Real words from real musicians.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:18 }}>
            {TESTIMONIALS.map((t,i)=>(
              <motion.div key={t.name} className="glass" style={{ padding:28 }}
                initial={{ opacity:0, y:22 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
                transition={{ duration:0.5, delay:i*0.1 }}
              >
                <div style={{ display:"flex", gap:3, marginBottom:14 }}>
                  {[...Array(t.stars)].map((_,j)=><Star key={j} size={14} style={{ color:"var(--amber)" }} fill="var(--amber)"/>)}
                </div>
                <p style={{ fontSize:15, color:"var(--t1)", lineHeight:1.7, marginBottom:20, fontStyle:"italic" }}>"{t.quote}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,var(--amber),#e8920e)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14, color:"var(--obsidian)", flexShrink:0 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:"var(--t1)" }}>{t.name}</p>
                    <p style={{ fontSize:12, color:"var(--t3)" }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ══════════════════════════════════════ */}
      <section style={{ padding:"80px 0", background:"var(--obsidian)", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <GuitarString opacity={0.1}/>
        <div className="container" style={{ position:"relative", zIndex:1 }}>
          <motion.h2
            initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            transition={{ duration:0.6 }}
            style={{ fontFamily:"var(--f-display)", fontWeight:900, fontSize:"clamp(28px,5vw,52px)", marginBottom:20 }}
          >
            Ready to play?
          </motion.h2>
          <p style={{ fontSize:17, color:"var(--t2)", maxWidth:400, margin:"0 auto 36px" }}>
            Join 2 million guitarists who use Geethub every day.
          </p>
          <div style={{ display:"flex", justifyContent:"center", gap:14, flexWrap:"wrap" }}>
            <Link href="/explore" className="btn btn-primary btn-xl"><Search size={18}/> Browse Songs</Link>
            <Link href="/commit"  className="btn btn-ghost btn-xl"><Zap size={18}/> Contribute Chords</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
