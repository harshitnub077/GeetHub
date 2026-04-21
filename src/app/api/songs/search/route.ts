import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbSync';
import fs from 'fs';
import path from 'path';

function loadStaticSongs(): any[] {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/songs.json'), 'utf8'));
  } catch { return []; }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawQ   = searchParams.get('q')?.toLowerCase().trim() || '';
  const artist = searchParams.get('artist')?.trim() || '';
  const page   = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit  = 50;
  const offset = (page - 1) * limit;

  const db = getDb();

  // ── JSON fallback when DB unavailable ──
  if (!db) {
    const filtered = loadStaticSongs().filter((s: any) =>
      (!rawQ   || s.title?.toLowerCase().includes(rawQ) || s.artist?.toLowerCase().includes(rawQ)) &&
      (!artist || s.artist?.toLowerCase().includes(artist.toLowerCase()))
    );
    return NextResponse.json({
      songs: filtered.slice(offset, offset + limit),
      pagination: { total: filtered.length, page, limit, pages: Math.ceil(filtered.length / limit) },
      is_fallback: true,
    });
  }

  try {
    let songs: any[] = [];
    let totalCount = 0;

    if (artist && rawQ) {
      const safeQ      = rawQ.replace(/["^=:]/g, '');
      const words      = safeQ.split(/\s+/).filter(w => w.length > 0);
      const matchQuery = words.length > 0 ? words.map(w => `"${w}"*`).join(' AND ') : 'a*';
      const artistQ    = `%${artist}%`;

      totalCount = (db.prepare(`
        SELECT count(*) as count FROM (
          SELECT 1 FROM songs_fts f JOIN songs s ON f.id = s.id
          WHERE f.songs_fts MATCH ? AND s.artist LIKE ?
        )
      `).get(matchQuery, artistQ) as any)?.count || 0;

      songs = db.prepare(`
        SELECT s.id, s.title, s.artist, s.genre, s.album, s.source
        FROM songs_fts f JOIN songs s ON f.id = s.id
        WHERE f.songs_fts MATCH ? AND s.artist LIKE ?
        ORDER BY bm25(songs_fts, 10.0, 5.0, 1.0, 0.5)
        LIMIT ? OFFSET ?
      `).all(matchQuery, artistQ, limit, offset);

    } else if (artist) {
      const artistQ = `%${artist}%`;
      totalCount = (db.prepare('SELECT count(*) as count FROM songs WHERE artist LIKE ?').get(artistQ) as any)?.count || 0;
      songs = db.prepare('SELECT id, title, artist, genre, album, source FROM songs WHERE artist LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(artistQ, limit, offset);

    } else if (rawQ) {
      const safeQ      = rawQ.replace(/["^=:]/g, '');
      const words      = safeQ.split(/\s+/).filter(w => w.length > 0);
      const matchQuery = words.length > 0 ? words.map(w => `"${w}"*`).join(' AND ') : 'a*';

      totalCount = (db.prepare(`
        SELECT count(*) as count FROM (
          SELECT 1 FROM songs_fts f JOIN songs s ON f.id = s.id WHERE f.songs_fts MATCH ?
        )
      `).get(matchQuery) as any)?.count || 0;

      songs = db.prepare(`
        SELECT s.id, s.title, s.artist, s.genre, s.album, s.source
        FROM songs_fts f JOIN songs s ON f.id = s.id
        WHERE f.songs_fts MATCH ?
        ORDER BY bm25(songs_fts, 20.0, 5.0, 1.0, 0.5)
        LIMIT ? OFFSET ?
      `).all(matchQuery, limit, offset);

      if (songs.length === 0) {
        const tok = `%${rawQ.split('').join('%')}%`;
        totalCount = (db.prepare('SELECT count(*) as count FROM songs WHERE title LIKE ? OR artist LIKE ?').get(tok, tok) as any)?.count || 0;
        songs = db.prepare('SELECT id, title, artist, genre, album, source FROM songs WHERE title LIKE ? OR artist LIKE ? LIMIT ? OFFSET ?').all(tok, tok, limit, offset);
      }

    } else {
      totalCount = (db.prepare('SELECT count(*) as count FROM songs').get() as any)?.count || 0;
      songs = db.prepare('SELECT id, title, artist, genre, album, source FROM songs ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
    }

    return NextResponse.json({
      songs: songs || [],
      pagination: { total: totalCount, page, limit, pages: Math.ceil(totalCount / limit) },
    });

  } catch (error: any) {
    console.error('Search API Error:', error);
    const filtered = loadStaticSongs().filter((s: any) =>
      (!rawQ   || s.title?.toLowerCase().includes(rawQ) || s.artist?.toLowerCase().includes(rawQ)) &&
      (!artist || s.artist?.toLowerCase().includes(artist.toLowerCase()))
    );
    return NextResponse.json({
      songs: filtered.slice(offset, offset + limit),
      pagination: { total: filtered.length, page, limit, pages: Math.ceil(filtered.length / limit) },
      is_fallback: true,
    });
  }
}
