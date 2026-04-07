import { NextRequest, NextResponse } from 'next/server';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'geethub_master.db');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);
    const db = new DatabaseSync(DB_PATH);
    
    // Get up to 5 other songs by the same artist
    const songs = db.prepare(`
      SELECT id, title, artist, genre 
      FROM songs 
      WHERE artist = ? 
      LIMIT 6
    `).all(decodedName);

    return NextResponse.json({ songs });
  } catch (error) {
    console.error("API /api/artist/[name]/songs GET error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
