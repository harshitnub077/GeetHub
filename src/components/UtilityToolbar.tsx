"use client";

import { Minus, Plus, Settings2, Play, Pause, ChevronsUp, ChevronsDown, RotateCcw, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface UtilityToolbarProps {
  transposeBy: number;
  setTransposeBy: (v: number) => void;
  simplify: boolean;
  setSimplify: (v: boolean) => void;
  isFocusMode?: boolean;
}

export function UtilityToolbar({
  transposeBy,
  setTransposeBy,
  simplify,
  setSimplify,
  isFocusMode = false
}: UtilityToolbarProps) {
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
    <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ${isFocusMode ? 'opacity-40 hover:opacity-100 scale-90 hover:scale-100' : 'opacity-100'}`}>
      <div className="flex items-center gap-1.5 p-2 rounded-[2rem] glass-dark border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
        
        {/* Playback Control */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-500 font-medium ${isPlaying ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-primary text-white hover:scale-105 active:scale-95 shadow-xl shadow-primary/20'}`}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
        </button>

        <div className="w-px h-6 bg-white/5 mx-2" />

        {/* Transpose Dock */}
        <div className="flex items-center glass rounded-2xl p-1 border-white/5 pr-4">
          <button
            onClick={() => setTransposeBy(transposeBy - 1)}
            className="h-10 w-10 flex items-center justify-center hover:bg-white/5 rounded-xl text-muted-foreground hover:text-primary transition-all active:scale-90"
          >
            <ChevronsDown size={16} />
          </button>

          <div className="flex flex-col items-center justify-center min-w-[50px]">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary tabular-nums">
              {transposeLabel}
            </span>
          </div>

          <button
            onClick={() => setTransposeBy(transposeBy + 1)}
            className="h-10 w-10 flex items-center justify-center hover:bg-white/5 rounded-xl text-muted-foreground hover:text-primary transition-all active:scale-90"
          >
            <ChevronsUp size={16} />
          </button>
          
          {transposeBy !== 0 && (
            <button 
              onClick={() => setTransposeBy(0)}
              className="ml-2 p-2 hover:bg-white/5 rounded-lg text-muted-foreground/40 hover:text-primary transition-colors"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>

        {/* Speed & Simplify */}
        <div className="flex items-center gap-1.5 ml-1">
          <div className="flex items-center glass rounded-2xl p-1 border-white/5">
             <button onClick={() => setScrollSpeed(Math.max(1, scrollSpeed - 1))} className="h-10 w-8 flex items-center justify-center text-muted-foreground hover:text-white transition-colors text-xs font-bold">−</button>
             <span className="text-[10px] font-bold text-primary px-1 tabular-nums min-w-[12px] text-center">{scrollSpeed}x</span>
             <button onClick={() => setScrollSpeed(Math.min(8, scrollSpeed + 1))} className="h-10 w-8 flex items-center justify-center text-muted-foreground hover:text-white transition-colors text-xs font-bold">+</button>
          </div>

          <button
            onClick={() => setSimplify(!simplify)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 border ${simplify ? 'bg-primary/20 text-primary border-primary/20' : 'bg-white/5 text-muted-foreground/40 border-white/5 hover:text-muted-foreground hover:bg-white/10'}`}
          >
            <Zap size={14} className={simplify ? 'fill-primary' : ''} />
            <span className="hidden md:inline">Turbo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
