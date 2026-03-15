"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Mic2, FileAudio, Globe, AlertCircle, ArrowLeft, GitFork } from "lucide-react";
import Link from "next/link";
import { ChordRenderer } from "@/components/ChordRenderer";
import { UtilityToolbar } from "@/components/UtilityToolbar";
import { generateChordData } from "@/lib/chordEngine";

interface LiveTrack {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  plainLyrics: string;
  instrumental: boolean;
}

export default function LiveSongPage({ params }: { params: Promise<{ id: string }> }) {
  const [song, setSong] = useState<LiveTrack | null>(null);
  const [chordData, setChordData] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transposeBy, setTransposeBy] = useState(0);
  const [simplify, setSimplify] = useState(false);

  const fetchSong = useCallback(async () => {
    setLoading(true);
    try {
      const { id } = await params;
      const res = await fetch(`/api/song/${id}`);
      if (!res.ok) throw new Error("Song not found");
      const data: LiveTrack = await res.json();
      setSong(data);
      // Generate chord overlay using the chord engine
      setChordData(generateChordData(data.plainLyrics, data.trackName));
    } catch {
      setError("Could not load this track. It may have been removed or doesn't exist.");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { fetchSong(); }, [fetchSong]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg">Fetching from global library...</p>
        </div>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-xl text-foreground font-semibold">Track Not Found</p>
          <p className="text-muted-foreground">{error}</p>
          <Link href="/" className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium">Back to Explore</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="container mx-auto px-4 pt-8 lg:max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Explore
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">{song.trackName}</h1>
              <div className="flex items-center gap-3 text-xl text-muted-foreground">
                <Mic2 className="h-5 w-5" />
                <span>{song.artistName}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-md w-fit font-medium">
                <Globe className="h-4 w-4" />
                Global Library
              </span>
              <span>{song.albumName}</span>
            </div>
          </div>

          {/* Community Chords banner */}
          <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-amber-400">Auto-Generated Chords</p>
              <p className="text-xs text-muted-foreground">
                These chords are algorithmically generated as a starting guide. Know the real chords?{' '}
                <Link href="/commit" className="text-primary underline">Commit them here!</Link>
              </p>
            </div>
            <Link href="/commit" className="ml-auto shrink-0 flex items-center gap-1.5 text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors font-medium">
              <GitFork className="h-3.5 w-3.5" />
              Contribute
            </Link>
          </div>
        </div>

        <div className="bg-card/50 border border-white/5 rounded-2xl p-6 md:p-8 lg:p-12 shadow-inner">
          <ChordRenderer content={chordData} transposeBy={transposeBy} simplify={simplify} />
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
