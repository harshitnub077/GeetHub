import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbSync';
import fs from 'fs';
import path from 'path';
import { generateChordData } from '@/lib/chordEngine';

export const dynamic = 'force-dynamic';

function loadStaticSongs(): any[] {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/songs.json'), 'utf8'));
  } catch { return []; }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawQ   = searchParams.get('q')?.toLowerCase().trim() || '';
  const artist = searchParams.get('artist')?.trim() || '';
  const genre  = searchParams.get('genre')?.trim() || '';
  const level  = searchParams.get('level')?.trim() || '';
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

    if (genre && rawQ) {
      const safeQ      = rawQ.replace(/["^=:]/g, '');
      const words      = safeQ.split(/\s+/).filter(w => w.length > 0);
      const matchQuery = words.length > 0 ? words.map(w => `"${w}"*`).join(' AND ') : 'a*';
      const genreQ    = `%${genre}%`;
      const levelQ    = level ? level : '%';

      totalCount = ((await db.prepare(`
        SELECT count(*) as count FROM (
          SELECT 1 FROM songs_fts f JOIN songs s ON f.id = s.id
          WHERE f.songs_fts MATCH ? AND s.genre LIKE ? AND s.difficulty LIKE ?
        )
      `).get(matchQuery, genreQ, levelQ)) as any)?.count || 0;

      songs = await db.prepare(`
        SELECT s.id, s.title, s.artist, s.genre, s.album, s.source, s.difficulty, s.chord_data
        FROM songs_fts f JOIN songs s ON f.id = s.id
        WHERE f.songs_fts MATCH ? AND s.genre LIKE ? AND s.difficulty LIKE ?
        ORDER BY bm25(songs_fts, 10.0, 5.0, 1.0, 0.5)
        LIMIT ? OFFSET ?
      `).all(matchQuery, genreQ, levelQ, limit, offset);

    } else if (genre) {
      const genreQ = `%${genre}%`;
      const levelQ = level ? level : '%';
      totalCount = ((await db.prepare('SELECT count(*) as count FROM songs WHERE genre LIKE ? AND difficulty LIKE ?').get(genreQ, levelQ)) as any)?.count || 0;
      songs = await db.prepare('SELECT id, title, artist, genre, album, source, difficulty, chord_data FROM songs WHERE genre LIKE ? AND difficulty LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(genreQ, levelQ, limit, offset);

    } else if (artist && rawQ) {
      const safeQ      = rawQ.replace(/["^=:]/g, '');
      const words      = safeQ.split(/\s+/).filter(w => w.length > 0);
      const matchQuery = words.length > 0 ? words.map(w => `"${w}"*`).join(' AND ') : 'a*';
      const artistQ    = `%${artist}%`;
      const levelQ     = level ? level : '%';

      totalCount = ((await db.prepare(`
        SELECT count(*) as count FROM (
          SELECT 1 FROM songs_fts f JOIN songs s ON f.id = s.id
          WHERE f.songs_fts MATCH ? AND s.artist LIKE ? AND s.difficulty LIKE ?
        )
      `).get(matchQuery, artistQ, levelQ)) as any)?.count || 0;

      songs = await db.prepare(`
        SELECT s.id, s.title, s.artist, s.genre, s.album, s.source, s.difficulty, s.chord_data
        FROM songs_fts f JOIN songs s ON f.id = s.id
        WHERE f.songs_fts MATCH ? AND s.artist LIKE ? AND s.difficulty LIKE ?
        ORDER BY bm25(songs_fts, 10.0, 5.0, 1.0, 0.5)
        LIMIT ? OFFSET ?
      `).all(matchQuery, artistQ, levelQ, limit, offset);

    } else if (artist) {
      const artistQ = `%${artist}%`;
      const levelQ  = level ? level : '%';
      totalCount = ((await db.prepare('SELECT count(*) as count FROM songs WHERE artist LIKE ? AND difficulty LIKE ?').get(artistQ, levelQ)) as any)?.count || 0;
      songs = await db.prepare('SELECT id, title, artist, genre, album, source, difficulty, chord_data FROM songs WHERE artist LIKE ? AND difficulty LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(artistQ, levelQ, limit, offset);

    } else if (rawQ) {
      const safeQ      = rawQ.replace(/["^=:]/g, '');
      const words      = safeQ.split(/\s+/).filter(w => w.length > 0);
      const matchQuery = words.length > 0 ? words.map(w => `"${w}"*`).join(' AND ') : 'a*';
      const levelQ     = level ? level : '%';

      totalCount = ((await db.prepare(`
        SELECT count(*) as count FROM (
          SELECT 1 FROM songs_fts f JOIN songs s ON f.id = s.id WHERE f.songs_fts MATCH ? AND s.difficulty LIKE ?
        )
      `).get(matchQuery, levelQ)) as any)?.count || 0;

      songs = await db.prepare(`
        SELECT s.id, s.title, s.artist, s.genre, s.album, s.source, s.difficulty, s.chord_data
        FROM songs_fts f JOIN songs s ON f.id = s.id
        WHERE f.songs_fts MATCH ? AND s.difficulty LIKE ?
        ORDER BY bm25(songs_fts, 20.0, 5.0, 1.0, 0.5)
        LIMIT ? OFFSET ?
      `).all(matchQuery, levelQ, limit, offset);

      if (songs.length === 0) {
        const tok = `%${rawQ.split('').join('%')}%`;
        totalCount = ((await db.prepare('SELECT count(*) as count FROM songs WHERE (title LIKE ? OR artist LIKE ?) AND difficulty LIKE ?').get(tok, tok, levelQ)) as any)?.count || 0;
        songs = await db.prepare('SELECT id, title, artist, genre, album, source, difficulty, chord_data FROM songs WHERE (title LIKE ? OR artist LIKE ?) AND difficulty LIKE ? LIMIT ? OFFSET ?').all(tok, tok, levelQ, limit, offset);
      }

    } else {
      const levelQ = level ? level : '%';
      totalCount = ((await db.prepare('SELECT count(*) as count FROM songs WHERE difficulty LIKE ?').get(levelQ)) as any)?.count || 0;
      songs = await db.prepare('SELECT id, title, artist, genre, album, source, difficulty, chord_data FROM songs WHERE difficulty LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(levelQ, limit, offset);
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
