import { NextRequest, NextResponse } from 'next/server';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'geethub_master.db');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const db = new DatabaseSync(DB_PATH);
    const stmt = db.prepare('SELECT * FROM songs WHERE id = ?');
    const song = stmt.get(id);

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    return NextResponse.json(song);
  } catch (error: any) {
    console.error('Song API Error:', error);
    return NextResponse.json({ error: 'Database Retrieval Error' }, { status: 500 });
  }
}
