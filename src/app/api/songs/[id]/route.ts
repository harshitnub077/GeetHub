import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbSync';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const song = db.prepare("SELECT * FROM songs WHERE id = ?").get(id);

    if (!song) {
      // Check if it's a seed song that we can serve from JSON
      try {
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(process.cwd(), 'src/data/songs.json');
        if (fs.existsSync(dataPath)) {
          const staticSongs = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
          const found = staticSongs.find((s: any) => s.id === id);
          if (found) return NextResponse.json(found);
        }
      } catch (e) {}

      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    return NextResponse.json(song);
  } catch (error: any) {
    console.error("API /api/songs/[id] GET error:", error);

    // Fallback for Vercel
    try {
      const { id } = await params;
      const fs = require('fs');
      const path = require('path');
      const dataPath = path.join(process.cwd(), 'src/data/songs.json');
      if (fs.existsSync(dataPath)) {
        const staticSongs = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const found = staticSongs.find((s: any) => s.id === id);
        if (found) return NextResponse.json(found);
      }
    } catch (fallbackError) {
      console.error('Fallback Error:', fallbackError);
    }

    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
