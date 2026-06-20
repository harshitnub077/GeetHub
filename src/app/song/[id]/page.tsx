import { notFound } from "next/navigation";
import { getDb } from "@/lib/dbSync";
import { SongViewer } from "@/components/SongViewer";
import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { generateChordData } from "@/lib/chordEngine";

interface PageParams { params: Promise<{ id: string }> }

function loadStaticSong(id: string): any | null {
  try {
    const songs = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/songs.json'), 'utf8'));
    return songs.find((s: any) => String(s.id) === String(id)) || null;
  } catch { return null; }
}

async function getSong(id: string): Promise<any | null> {
  const db = getDb();
  let song = null;

  if (db) {
    try {
      song = db.prepare("SELECT * FROM songs WHERE id = ?").get(id);
    } catch { /* fall through to JSON */ }
  }
  if (!song) {
    song = loadStaticSong(id);
  }

  // --- Fetch dynamically from LRCLIB if not found locally ---
  if (!song && /^\d+$/.test(id)) {
    try {
      const res = await fetch(`https://lrclib.net/api/get/${id}`, {
        headers: { 'Lrclib-Client': 'Geethub (https://github.com/harshitnub077)' },
        next: { revalidate: 86400 } // Cache 24 hours
      });
      if (res.ok) {
        const data = await res.json();
        if (data.plainLyrics) {
          song = {
            id: data.id.toString(),
            title: data.trackName || data.name,
            artist: data.artistName,
            genre: "Community Chords",
            album: data.albumName,
            source: data.instrumental ? "Instrumental" : "lrclib",
            difficulty: "Intermediate",
            chord_data: generateChordData(data.plainLyrics, data.trackName || data.name),
            contributor_username: "lrclib",
            created_at: new Date().toISOString(),
          };
        }
      }
    } catch (e) {
      console.error("LRCLIB Fetch Error:", e);
    }
  }

  return song;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { id } = await params;
  const song = await getSong(id);
  if (!song) return { title: "Song not found | Geethub" };
  return {
    title: `${song.title} Chords – ${song.artist} | Guitar Tabs | Geethub`,
    description: `Learn ${song.title} by ${song.artist} on guitar. Chord tabs with Play Along mode, auto-scroll, transpose and AI Simplifier. Free at Geethub.`,
    openGraph: {
      title: `${song.title} – ${song.artist} | Guitar Chords`,
      description: `Play along to ${song.title} by ${song.artist}. Free chord tabs on Geethub.`,
      type: "article",
    },
  };
}

export default async function SongPage({ params }: PageParams) {
  const { id } = await params;
  const song = await getSong(id);

  if (!song) notFound();

  const displaySong = {
    ...song,
    id: String(song.id),
    genre: song.genre || "Global Archive",
    contributor_username: song.contributor_username || "community",
    chord_data: song.chord_data || "",
    bpm: song.bpm || 90,
    music_key: song.music_key || "C",
    capo: song.capo || 0,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MusicComposition",
            name: song.title,
            composer: { "@type": "MusicGroup", name: song.artist },
            genre: song.genre || "Music",
            url: `https://geethub.dev/song/${song.id}`,
          }),
        }}
      />
      <SongViewer song={displaySong} />
    </>
  );
}
