"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { Music, ArrowRight, Search, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import songsData from "@/data/songs.json";

interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  contributor_username?: string;
}

export default function SongsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSongs, setFilteredSongs] = useState<Song[]>(songsData);
  const [searchFocused, setSearchFocused] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(50);

  useEffect(() => {
    const filtered = songsData.filter((song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSongs(filtered);
    setVisibleCount(50); // Reset visible count on search
  }, [searchQuery]);

  useEffect(() => {
    if (listRef.current) {
      gsap.fromTo(listRef.current.children, 
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.04, ease: "power2.out" }
      );
    }
  }, [filteredSongs, visibleCount]);

  const displayedSongs = filteredSongs.slice(0, visibleCount);

  return (
    <div className="min-h-screen pb-20 pt-32">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-[600px] z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-indigo-500/5 to-background"></div>

      <main className="container mx-auto px-4 lg:max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-violet-300 leading-normal pb-1">
            All Songs Library
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Browse our complete collection of chords sourced locally and from contributors globally.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-md mx-auto mb-12 relative group">
          <div className="absolute inset-0 bg-primary/15 blur-2xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <div className={`relative flex items-center bg-card/40 backdrop-blur-md border rounded-2xl px-4 py-2 shadow-2xl transition-all duration-300 ${searchFocused ? 'border-primary/40 shadow-primary/5 ring-4 ring-primary/5' : 'border-white/[0.04]'}`}>
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search in songbook..."
              className="w-full bg-transparent border-none outline-none px-3 py-2.5 text-lg placeholder:text-muted-foreground/30 text-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* Songs List */}
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              {searchQuery.trim() ? `Results for "${searchQuery}"` : 'Everything'}
            </h2>
            <span className="text-xs text-muted-foreground">
              {filteredSongs.length} song{filteredSongs.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div ref={listRef} className="grid gap-3">
            {displayedSongs.length > 0 ? (
              displayedSongs.map((song) => (
                <Link
                  key={song.id}
                  href={`/song/${song.id}`}
                  className="group flex items-center justify-between p-5 rounded-2xl border border-white/[0.03] bg-card/60 backdrop-blur-sm hover:bg-white/[0.02] hover:border-white/[0.08] hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors truncate">
                        <span className="text-foreground/60">{song.artist}</span>
                        <span className="text-muted-foreground/40 mx-2">/</span>
                        {song.title}
                      </h3>
                      {song.contributor_username.includes('bot') && (
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          Imported
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{song.genre}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-xs text-primary/80 hover:text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100">
                      <Sparkles className="h-3 w-3" />
                      Ask AI
                    </button>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-30 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary transition-all duration-300 shrink-0" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-20 text-muted-foreground/40">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-30" />
                No songs match &quot;{searchQuery}&quot;.
              </div>
            )}
          </div>

          {visibleCount < filteredSongs.length && (
            <div className="mt-8 text-center">
              <button 
                onClick={() => setVisibleCount(v => v + 50)}
                className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors font-medium text-sm"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
