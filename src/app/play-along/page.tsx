"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Mic, MicOff, Play, Pause, X, Flame, Star, CheckCircle, XCircle, ArrowLeft, Music } from "lucide-react";

/* ─── A simple hardcoded demo song ─── */
const DEMO_SONG = {
  title: "Hotel California",
  artist: "Eagles",
  chords: ["Am","E","G","D","F","C","Dm","E","Am","E","G","D","F","C","Dm","E"],
  bpm: 75,
};

interface ChordSlot { chord:string; status:"future"|"active"|"correct"|"missed" }

/* ─── Particle field (canvas) ─── */
function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext("2d"); if(!ctx) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({length:60}, ()=>({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      vx: (Math.random()-0.5)*0.3,
      vy: -(Math.random()*0.4+0.1),
      r: Math.random()*2+0.5,
      a: Math.random()*0.5+0.1,
    }));

    let raf:number;
    function draw() {
      ctx!.clearRect(0,0,canvas!.width,canvas!.height);
      particles.forEach(p=>{
        ctx!.beginPath();
        ctx!.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx!.fillStyle = `rgba(245,166,35,${p.a})`;
        ctx!.fill();
        p.x += p.vx; p.y += p.vy;
        if(p.y < -5) { p.y=canvas!.height+5; p.x=Math.random()*canvas!.width; }
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, opacity:0.5 }}/>;
}

/* ─── Mic waveform ─── */
function MicWave({ active, status }: { active:boolean; status:"idle"|"listening"|"correct"|"wrong" }) {
  const color = status==="correct"?"var(--green)":status==="wrong"?"var(--red)":"var(--amber)";
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:36 }}>
      {[55,80,35,95,60,45,88,40,70,55,30,75].map((h,i)=>(
        <motion.div key={i}
          style={{ width:4, borderRadius:2, background:color, transformOrigin:"bottom" }}
          animate={active ? { height:[`${h*0.36}px`,`${h*0.12}px`,`${h*0.36}px`] } : { height:"4px" }}
          transition={{ duration:0.4+i*0.05, repeat:Infinity, ease:"easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function PlayAlongPage() {
  const [phase, setPhase]   = useState<"landing"|"playing"|"results">("landing");
  const [micOn,  setMicOn]  = useState(false);
  const [score,  setScore]  = useState(0);
  const [streak, setStreak] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [correct, setCorrect]   = useState(0);
  const [missed,  setMissed]    = useState(0);
  const [idx,    setIdx]    = useState(0);
  const [playing, setPlaying]   = useState(false);
  const [feedback, setFeedback] = useState<"correct"|"wrong"|null>(null);

  const slots: ChordSlot[] = DEMO_SONG.chords.map((chord,i)=>({
    chord,
    status: i < idx ? (Math.random()>0.2 ? "correct" : "missed") : i===idx ? "active" : "future",
  }));

  const handlePlay = () => { setPhase("playing"); setPlaying(true); };

  // Simulate chord advancement
  useEffect(()=>{
    if(!playing || phase!=="playing") return;
    const ms = Math.floor(60000/DEMO_SONG.bpm);
    const t = setInterval(()=>{
      const hit = Math.random()>0.2;
      setFeedback(hit?"correct":"wrong");
      setTimeout(()=>setFeedback(null), 400);
      if(hit){ setScore(s=>s+100); setStreak(st=>st+1); setCorrect(c=>c+1); }
      else   { setStreak(0); setMissed(m=>m+1); }
      setIdx(i=>{
        const next = i+1;
        if(next>=DEMO_SONG.chords.length){ setPlaying(false); setTimeout(()=>setPhase("results"),600); }
        return Math.min(next, DEMO_SONG.chords.length-1);
      });
    }, ms*2);
    return ()=>clearInterval(t);
  },[playing,phase]);

  useEffect(()=>{
    const total = correct+missed;
    setAccuracy(total>0 ? Math.round((correct/total)*100) : 100);
  },[correct,missed]);

  const reset = () => {
    setPhase("landing"); setScore(0); setStreak(0); setAccuracy(100);
    setCorrect(0); setMissed(0); setIdx(0); setPlaying(false); setFeedback(null);
  };

  /* ═════════════════ LANDING ════════════════════════════ */
  if(phase==="landing") return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--obsidian)", paddingTop:60, textAlign:"center", position:"relative", overflow:"hidden" }}>
      <ParticleField/>
      <div style={{ position:"relative", zIndex:1 }} className="container">
        <motion.span className="section-label" style={{ display:"inline-flex", marginBottom:28 }}
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
        >
          <Music size={11}/> Real-time chord detection
        </motion.span>

        <motion.h1
          initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.08 }}
          style={{ fontFamily:"var(--f-display)", fontWeight:900, fontSize:"clamp(38px,7vw,72px)", marginBottom:20 }}
        >
          Play Along Mode
        </motion.h1>

        <motion.p
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.16 }}
          style={{ fontSize:17, color:"var(--t2)", maxWidth:480, margin:"0 auto 40px", lineHeight:1.7 }}
        >
          Follow the chord highway as it scrolls. We use your microphone to detect chords and score your accuracy in real-time.
        </motion.p>

        {/* Demo song card */}
        <motion.div className="glass" style={{ maxWidth:420, margin:"0 auto 40px", padding:"24px 28px", textAlign:"left", border:"1px solid rgba(245,166,35,0.2)" }}
          initial={{ opacity:0, scale:0.94 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.6, delay:0.24 }}
        >
          <p style={{ fontSize:11, fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--t3)", marginBottom:10 }}>Demo Song</p>
          <p style={{ fontFamily:"var(--f-display)", fontWeight:800, fontSize:22, color:"var(--t1)", marginBottom:4 }}>{DEMO_SONG.title}</p>
          <p style={{ fontSize:14, color:"var(--t2)", marginBottom:16 }}>{DEMO_SONG.artist}</p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {DEMO_SONG.chords.slice(0,8).map((c,i)=>(
              <span key={i} style={{ fontFamily:"var(--f-mono)", fontSize:13, fontWeight:700, color:"var(--amber)", background:"var(--amber-dim)", padding:"4px 10px", borderRadius:6, border:"1px solid var(--border-amber)" }}>{c}</span>
            ))}
            <span style={{ fontSize:12, color:"var(--t3)", alignSelf:"center" }}>+{DEMO_SONG.chords.length-8} more</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.32 }} style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <button className="btn btn-primary btn-xl" onClick={handlePlay}>
            <Play size={20} fill="currentColor"/> Start Playing
          </button>
          <Link href="/explore" className="btn btn-ghost btn-xl">
            <ArrowLeft size={18}/> Pick a Song
          </Link>
        </motion.div>

        <p style={{ fontSize:12, color:"var(--t3)", marginTop:20 }}>
          Microphone access will be requested when you start.
        </p>
      </div>
    </div>
  );

  /* ═════════════════ RESULTS ════════════════════════════ */
  if(phase==="results") return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--obsidian)", paddingTop:60, textAlign:"center" }}>
      <ParticleField/>
      <div style={{ position:"relative", zIndex:1 }} className="container">
        <motion.h1
          initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.6, ease:[0.16,1,0.3,1] }}
          style={{ fontFamily:"var(--f-display)", fontWeight:900, fontSize:"clamp(36px,6vw,64px)", marginBottom:12 }}
        >
          🎉 Song Complete!
        </motion.h1>
        <p style={{ fontSize:16, color:"var(--t2)", marginBottom:40 }}>{DEMO_SONG.title} · {DEMO_SONG.artist}</p>

        {/* Stars */}
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:40 }}>
          {[...Array(accuracy>=90?3:accuracy>=70?2:1)].map((_,i)=>(
            <motion.div key={i}
              initial={{ opacity:0, scale:0, rotate:-20 }} animate={{ opacity:1, scale:1, rotate:0 }}
              transition={{ delay:i*0.2, duration:0.5, ease:[0.16,1,0.3,1] }}
            >
              <Star size={52} style={{ color:"var(--amber)" }} fill="var(--amber)"/>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display:"flex", gap:24, justifyContent:"center", flexWrap:"wrap", marginBottom:48 }}>
          {[
            { label:"Score",    value:score.toLocaleString() },
            { label:"Accuracy", value:`${accuracy}%` },
            { label:"✅ Correct", value:correct },
            { label:"❌ Missed",  value:missed },
            { label:"Best Streak", value:`${streak}🔥` },
          ].map(s=>(
            <div key={s.label} className="glass" style={{ padding:"16px 24px", minWidth:100 }}>
              <p style={{ fontFamily:"var(--f-mono)", fontWeight:800, fontSize:28, color:"var(--t1)" }}>{s.value}</p>
              <p style={{ fontSize:11, color:"var(--t3)", textTransform:"uppercase", letterSpacing:"0.06em", marginTop:4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <button className="btn btn-primary btn-lg" onClick={reset}>
            <Play size={17} fill="currentColor"/> Try Again
          </button>
          <Link href="/explore" className="btn btn-ghost btn-lg">
            Browse More Songs
          </Link>
        </div>
      </div>
    </div>
  );

  /* ═════════════════ PLAYING ════════════════════════════ */
  const activeChord = DEMO_SONG.chords[idx] || "";

  return (
    <div style={{ position:"fixed", inset:0, background:"#060609", display:"flex", flexDirection:"column", zIndex:999 }}>
      <ParticleField/>

      {/* Screen flash */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            key={feedback}
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.15 }}
            style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:50,
              background: feedback==="correct" ? "rgba(45,212,160,0.06)" : "rgba(255,92,92,0.06)"
            }}
          />
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div style={{ position:"relative", zIndex:2, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 24px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <p style={{ fontFamily:"var(--f-display)", fontWeight:700, fontSize:16, color:"var(--t1)" }}>{DEMO_SONG.title}</p>
          <p style={{ fontSize:12, color:"var(--t3)" }}>{DEMO_SONG.artist} · BPM {DEMO_SONG.bpm}</p>
        </div>
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          {streak >= 5 && <span style={{ fontSize:13, color:"var(--amber)", fontWeight:800 }}>🔥 {streak} streak!</span>}
          <span style={{ fontFamily:"var(--f-mono)", fontSize:20, fontWeight:800, color:"var(--amber)" }}>{score.toLocaleString()}</span>
          <span style={{ fontFamily:"var(--f-mono)", fontSize:15, color:"var(--green)", fontWeight:700 }}>{accuracy}%</span>
          <button onClick={reset} className="btn btn-surface btn-icon" style={{ color:"var(--t2)" }}>
            <X size={18}/>
          </button>
        </div>
      </div>

      {/* Chord highway */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", zIndex:1 }}>
        {/* Track */}
        <div style={{ width:"100%", background:"rgba(255,255,255,0.02)", borderTop:"1px solid rgba(255,255,255,0.04)", borderBottom:"1px solid rgba(255,255,255,0.04)", padding:"24px 0", overflow:"hidden", marginBottom:48 }}>
          <div className="scrollbar-hide" style={{ display:"flex", alignItems:"center", gap:36, paddingInline:"40%", overflowX:"auto" }}>
            {DEMO_SONG.chords.map((chord,i)=>{
              const diff = i-idx;
              const isActive = diff===0;
              const isPast  = diff<0;
              const isFuture= diff>0;
              const wasCorrect = isPast && Math.random()>0.2;
              return (
                <motion.div key={i}
                  className={`highway-slot${isActive?" active":""}${isPast?" past":""}${isActive||!isPast&&!isFuture?"":" future"}`}
                  animate={{ scale:isActive?1.3:1, opacity:isActive?1:isPast?0.45:Math.max(0.08,1-diff*0.22) }}
                  transition={{ duration:0.3 }}
                  style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}
                >
                  {isActive && (
                    <motion.div style={{ width:6, height:6, borderRadius:"50%", background:"var(--amber)" }}
                      animate={{ scale:[1,1.4,1], opacity:[1,0.5,1] }}
                      transition={{ duration:0.5, repeat:Infinity }}
                    />
                  )}
                  <motion.span style={{ fontFamily:"var(--f-mono)", fontWeight:800,
                    fontSize:isActive?"44px":"28px",
                    color:isActive?"var(--amber)":isPast?(wasCorrect?"var(--green)":"var(--red)"):"rgba(255,255,255,0.15)"
                  }}>
                    {chord}
                  </motion.span>
                  {isActive && (
                    <motion.div style={{ position:"absolute", inset:-8, borderRadius:14, border:"2px solid rgba(245,166,35,0.5)", pointerEvents:"none" }}
                      animate={{ boxShadow:["0 0 0 0 rgba(245,166,35,0.4)","0 0 24px 8px rgba(245,166,35,0.12)","0 0 0 0 rgba(245,166,35,0.4)"] }}
                      transition={{ duration:60/DEMO_SONG.bpm*2, repeat:Infinity }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width:"60%", height:3, background:"rgba(255,255,255,0.06)", borderRadius:2, marginBottom:40 }}>
          <div style={{ width:`${(idx/DEMO_SONG.chords.length)*100}%`, height:"100%", background:"var(--amber)", borderRadius:2, transition:"width 0.3s" }}/>
        </div>
      </div>

      {/* Bottom panel */}
      <div style={{ position:"relative", zIndex:2, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 32px", borderTop:"1px solid rgba(255,255,255,0.05)", flexWrap:"wrap", gap:16 }}>
        {/* Mic waveform */}
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <button onClick={()=>setMicOn(m=>!m)} className={`btn ${micOn?"btn-danger":"btn-surface"} btn-icon`} title={micOn?"Mute mic":"Enable mic"}>
            {micOn ? <MicOff size={18}/> : <Mic size={18}/>}
          </button>
          <MicWave active={playing} status="listening"/>
          <div>
            <p style={{ fontSize:11, color:"var(--t3)" }}>Detecting</p>
            <p style={{ fontFamily:"var(--f-mono)", fontSize:22, fontWeight:700, color:"var(--t1)" }}>{activeChord}</p>
          </div>
        </div>

        {/* Play / pause */}
        <button onClick={()=>setPlaying(p=>!p)} className="btn btn-primary btn-md" style={{ minWidth:120, gap:8 }}>
          {playing ? <><Pause size={16}/> Pause</> : <><Play size={16} fill="currentColor"/> Resume</>}
        </button>

        {/* Score panel */}
        <div style={{ textAlign:"right" }}>
          <div style={{ display:"flex", gap:4, justifyContent:"flex-end", marginBottom:4 }}>
            {[...Array(3)].map((_,i)=>(
              <Star key={i} size={16} style={{ color:accuracy>=(90-i*20)?"var(--amber)":"rgba(255,255,255,0.1)" }} fill={accuracy>=(90-i*20)?"var(--amber)":"rgba(255,255,255,0.1)"}/>
            ))}
          </div>
          <div style={{ display:"flex", gap:14 }}>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontFamily:"var(--f-mono)", fontWeight:800, fontSize:20, color:"var(--green)" }}>{correct}</p>
              <p style={{ fontSize:10, color:"var(--t3)", textTransform:"uppercase" }}>Correct</p>
            </div>
            <div style={{ textAlign:"center" }}>
              <p style={{ fontFamily:"var(--f-mono)", fontWeight:800, fontSize:20, color:"var(--red)" }}>{missed}</p>
              <p style={{ fontSize:10, color:"var(--t3)", textTransform:"uppercase" }}>Missed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
