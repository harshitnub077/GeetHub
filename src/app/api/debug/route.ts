import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbSync';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const cwd = process.cwd();
  const dbPath = path.join(cwd, 'geethub_master.db');
  const exists = fs.existsSync(dbPath);
  const db = getDb();
  
  let songCount = -1;
  let error = null;
  
  if (db) {
    try {
      const row = (await db.prepare('SELECT count(*) as count FROM songs').get()) as any;
      songCount = row.count;
    } catch (e: any) {
      error = e.message;
    }
  } else {
    error = "Database instance is null";
  }

  return NextResponse.json({
    cwd,
    dbPath,
    exists,
    isTurso: Boolean(db?.isTurso),
    hasTursoUrlEnv: Boolean(process.env.TURSO_DATABASE_URL),
    hasTursoTokenEnv: Boolean(process.env.TURSO_AUTH_TOKEN),
    songCount,
    error,
    nodeVersion: process.version
  });
}
