import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbSync';
import fs from 'fs';
import path from 'path';

// ── Shared JSON fallback ────────────────────────────────────────
function loadStaticSongs(): any[] {
  try {
    const dataPath = path.join(process.cwd(), 'src/data/songs.json');
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch {
    return [];
  }
}

function jsonResponse(songs: any[], page: number, limit: number, offset: number) {
  const sliced = songs.slice(offset, offset + limit);
  return NextResponse.json({
    songs: sliced,
    pagination: { total: songs.length, page, limit, pages: Math.ceil(songs.length / limit) },
    is_fallback: true,
  });
}

// ── GET /api/songs ──────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q      = searchParams.get('q')?.toLowerCase().trim() || '';
  const artist = searchParams.get('artist')?.trim() || '';
  const genre  = searchParams.get('genre')?.trim() || '';
  const page   = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit  = Math.min(100, parseInt(searchParams.get('limit') || '30'));
  const offset = (page - 1) * limit;

  const db = getDb();

  // ── JSON fallback when DB unavailable ──
  if (!db) {
    const all = loadStaticSongs().filter((s: any) =>
      (!q      || s.title?.toLowerCase().includes(q) || s.artist?.toLowerCase().includes(q)) &&
      (!genre  || s.genre?.toLowerCase().includes(genre.toLowerCase())) &&
      (!artist || s.artist?.toLowerCase().includes(artist.toLowerCase()))
    );
    return jsonResponse(all, page, limit, offset);
  }

  // ── DB path ──
  try {
    let songs: any[] = [];
    let totalCount = 0;

    if (q) {
      const safeQ = q.replace(/["^=:]/g, '');
      const words = safeQ.split(/\s+/).filter(w => w.length > 0);
      const matchQuery = words.map(w => `"${w}"*`).join(' AND ');
      const genreClause  = genre  ? 'AND s.genre LIKE ?'  : '';
      const artistClause = artist ? 'AND s.artist LIKE ?' : '';
      const args: any[] = [matchQuery];
      if (genre)  args.push(`%${genre}%`);
      if (artist) args.push(`%${artist}%`);

      const qCount = db.prepare(`
        SELECT count(*) as count FROM (
          SELECT 1 FROM songs_fts f JOIN songs s ON f.id = s.id
          WHERE f.songs_fts MATCH ? ${genreClause} ${artistClause}
        )
      `).get(...args) as { count: number };
      totalCount = qCount?.count || 0;

      songs = db.prepare(`
        SELECT s.id, s.title, s.artist, s.genre, s.album, s.source
        FROM songs_fts f JOIN songs s ON f.id = s.id
        WHERE f.songs_fts MATCH ? ${genreClause} ${artistClause}
        ORDER BY bm25(songs_fts, 10.0, 5.0, 1.0, 0.5)
        LIMIT ? OFFSET ?
      `).all(...args, limit, offset);

      if (songs.length === 0) {
        const tok = `%${q.split('').join('%')}%`;
        const fbArgs: any[] = [tok, tok];
        if (genre)  fbArgs.push(`%${genre}%`);
        if (artist) fbArgs.push(`%${artist}%`);
        const fbCount = db.prepare(`
          SELECT count(*) as count FROM (
            SELECT 1 FROM songs WHERE (title LIKE ? OR artist LIKE ?) ${genreClause.replace('s.','')} ${artistClause.replace('s.','')}
          )
        `).get(...fbArgs) as { count: number };
        totalCount = fbCount?.count || 0;
        songs = db.prepare(`
          SELECT id, title, artist, genre, album, source FROM songs
          WHERE (title LIKE ? OR artist LIKE ?) ${genreClause.replace('s.','')} ${artistClause.replace('s.','')}
          LIMIT ? OFFSET ?
        `).all(...fbArgs, limit, offset);
      }

    } else if (genre) {
      const ga = `%${genre}%`;
      totalCount = (db.prepare('SELECT count(*) as count FROM songs WHERE genre LIKE ?').get(ga) as any)?.count || 0;
      songs = db.prepare('SELECT id,title,artist,genre,album,source FROM songs WHERE genre LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(ga, limit, offset);
    } else if (artist) {
      const aa = `%${artist}%`;
      totalCount = (db.prepare('SELECT count(*) as count FROM songs WHERE artist LIKE ?').get(aa) as any)?.count || 0;
      songs = db.prepare('SELECT id,title,artist,genre,album,source FROM songs WHERE artist LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(aa, limit, offset);
    } else {
      totalCount = (db.prepare('SELECT count(*) as count FROM songs').get() as any)?.count || 0;
      songs = db.prepare('SELECT id,title,artist,genre,album,source FROM songs ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
    }

    return NextResponse.json({
      songs: songs || [],
      pagination: { total: totalCount, page, limit, pages: Math.ceil(totalCount / limit) },
    });

  } catch (err: any) {
    console.error('GET /api/songs error:', err);
    const all = loadStaticSongs().filter((s: any) =>
      (!q      || s.title?.toLowerCase().includes(q) || s.artist?.toLowerCase().includes(q)) &&
      (!genre  || s.genre?.toLowerCase().includes(genre.toLowerCase())) &&
      (!artist || s.artist?.toLowerCase().includes(artist.toLowerCase()))
    );
    return jsonResponse(all, page, limit, offset);
  }
}

// ── POST /api/songs ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, artist, genre, chord_data } = body;

    if (!title?.trim() || !artist?.trim() || !chord_data?.trim()) {
      return NextResponse.json({ error: 'title, artist and chord_data are required' }, { status: 400 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable in this environment' }, { status: 503 });
    }

    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    db.prepare(`
      INSERT INTO songs (id, title, artist, genre, chord_data, source, contributor_username, created_at)
      VALUES (?, ?, ?, ?, ?, 'community', 'community', datetime('now'))
    `).run(id, title.trim(), artist.trim(), genre?.trim() || 'Other', chord_data.trim());

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/songs error:', err);
    return NextResponse.json({ error: 'Failed to save song', details: err.message }, { status: 500 });
  }
}
