"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Music } from "lucide-react";
import songsData from "@/data/songs.json";
import { ChordRenderer } from "@/components/ChordRenderer";
import Link from "next/link";

export default function SongsPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allIds = songsData.reduce((acc, song) => {
      acc[song.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpanded(allIds);
  };

  const collapseAll = () => {
    setExpanded({});
  };

  return (
    <div className="min-h-screen pb-32">
      <div className="fixed top-0 left-0 w-full h-[500px] z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>

      <main className="container mx-auto px-4 pt-24 lg:max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/20 text-primary border border-primary/30">
                <BookOpen className="h-6 w-6" />
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Geethub Songbook</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-xl">
              The complete collection of verified, curated chords. View them all inline or expand individually.
            </p>
          </div>
          <div className="flex gap-3 text-sm font-medium">
            <button
              onClick={collapseAll}
              className="px-4 py-2 rounded-lg bg-card border border-white/10 hover:bg-white/5 transition-colors"
            >
              Collapse All
            </button>
            <button
              onClick={expandAll}
              className="px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors"
            >
              Expand All
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {songsData.map((song) => {
            const isExpanded = !!expanded[song.id];
            
            return (
              <div 
                key={song.id} 
                className={`flex flex-col rounded-2xl border transition-colors ${
                  isExpanded ? 'bg-card/40 border-primary/20 shadow-[0_0_30px_-10px_var(--tw-shadow-color)] shadow-primary/10' : 'bg-card/20 border-white/5 hover:border-white/10'
                }`}
              >
                {/* Header that toggles expansion */}
                <button 
                  onClick={() => toggleExpand(song.id)}
                  className="flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 text-muted-foreground shrink-0">
                      <Music className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        {song.title}
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                          ✓ Verified
                        </span>
                      </h2>
                      <p className="text-muted-foreground">{song.artist} • {song.genre}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-sm font-medium hidden sm:inline-block">
                      {isExpanded ? 'Hide Chords' : 'View Chords'}
                    </span>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 transition-transform">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </button>

                {/* Expandable Chords Area */}
                {isExpanded && (
                  <div className="px-6 pb-8 border-t border-white/5 pt-6 bg-black/20 rounded-b-2xl">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Original Key shown. To transpose, open the full song page.</p>
                      <Link href={`/song/${song.id}`} className="text-sm font-medium text-primary hover:underline">
                        Open Full Page ➔
                      </Link>
                    </div>
                    <div className="p-4 md:p-6 bg-card/50 border border-white/10 rounded-xl max-h-[500px] overflow-y-auto custom-scrollbar">
                      <ChordRenderer content={song.chord_data} transposeBy={0} simplify={false} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
