import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbSync';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

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
      .slice(0, 8)
      .map((s: any) => ({ id: s.id || s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), title: s.title, artist: s.artist }));
    return NextResponse.json(
      { suggestions },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  }

  try {
    const suggestions = await db.prepare(`
      SELECT id, title, artist FROM songs
      WHERE title LIKE ? OR artist LIKE ?
      LIMIT 8
    `).all(`${q}%`, `${q}%`);
    return NextResponse.json(
      { suggestions },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    console.error('Suggestions API Error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
