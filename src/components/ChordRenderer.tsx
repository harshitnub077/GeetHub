"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Transposition ─── */
const NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const FLAT_MAP: Record<string,string> = { Db:"C#",Eb:"D#",Gb:"F#",Ab:"G#",Bb:"A#" };

function transposeNote(note:string, steps:number):string {
  let idx = NOTES.indexOf(note);
  if(idx===-1) idx = NOTES.indexOf(FLAT_MAP[note]??note);
  if(idx===-1) return note;
  return NOTES[(idx+steps+120)%12];
}

function transposeChord(chord:string, steps:number):string {
  if(steps===0) return chord;
  return chord.replace(/^[A-G](b|#)?/, m=>transposeNote(m, steps));
}

/* ─── Simplification map ─── */
const SIMPLE_MAP: Record<string,string> = {
  Amaj7:"A",Dmaj7:"D",Gmaj7:"G",Cmaj7:"C",Emaj7:"E",Fmaj7:"F",Bmaj7:"B",
  Am7:"Am",Dm7:"Dm",Em7:"Em",Bm7:"Bm",
  G7:"G",C7:"C",A7:"A",D7:"D",E7:"E",B7:"B",F7:"F",
  Gsus2:"G",Csus2:"C",Dsus2:"D",Gsus4:"G",Csus4:"C",Asus4:"A",
  Gadd9:"G",Cadd9:"C",Dadd9:"D",Fadd9:"F",
};
function simplifyChord(c:string):string {
  if(SIMPLE_MAP[c]) return SIMPLE_MAP[c];
  return c.replace(/maj7|m7|7|sus[24]|add9|dim|aug|\/.+$/g,"").trim() || c;
}

/* ─── Chord diagrams (SVG) ─── */
const DIAGRAMS: Record<string,{ frets:number[]; fingers:number[]; barres?:{from:number;to:number;fret:number}[] }> = {
  Am:   { frets:[-1,0,2,2,1,0], fingers:[0,0,2,3,1,0] },
  A:    { frets:[-1,0,2,2,2,0], fingers:[0,0,1,2,3,0] },
  Am7:  { frets:[-1,0,2,0,1,0], fingers:[0,0,2,0,1,0] },
  C:    { frets:[-1,3,2,0,1,0], fingers:[0,3,2,0,1,0] },
  Cmaj7:{ frets:[-1,3,2,0,0,0], fingers:[0,3,2,0,0,0] },
  D:    { frets:[-1,-1,0,2,3,2],fingers:[0,0,0,1,3,2] },
  Dm:   { frets:[-1,-1,0,2,3,1],fingers:[0,0,0,2,3,1] },
  E:    { frets:[0,2,2,1,0,0],  fingers:[0,2,3,1,0,0] },
  Em:   { frets:[0,2,2,0,0,0],  fingers:[0,2,3,0,0,0] },
  Em7:  { frets:[0,2,0,0,0,0],  fingers:[0,2,0,0,0,0] },
  F:    { frets:[1,1,2,3,3,1],  fingers:[1,1,2,3,4,1] },
  G:    { frets:[3,2,0,0,0,3],  fingers:[2,1,0,0,0,3] },
  Bm:   { frets:[-1,2,4,4,3,2],fingers:[0,1,3,4,2,1] },
  "F#m":{ frets:[2,2,4,4,4,2], fingers:[1,1,2,3,4,1] },
  "C#m":{ frets:[4,4,6,6,5,4], fingers:[1,1,2,3,4,1] },
};

export function ChordDiagram({ chord }:{ chord:string }) {
  const d = DIAGRAMS[chord];

  if(!d) return (
    <div style={{ padding:16, textAlign:"center" }}>
      <p style={{ fontFamily:"var(--f-mono)", fontSize:24, fontWeight:700, color:"var(--amber)", marginBottom:8 }}>{chord}</p>
      <p style={{ fontSize:12, color:"var(--t3)" }}>Diagram coming soon</p>
    </div>
  );

  const { frets, fingers } = d;
  const validFrets = frets.filter(f=>f>0);
  const minF = Math.max(1, Math.min(...validFrets));
  const maxF = Math.max(...validFrets);
  const range = Math.max(4, maxF-minF+1);
  const sx=24, sy=26, px=24, py=44, W=(5*sx)+px*2, H=(range*sy)+py*2;

  return (
    <div style={{ padding:16, textAlign:"center" }}>
      <p style={{ fontFamily:"var(--f-mono)", fontSize:22, fontWeight:700, color:"var(--amber)", marginBottom:6 }}>{chord}</p>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* Nut */}
        {minF===1 && <line x1={px} y1={py-3} x2={px+5*sx} y2={py-3} stroke="var(--t1)" strokeWidth="3" strokeLinecap="round"/>}
        {minF>1 && <text x={px-4} y={py+sy/2} textAnchor="end" fill="var(--t3)" fontSize="11" fontFamily="var(--f-mono)">{minF}fr</text>}
        {/* Fret lines */}
        {Array.from({length:range+1}).map((_,fi)=>(
          <line key={fi} x1={px} y1={py+fi*sy} x2={px+5*sx} y2={py+fi*sy} stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        ))}
        {/* String lines */}
        {[0,1,2,3,4,5].map(si=>(
          <line key={si} x1={px+si*sx} y1={py} x2={px+si*sx} y2={py+range*sy} stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
        ))}
        {/* Open / muted indicators */}
        {frets.map((fret,si)=>{
          const x=px+si*sx;
          if(fret===-1) return <text key={si} x={x} y={py-10} textAnchor="middle" fill="var(--red)" fontSize="14" fontWeight="700">×</text>;
          if(fret===0)  return <circle key={si} cx={x} cy={py-14} r={5} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>;
          return null;
        })}
        {/* Finger dots */}
        {frets.map((fret,si)=>{
          if(fret<=0) return null;
          const x=px+si*sx, y=py+(fret-minF)*sy+sy/2;
          return (
            <g key={si}>
              <circle cx={x} cy={y} r={10} fill="var(--amber)"/>
              {fingers[si]>0 && <text x={x} y={y+4} textAnchor="middle" fill="var(--obsidian)" fontSize="11" fontWeight="800">{fingers[si]}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Main component ─── */
interface Props { content:string; transposeBy:number; simplify:boolean; fontSize:number; }

export function ChordRenderer({ content, transposeBy, simplify, fontSize }:Props) {
  const [hovered, setHovered] = useState<{chord:string;x:number;y:number}|null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lines = content.split("\n");

  const process = (raw:string) => {
    let c = transposeChord(raw, transposeBy);
    if(simplify) c = simplifyChord(c);
    return c;
  };

  const onChordClick = (chord:string, e:React.MouseEvent) => {
    const r=(e.target as HTMLElement).getBoundingClientRect();
    const cr=containerRef.current?.getBoundingClientRect();
    if(!cr) return;
    setHovered({ chord, x:r.left-cr.left+r.width/2, y:r.top-cr.top });
  };

  return (
    <div ref={containerRef} style={{ position:"relative", width:"100%" }}>
      {/* Chord popover */}
      <AnimatePresence>
        {hovered && (
          <>
            <div style={{ position:"fixed", inset:0, zIndex:40 }} onClick={()=>setHovered(null)}/>
            <motion.div
              initial={{ opacity:0, scale:0.85, y:8 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.85 }}
              transition={{ duration:0.18, ease:[0.16,1,0.3,1] }}
              style={{
                position:"absolute",
                left:Math.max(0, hovered.x-90),
                top:hovered.y-240,
                width:180, zIndex:50,
                background:"var(--elevated)",
                border:"1px solid rgba(245,166,35,0.25)",
                borderRadius:14,
                boxShadow:"0 24px 60px rgba(0,0,0,0.7)",
              }}
              onClick={e=>e.stopPropagation()}
            >
              <ChordDiagram chord={hovered.chord}/>
              <div style={{ borderTop:"1px solid var(--border)", padding:"8px 12px", textAlign:"center" }}>
                <span style={{ fontSize:11, color:"var(--t3)", cursor:"pointer" }} onClick={()=>setHovered(null)}>tap to close</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sheet */}
      <div style={{ 
        fontFamily:"var(--f-body)", 
        fontSize:`${fontSize}px`, 
        lineHeight: 1.5, 
        letterSpacing: "-0.01em",
        paddingBottom:60, 
        overflowX:"auto" 
      }}>
        {lines.map((line,li)=>{
          const trimmed=line.trim();

          /* Section headers like [Chorus] [Verse 1] */
          const sectionMatch = trimmed.match(/^\[([A-Za-z][^[\]]*)\]$/) || trimmed.match(/^---(.*)---$/);
          const isSectionHeader = sectionMatch && !/^[A-G][#b]?/.test(sectionMatch[1]?.trim());
          if(isSectionHeader) {
            const label = (sectionMatch![1]||"").trim();
            return (
              <div key={li} style={{ marginTop:8, marginBottom:4 }}>
                <span className="badge badge-amber" style={{ borderRadius:4, fontSize:9, fontWeight:900, letterSpacing:"0.07em" }}>{label}</span>
              </div>
            );
          }

          /* Parse chord/lyric segments */
          const parts = line.split(/(\[[^\]]+\])/g).filter(p => p !== "");
          const segs: { chord:string; text:string }[] = [];
          let cur = "";
          parts.forEach(p=>{
            if(p.startsWith("[")&&p.endsWith("]")){ cur=p.slice(1,-1); }
            else { segs.push({ chord:cur, text:p }); cur=""; }
          });
          if(cur) segs.push({ chord:cur, text:"  " }); // ensure trailing chords have space

          if(!segs.length && !trimmed) return <div key={li} style={{ height:"0.6em" }}/>;

          const hasChords = segs.some(s=>s.chord && /^[A-G]/.test(s.chord));
          const lineClass = hasChords ? "chord-line" : "lyric-line";

          return (
            <motion.div key={li} className={lineClass}
              initial={{ opacity:0 }} animate={{ opacity:1 }}
              transition={{ duration:0.2, delay:Math.min(li*0.005, 0.4) }}
              style={{ 
                minHeight: hasChords ? "2.2em" : "1.1em", 
                display:"flex", 
                flexWrap:"nowrap",
                opacity: 0.95
              }}
            >
              {segs.map((seg,si)=>{
                const isValidChord = seg.chord && /^[A-G]/.test(seg.chord);
                const processed = isValidChord ? process(seg.chord) : seg.chord;
                const textVal = seg.text || (isValidChord ? "\u00A0\u00A0" : "");
                
                return (
                  <div key={si} className="chord-seg" style={{ fontSize:`${fontSize}px` }}>
                    {processed && isValidChord && (
                      <motion.span
                        className="chord-tag chord-above"
                        style={{ fontSize:`${Math.round(fontSize*0.82)}px` }}
                        onClick={e=>onChordClick(processed,e)}
                        whileHover={{ scale:1.05 }}
                        whileTap={{ scale:0.95 }}
                      >
                        {processed}
                      </motion.span>
                    )}
                    <span className="lyric-text" style={{ fontWeight: 500 }}>{textVal}</span>
                  </div>
                );
              })}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
// Updated lyrics visibility for live performance
