import { NextRequest, NextResponse } from 'next/server';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'geethub_master.db');

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase().trim() || '';

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const db = new DatabaseSync(DB_PATH);
    
    // Quick prefix search for suggestions focusing on Title and Artist
    // Using simple LIKE with prefix for suggestion speed
    const suggestions = db.prepare(`
      SELECT DISTINCT title, artist 
      FROM songs 
      WHERE title LIKE ? OR artist LIKE ?
      LIMIT 6
    `).all(`${q}%`, `${q}%`);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Suggestions API Error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
