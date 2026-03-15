"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { Search, Music, ArrowRight, Globe, Loader2 } from "lucide-react";
import Link from "next/link";
import songsData from "@/data/songs.json";

interface LiveSong {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  instrumental: boolean;
  source: 'live';
}

interface CuratedSong {
  id: string;
  title: string;
  artist: string;
  genre: string;
  contributor_username: string;
  chord_data: string;
  source: 'curated';
}

type DisplaySong = {
  key: string;
  title: string;
  artist: string;
  subtitle: string;
  href: string;
  verified: boolean;
};

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [liveResults, setLiveResults] = useState<LiveSong[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const curatedFiltered: CuratedSong[] = songsData
    .filter((song) => searchQuery.trim() === '' || (
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    ))
    .map(s => ({ ...s, source: 'curated' as const }));

  const searchLive = useCallback(async (q: string) => {
    if (!q.trim()) { setLiveResults([]); return; }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setLiveResults((data as LiveSong[]).filter((s: LiveSong) => !s.instrumental).slice(0, 10).map(s => ({ ...s, source: 'live' as const })));
    } catch {
      setLiveResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLive(searchQuery), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, searchLive]);

  // Merge into one unified list
  const allSongs: DisplaySong[] = [];

  if (searchQuery.trim() === '') {
    // Show curated songs on empty state
    curatedFiltered.forEach(s => allSongs.push({
      key: s.id,
      title: s.title,
      artist: s.artist,
      subtitle: s.genre,
      href: `/song/${s.id}`,
      verified: true,
    }));
  } else {
    // Show curated matches first, then live
    curatedFiltered.forEach(s => allSongs.push({
      key: s.id,
      title: s.title,
      artist: s.artist,
      subtitle: s.genre,
      href: `/song/${s.id}`,
      verified: true,
    }));
    liveResults.forEach(s => {
      // Avoid duplicates with curated
      const alreadyIn = curatedFiltered.some(c => c.title.toLowerCase() === s.trackName.toLowerCase() && c.artist.toLowerCase() === s.artistName.toLowerCase());
      if (!alreadyIn) {
        allSongs.push({
          key: `live-${s.id}`,
          title: s.trackName,
          artist: s.artistName,
          subtitle: s.albumName,
          href: `/live-song/${s.id}`,
          verified: false,
        });
      }
    });
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(badgeRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
        .fromTo(headlineRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2 }, "-=0.8")
        .fromTo(searchRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=0.8")
        .fromTo(statsRef.current?.children || [], { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, "-=0.8")
        .fromTo(listRef.current?.children || [], { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.04 }, "-=0.4");
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen pb-20">
      <div className="fixed top-0 left-0 w-full h-[500px] z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>

      <main className="container mx-auto px-4 pt-32 lg:max-w-5xl" ref={heroRef}>
        <div className="mx-auto max-w-3xl text-center flex flex-col items-center">
          <div ref={badgeRef} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-8 opacity-0">
            <Globe className="h-4 w-4" />
            <span>5M+ songs from the global library</span>
          </div>

          <h1 ref={headlineRef} className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 text-foreground/90 leading-[1.1] opacity-0">
            The open-source home for your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">
              favorite chords.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            Search any song globally. Transpose, simplify, and auto-scroll — all in one place.
          </p>

          {/* Live Search Bar */}
          <div ref={searchRef} className="w-full max-w-2xl relative group opacity-0">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className={`relative flex items-center bg-card/80 backdrop-blur-sm border rounded-2xl p-2 shadow-2xl transition-colors ${searchFocused ? 'border-primary/60 shadow-primary/10' : 'border-white/10'}`}>
              {isSearching
                ? <Loader2 className="h-6 w-6 text-primary ml-3 animate-spin shrink-0" />
                : <Search className="h-6 w-6 text-muted-foreground ml-3 shrink-0" />}
              <input
                type="text"
                placeholder="Search any song, artist, or album..."
                className="w-full bg-transparent border-none outline-none px-4 py-4 text-xl placeholder:text-muted-foreground/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>

          <div ref={statsRef} className="flex gap-12 mt-14 text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-1 opacity-0">
              <span className="text-3xl font-bold text-foreground">5M+</span>
              <span>Global Songs</span>
            </div>
            <div className="w-px h-12 bg-white/10 opacity-0"></div>
            <div className="flex flex-col items-center gap-1 opacity-0">
              <span className="text-3xl font-bold text-foreground">Live</span>
              <span>Search</span>
            </div>
            <div className="w-px h-12 bg-white/10 opacity-0"></div>
            <div className="flex flex-col items-center gap-1 opacity-0">
              <span className="text-3xl font-bold text-foreground">Free</span>
              <span>Always</span>
            </div>
          </div>
        </div>

        {/* Unified Song List */}
        <div className="mx-auto max-w-3xl mt-20">
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              {searchQuery.trim() ? `Results for "${searchQuery}"` : 'Popular Songs'}
            </h2>
            {allSongs.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {allSongs.length} song{allSongs.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div ref={listRef} className="grid gap-3">
            {isSearching && liveResults.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground/40 gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                Searching global library...
              </div>
            ) : allSongs.length > 0 ? (
              allSongs.map((song) => (
                <Link
                  key={song.key}
                  href={song.href}
                  className="group flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-card hover:bg-white/[0.03] hover:border-primary/30 transition-all cursor-pointer"
                >
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors truncate">
                        <span className="text-foreground/60">{song.artist}</span>
                        <span className="text-muted-foreground/40 mx-2">/</span>
                        {song.title}
                      </h3>
                      {song.verified && (
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{song.subtitle}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary transition-all duration-300 shrink-0 ml-4" />
                </Link>
              ))
            ) : searchQuery.trim() ? (
              <div className="text-center py-20 text-muted-foreground/40">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-30" />
                No songs found for &quot;{searchQuery}&quot;.
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
