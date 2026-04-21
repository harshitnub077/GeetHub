import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbSync';
import fs from 'fs';
import path from 'path';

function loadStaticSongs(): any[] {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/songs.json'), 'utf8'));
  } catch { return []; }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase().trim() || '';

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const db = getDb();

  if (!db) {
    const suggestions = loadStaticSongs()
      .filter((s: any) =>
        s.title?.toLowerCase().startsWith(q) || s.artist?.toLowerCase().startsWith(q)
      )
      .slice(0, 6)
      .map((s: any) => ({ title: s.title, artist: s.artist }));
    return NextResponse.json({ suggestions });
  }

  try {
    const suggestions = db.prepare(`
      SELECT DISTINCT title, artist FROM songs
      WHERE title LIKE ? OR artist LIKE ?
      LIMIT 6
    `).all(`${q}%`, `${q}%`);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Suggestions API Error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
