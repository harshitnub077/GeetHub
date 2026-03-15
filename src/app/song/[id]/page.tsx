import { notFound } from "next/navigation";
import songsData from "@/data/songs.json";
import { SongViewer } from "@/components/SongViewer";

export default async function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const song = songsData.find(s => s.id === id);

  if (!song) {
    notFound();
  }

  return <SongViewer song={song} />;
}

export async function generateStaticParams() {
  return songsData.map((song) => ({
    id: song.id,
  }));
}
