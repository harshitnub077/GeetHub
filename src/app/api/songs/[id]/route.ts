import { NextRequest, NextResponse } from 'next/server';
import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'geethub_master.db');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = new DatabaseSync(DB_PATH);
    const song = db.prepare("SELECT * FROM songs WHERE id = ?").get(id);

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    return NextResponse.json(song);
  } catch (error) {
    console.error("API /api/songs/[id] GET error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
