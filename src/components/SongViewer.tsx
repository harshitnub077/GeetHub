"use client";

import { useState } from "react";
import { Mic2, FileAudio, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ChordRenderer } from "./ChordRenderer";
import { UtilityToolbar } from "./UtilityToolbar";

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  contributor_username: string;
  chord_data: string;
}

export function SongViewer({ song }: { song: Song }) {
  const [transposeBy, setTransposeBy] = useState(0);
  const [simplify, setSimplify] = useState(false);

  return (
    <div className="min-h-screen pb-32">
      <div className="container mx-auto px-4 pt-8 lg:max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">{song.title}</h1>
              <div className="flex items-center gap-3 text-xl text-muted-foreground">
                <Mic2 className="h-5 w-5" />
                <span>{song.artist}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-md w-fit font-medium">
                <FileAudio className="h-4 w-4" />
                {song.genre}
              </span>
              <span>Contributed by <strong>@{song.contributor_username}</strong></span>
            </div>
          </div>
        </div>

        <div className="bg-card/50 border border-white/5 rounded-2xl p-6 md:p-8 lg:p-12 shadow-inner">
          <ChordRenderer 
            content={song.chord_data} 
            transposeBy={transposeBy} 
            simplify={simplify} 
          />
        </div>
      </div>

      <UtilityToolbar 
        transposeBy={transposeBy}
        setTransposeBy={setTransposeBy}
        simplify={simplify}
        setSimplify={setSimplify}
      />
    </div>
  );
}
