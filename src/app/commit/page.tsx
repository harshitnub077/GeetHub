"use client";

import { useState } from "react";
import { Guitar, Send, FileCode2, CheckCircle2, Mic2 } from "lucide-react";
import Link from "next/link";
import { ChordRenderer } from "@/components/ChordRenderer";

export default function CommitPage() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission to MVP
    setTimeout(() => setSubmitted(true), 500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center container mx-auto px-4 text-center">
        <div className="bg-primary/10 text-primary p-6 rounded-full mb-8 animate-bounce">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <h1 className="text-5xl font-bold mb-6 tracking-tight">Pull Request Created</h1>
        <p className="text-muted-foreground max-w-xl mb-12 text-xl leading-relaxed">
          Thanks for contributing to Geethub! Your chords for <span className="text-foreground font-semibold">&quot;{title}&quot;</span> by <span className="text-foreground font-semibold">{artist}</span> have been successfully submitted for review.
        </p>
        <div className="flex gap-4">
          <button onClick={() => { setSubmitted(false); setTitle(''); setArtist(''); setGenre(''); setContent(''); }} className="px-6 py-4 rounded-xl bg-card border border-white/10 hover:bg-white/5 transition-colors font-medium text-lg">
            Commit Another
          </button>
          <Link href="/" className="px-6 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-2 text-lg shadow-lg shadow-primary/20">
            <Guitar className="h-5 w-5" />
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="container mx-auto px-4 pt-16 lg:max-w-7xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <FileCode2 className="h-8 w-8 text-primary" />
            </div>
            Commit Chords
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Contribute to the open-source library. Paste your lyrics and use the <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm text-foreground">[Chord]</code> syntax to perfectly align them.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Form Section */}
          <div className="bg-card/40 border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl">
            <h2 className="text-xl font-semibold mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
              <Guitar className="h-5 w-5 text-primary" />
              Repository Details
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-muted-foreground ml-1">Title</label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Wonderwall"
                    className="bg-background border border-border rounded-xl px-4 py-3.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-muted-foreground ml-1">Artist</label>
                  <input
                    required
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="e.g. Oasis"
                    className="bg-background border border-border rounded-xl px-4 py-3.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">Genre</label>
                <input
                  required
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g. Rock, Indie, Pop"
                  className="bg-background border border-border rounded-xl px-4 py-3.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between ml-1 leading-none">
                  <label className="text-sm font-medium text-muted-foreground">Chord Data</label>
                  <span className="text-xs font-bold tracking-wide text-primary bg-primary/10 px-2 py-1 rounded">GEETHUB FLAVORED CHORDPRO</span>
                </div>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="[G]Today is gonna be the day..."
                  className="bg-background leading-relaxed border border-border rounded-xl px-4 py-4 h-96 font-mono text-base focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all outline-none resize-y"
                />
              </div>

              <button type="submit" className="mt-2 px-6 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-bold flex items-center justify-center gap-2 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0">
                <Send className="h-5 w-5" />
                Submit Pull Request
              </button>
            </form>
          </div>

          {/* Live Preview Section */}
          <div className="bg-card/40 border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-start xl:sticky xl:top-24 h-fit">
            <h2 className="text-xl font-semibold mb-6 border-b border-white/10 pb-4 w-full flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              Live Render
            </h2>
            <div className="w-full bg-background rounded-2xl border border-border p-6 md:p-8 overflow-y-auto min-h-[500px] max-h-[800px] custom-scrollbar shadow-inner">
              {content.trim() || title || artist ? (
                <div className="opacity-100 transition-opacity duration-300">
                  <h3 className="text-3xl font-bold mb-2 tracking-tight">{title || "Untitled Repository"}</h3>
                  <p className="text-muted-foreground mb-10 text-lg flex items-center gap-2">
                    <Mic2 className="h-4 w-4" />
                    {artist || "Unknown Artist"} <span className="opacity-50">•</span> {genre || "Uncategorized"}
                  </p>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <ChordRenderer content={content} transposeBy={0} simplify={false} />
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 gap-6 py-32">
                  <FileCode2 className="h-16 w-16 opacity-30" />
                  <p className="text-lg text-center max-w-xs">Start typing your chords to see the live rendering magic.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
