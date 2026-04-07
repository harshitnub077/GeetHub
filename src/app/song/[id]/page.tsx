import { notFound } from "next/navigation";
import { DatabaseSync } from "node:sqlite";
import path from "path";
import { SongViewer } from "@/components/SongViewer";
import type { Metadata } from "next";

const DB_PATH = path.join(process.cwd(), "geethub_master.db");

interface PageParams { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = new DatabaseSync(DB_PATH);
    const song: any = db.prepare("SELECT title, artist, genre FROM songs WHERE id = ?").get(id);
    if (!song) return { title: "Song not found | Geethub" };
    return {
      title: `${song.title} Chords – ${song.artist} | Guitar Tabs | Geethub`,
      description: `Learn ${song.title} by ${song.artist} on guitar. Chord tabs with Play Along mode, auto-scroll, transpose and AI Simplifier. Free at Geethub.`,
      openGraph: {
        title: `${song.title} – ${song.artist} | Guitar Chords`,
        description: `Play along to ${song.title} by ${song.artist}. 50,000+ free chord tabs on Geethub.`,
        type: "article",
      },
    };
  } catch {
    return { title: "Song | Geethub" };
  }
}

export default async function SongPage({ params }: PageParams) {
  const { id } = await params;
  
  let song: any = null;
  try {
    const db = new DatabaseSync(DB_PATH);
    song = db.prepare("SELECT * FROM songs WHERE id = ?").get(id);
  } catch (err) {
    console.error("DB error on song page:", err);
    notFound();
  }

  if (!song) notFound();

  const displaySong = {
    ...song,
    id: String(song.id),
    genre: song.genre || "Global Archive",
    contributor_username: song.contributor_username || "community",
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
            url: `https://geethub.music/song/${song.id}`,
          }),
        }}
      />
      <SongViewer song={displaySong} />
    </>
  );
}
