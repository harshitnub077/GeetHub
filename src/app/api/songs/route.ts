import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbSync';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q      = searchParams.get('q')?.toLowerCase().trim() || '';
  const artist = searchParams.get('artist')?.trim() || '';
  const genre  = searchParams.get('genre')?.trim() || '';
  const page   = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit  = Math.min(100, parseInt(searchParams.get('limit') || '30'));
  const offset = (page - 1) * limit;

  try {
    const db = getDb();
    let songs: any[] = [];
    let totalCount = 0;

    if (q) {
      // Create Advanced FTS5 query: split by words and use prefix matching on each
      const safeQ = q.replace(/["^=:]/g, ''); // strip fts special chars
      const words = safeQ.split(/\s+/).filter(w => w.length > 0);
      
      // Match all words anywhere in the document with prefix wildcard
      const matchQuery = words.map(w => `"${w}"*`).join(" AND ");

      const genreClause = genre ? 'AND s.genre LIKE ?' : '';
      const artistClause = artist ? 'AND s.artist LIKE ?' : '';

      const args: any[] = [matchQuery];
      if (genre)  args.push(`%${genre}%`);
      if (artist) args.push(`%${artist}%`);

      const queryRow = db.prepare(`
        SELECT count(*) as count FROM (
          SELECT 1 FROM songs_fts f JOIN songs s ON f.id = s.id
          WHERE f.songs_fts MATCH ? ${genreClause} ${artistClause}
        )
      `).get(...args) as { count: number };
      totalCount = queryRow?.count || 0;

      songs = db.prepare(`
        SELECT s.id, s.title, s.artist, s.genre, s.album, s.source
        FROM songs_fts f JOIN songs s ON f.id = s.id
        WHERE f.songs_fts MATCH ? ${genreClause} ${artistClause}
        ORDER BY bm25(songs_fts, 10.0, 5.0, 1.0, 0.5)
        LIMIT ? OFFSET ?
      `).all(...args, limit, offset);

      // Fallback to LIKE if FTS fails to find due to typos
      if (songs.length === 0) {
        const likeToken = `%${q.split('').join('%')}%`; // very loose fuzzy
        const fbArgs: any[] = [likeToken, likeToken];
        if (genre)  fbArgs.push(`%${genre}%`);
        if (artist) fbArgs.push(`%${artist}%`);

        const fbCountRow = db.prepare(`
          SELECT count(*) as count FROM (
            SELECT 1 FROM songs 
            WHERE (title LIKE ? OR artist LIKE ?) ${genreClause.replace('s.', '')} ${artistClause.replace('s.', '')}
          )
        `).get(...fbArgs) as { count: number };
        totalCount = fbCountRow?.count || 0;

        songs = db.prepare(`
          SELECT id, title, artist, genre, album, source 
          FROM songs 
          WHERE (title LIKE ? OR artist LIKE ?) ${genreClause.replace('s.', '')} ${artistClause.replace('s.', '')}
          LIMIT ? OFFSET ?
        `).all(...fbArgs, limit, offset);
      }

    } else if (genre) {
      const genreArg = `%${genre}%`;
      const countRow = db.prepare(`SELECT count(*) as count FROM songs WHERE genre LIKE ?`).get(genreArg) as { count: number };
      totalCount = countRow?.count || 0;
      songs = db.prepare(`SELECT id,title,artist,genre,album,source FROM songs WHERE genre LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(genreArg, limit, offset);
    } else if (artist) {
      const artistArg = `%${artist}%`;
      const countRow = db.prepare(`SELECT count(*) as count FROM songs WHERE artist LIKE ?`).get(artistArg) as { count: number };
      totalCount = countRow?.count || 0;
      songs = db.prepare(`SELECT id,title,artist,genre,album,source FROM songs WHERE artist LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(artistArg, limit, offset);
    } else {
      const countRow = db.prepare(`SELECT count(*) as count FROM songs`).get() as { count: number };
      totalCount = countRow?.count || 0;
      songs = db.prepare(`SELECT id,title,artist,genre,album,source FROM songs ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(limit, offset);
    }

    return NextResponse.json({
      songs: songs || [],
      pagination: { total: totalCount, page, limit, pages: Math.ceil(totalCount / limit) },
    });

  } catch (err: any) {
    console.error('GET /api/songs error:', err);
    return NextResponse.json({ error: 'Database error', details: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, artist, genre, chord_data } = body;

    if (!title?.trim() || !artist?.trim() || !chord_data?.trim()) {
      return NextResponse.json({ error: 'title, artist and chord_data are required' }, { status: 400 });
    }

    const db = getDb();
    const cols = db.prepare(`PRAGMA table_info(songs)`).all() as any[];
    const colNames = cols.map((c: any) => c.name);
    const id = `user-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

    if (colNames.includes('source')) {
      db.prepare(`
        INSERT INTO songs (id, title, artist, genre, chord_data, source, contributor_username, created_at)
        VALUES (?, ?, ?, ?, ?, 'community', 'community', datetime('now'))
      `).run(id, title.trim(), artist.trim(), genre?.trim() || 'Other', chord_data.trim());
    } else {
      db.prepare(`
        INSERT INTO songs (id, title, artist, genre, chord_data, contributor_username)
        VALUES (?, ?, ?, ?, ?, 'community')
      `).run(id, title.trim(), artist.trim(), genre?.trim() || 'Other', chord_data.trim());
    }

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/songs error:', err);
    return NextResponse.json({ error: 'Failed to save song', details: err.message }, { status: 500 });
  }
}
