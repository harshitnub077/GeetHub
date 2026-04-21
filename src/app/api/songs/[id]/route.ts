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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Try DB first
  const db = getDb();
  if (db) {
    try {
      const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(id);
      if (song) return NextResponse.json(song);
    } catch (err) {
      console.error('API /api/songs/[id] DB error:', err);
    }
  }

  // JSON fallback
  const found = loadStaticSongs().find((s: any) => s.id === id);
  if (found) return NextResponse.json(found);

  return NextResponse.json({ error: 'Song not found' }, { status: 404 });
}
