"use client";

import { Minus, Plus, Settings2, Play, Pause, ChevronsUp, ChevronsDown } from "lucide-react";
import { useEffect, useState } from "react";

export function UtilityToolbar({
  transposeBy,
  setTransposeBy,
  simplify,
  setSimplify
}: {
  transposeBy: number;
  setTransposeBy: (v: number) => void;
  simplify: boolean;
  setSimplify: (v: boolean) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isPlaying) {
      intervalId = setInterval(() => {
        window.scrollBy({ top: scrollSpeed, behavior: 'auto' });
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
          setIsPlaying(false);
        }
      }, 50);
    }
    return () => clearInterval(intervalId);
  }, [isPlaying, scrollSpeed]);

  const transposeLabel = transposeBy === 0 ? '0' : transposeBy > 0 ? `+${transposeBy}` : `${transposeBy}`;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-max">
      <div className="flex items-center gap-1 p-2 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">

        {/* Transpose Section — most prominent */}
        <div className="flex items-center bg-zinc-800/80 rounded-xl overflow-hidden border border-white/5">
          {/* Transpose Down */}
          <button
            onClick={() => setTransposeBy(transposeBy - 1)}
            className="group flex flex-col items-center justify-center px-3 py-2 hover:bg-primary/10 transition-colors"
            title="Transpose Down (−1 semitone)"
          >
            <ChevronsDown size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[9px] font-bold text-muted-foreground group-hover:text-primary transition-colors tracking-widest uppercase mt-0.5">−1</span>
          </button>

          {/* Transpose Display */}
          <div className="flex flex-col items-center justify-center px-4 py-2 border-x border-white/10 min-w-[56px]">
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Transpose</span>
            <span className={`text-lg font-extrabold leading-tight tabular-nums transition-colors ${transposeBy !== 0 ? 'text-primary' : 'text-foreground'}`}>
              {transposeLabel}
            </span>
          </div>

          {/* Transpose Up */}
          <button
            onClick={() => setTransposeBy(transposeBy + 1)}
            className="group flex flex-col items-center justify-center px-3 py-2 hover:bg-primary/10 transition-colors"
            title="Transpose Up (+1 semitone)"
          >
            <ChevronsUp size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-[9px] font-bold text-muted-foreground group-hover:text-primary transition-colors tracking-widest uppercase mt-0.5">+1</span>
          </button>
        </div>

        {/* Reset */}
        {transposeBy !== 0 && (
          <button
            onClick={() => setTransposeBy(0)}
            className="px-2 py-1 text-[10px] font-semibold text-primary/70 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors uppercase tracking-wider"
            title="Reset Transpose"
          >
            Reset
          </button>
        )}

        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* Simplify toggle */}
        <button
          onClick={() => setSimplify(!simplify)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${simplify ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
          title="Toggle simplified chords (removes extensions like maj7, sus4 etc.)"
        >
          <Settings2 size={15} />
          <span className="hidden sm:inline text-xs uppercase tracking-wider font-bold">{simplify ? 'Simplified' : 'Simplify'}</span>
        </button>

        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* Scroll Speed */}
        <div className="flex items-center gap-1">
          <button onClick={() => setScrollSpeed(Math.max(1, scrollSpeed - 1))} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors text-xs font-bold">−</button>
          <div className="flex flex-col items-center min-w-[32px]">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Speed</span>
            <span className="text-sm font-bold text-foreground">{scrollSpeed}</span>
          </div>
          <button onClick={() => setScrollSpeed(Math.min(8, scrollSpeed + 1))} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors text-xs font-bold">+</button>
        </div>

        {/* Auto Scroll Play/Pause */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`ml-1 w-11 h-11 rounded-xl flex items-center justify-center transition-all font-medium ${isPlaying ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-lg shadow-primary/30'}`}
          title={isPlaying ? "Pause Auto-Scroll" : "Start Auto-Scroll"}
        >
          {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-0.5" />}
        </button>
      </div>
    </div>
  );
}
