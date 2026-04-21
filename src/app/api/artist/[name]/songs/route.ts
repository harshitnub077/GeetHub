import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbSync';
import fs from 'fs';
import path from 'path';

function loadStaticSongs(): any[] {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/songs.json'), 'utf8'));
  } catch { return []; }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  const db = getDb();

  if (!db) {
    const songs = loadStaticSongs()
      .filter((s: any) => s.artist?.toLowerCase() === decodedName.toLowerCase())
      .slice(0, 6);
    return NextResponse.json({ songs });
  }

  try {
    const songs = db.prepare(
      'SELECT id, title, artist, genre FROM songs WHERE artist = ? LIMIT 6'
    ).all(decodedName);
    return NextResponse.json({ songs });
  } catch (error) {
    console.error('API /api/artist/[name]/songs GET error:', error);
    const songs = loadStaticSongs()
      .filter((s: any) => s.artist?.toLowerCase() === decodedName.toLowerCase())
      .slice(0, 6);
    return NextResponse.json({ songs });
  }
}
