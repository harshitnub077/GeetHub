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

function buildFtsMatchQuery(rawQuery: string): string {
  // Strip FTS5 operators, syntax symbols, and sanitize unicode
  const clean = rawQuery.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();
  const words = clean.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 'a*';
  return words.map(w => `"${w}"*`).join(' AND ');
}

interface SearchCacheEntry {
  data: any;
  timestamp: number;
}
const SEARCH_CACHE = new Map<string, SearchCacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5-minute cache
const MAX_CACHE_ENTRIES = 150;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawQ   = searchParams.get('q')?.toLowerCase().trim() || '';
  const artist = searchParams.get('artist')?.trim() || '';
  const genre  = searchParams.get('genre')?.trim() || '';
  const level  = searchParams.get('level')?.trim() || '';
  const page   = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25')));
  const offset = (page - 1) * limit;

  const cacheKey = `${rawQ}|${artist}|${genre}|${level}|${page}|${limit}`;
  const cached = SEARCH_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data, {
      headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' },
    });
  }

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
      const matchQuery = buildFtsMatchQuery(rawQ);
      const genreQ    = `%${genre}%`;

      if (level) {
        totalCount = ((await db.prepare(`
          SELECT count(*) as count FROM (
            SELECT 1 FROM songs_fts f JOIN songs s ON f.id = s.id
            WHERE f.songs_fts MATCH ? AND s.genre LIKE ? AND s.difficulty = ?
          )
        `).get(matchQuery, genreQ, level)) as any)?.count || 0;

        songs = await db.prepare(`
          SELECT s.id, s.title, s.artist, s.genre, s.album, s.source, s.difficulty, s.chord_data
          FROM songs_fts f JOIN songs s ON f.id = s.id
          WHERE f.songs_fts MATCH ? AND s.genre LIKE ? AND s.difficulty = ?
          ORDER BY bm25(songs_fts, 10.0, 5.0, 1.0, 0.5)
          LIMIT ? OFFSET ?
        `).all(matchQuery, genreQ, level, limit, offset);
      } else {
        totalCount = ((await db.prepare(`
          SELECT count(*) as count FROM (
            SELECT 1 FROM songs_fts f JOIN songs s ON f.id = s.id
            WHERE f.songs_fts MATCH ? AND s.genre LIKE ?
          )
        `).get(matchQuery, genreQ)) as any)?.count || 0;

        songs = await db.prepare(`
          SELECT s.id, s.title, s.artist, s.genre, s.album, s.source, s.difficulty, s.chord_data
          FROM songs_fts f JOIN songs s ON f.id = s.id
          WHERE f.songs_fts MATCH ? AND s.genre LIKE ?
          ORDER BY bm25(songs_fts, 10.0, 5.0, 1.0, 0.5)
          LIMIT ? OFFSET ?
        `).all(matchQuery, genreQ, limit, offset);
      }

    } else if (genre) {
      if (level) {
        totalCount = ((await db.prepare('SELECT count(*) as count FROM songs WHERE genre = ? AND difficulty = ?').get(genre, level)) as any)?.count || 0;
        songs = await db.prepare('SELECT id, title, artist, genre, album, source, difficulty, chord_data FROM songs WHERE genre = ? AND difficulty = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(genre, level, limit, offset);
      } else {
        totalCount = ((await db.prepare('SELECT count(*) as count FROM songs WHERE genre = ?').get(genre)) as any)?.count || 0;
        songs = await db.prepare('SELECT id, title, artist, genre, album, source, difficulty, chord_data FROM songs WHERE genre = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(genre, limit, offset);
      }

    } else if (artist && rawQ) {
      const matchQuery = buildFtsMatchQuery(rawQ);
      const artistQ    = `%${artist}%`;

      if (level) {
        totalCount = ((await db.prepare(`
          SELECT count(*) as count FROM (
            SELECT 1 FROM songs_fts f JOIN songs s ON f.id = s.id
            WHERE f.songs_fts MATCH ? AND s.artist LIKE ? AND s.difficulty = ?
          )
        `).get(matchQuery, artistQ, level)) as any)?.count || 0;

        songs = await db.prepare(`
          SELECT s.id, s.title, s.artist, s.genre, s.album, s.source, s.difficulty, s.chord_data
          FROM songs_fts f JOIN songs s ON f.id = s.id
          WHERE f.songs_fts MATCH ? AND s.artist LIKE ? AND s.difficulty = ?
          ORDER BY bm25(songs_fts, 10.0, 5.0, 1.0, 0.5)
          LIMIT ? OFFSET ?
        `).all(matchQuery, artistQ, level, limit, offset);
      } else {
        totalCount = ((await db.prepare(`
          SELECT count(*) as count FROM (
            SELECT 1 FROM songs_fts f JOIN songs s ON f.id = s.id
            WHERE f.songs_fts MATCH ? AND s.artist LIKE ?
          )
        `).get(matchQuery, artistQ)) as any)?.count || 0;

        songs = await db.prepare(`
          SELECT s.id, s.title, s.artist, s.genre, s.album, s.source, s.difficulty, s.chord_data
          FROM songs_fts f JOIN songs s ON f.id = s.id
          WHERE f.songs_fts MATCH ? AND s.artist LIKE ?
          ORDER BY bm25(songs_fts, 10.0, 5.0, 1.0, 0.5)
          LIMIT ? OFFSET ?
        `).all(matchQuery, artistQ, limit, offset);
      }

    } else if (artist) {
      const artistQ = `%${artist}%`;
      if (level) {
        totalCount = ((await db.prepare('SELECT count(*) as count FROM songs WHERE artist LIKE ? AND difficulty = ?').get(artistQ, level)) as any)?.count || 0;
        songs = await db.prepare('SELECT id, title, artist, genre, album, source, difficulty, chord_data FROM songs WHERE artist LIKE ? AND difficulty = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(artistQ, level, limit, offset);
      } else {
        totalCount = ((await db.prepare('SELECT count(*) as count FROM songs WHERE artist LIKE ?').get(artistQ)) as any)?.count || 0;
        songs = await db.prepare('SELECT id, title, artist, genre, album, source, difficulty, chord_data FROM songs WHERE artist LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(artistQ, limit, offset);
      }

    } else if (rawQ) {
      const matchQuery = buildFtsMatchQuery(rawQ);

      if (level) {
        totalCount = ((await db.prepare(`
          SELECT count(*) as count FROM (
            SELECT 1 FROM songs_fts f JOIN songs s ON f.id = s.id WHERE f.songs_fts MATCH ? AND s.difficulty = ?
          )
        `).get(matchQuery, level)) as any)?.count || 0;

        songs = await db.prepare(`
          SELECT s.id, s.title, s.artist, s.genre, s.album, s.source, s.difficulty, s.chord_data
          FROM songs_fts f JOIN songs s ON f.id = s.id
          WHERE f.songs_fts MATCH ? AND s.difficulty = ?
          ORDER BY bm25(songs_fts, 20.0, 5.0, 1.0, 0.5)
          LIMIT ? OFFSET ?
        `).all(matchQuery, level, limit, offset);
      } else {
        totalCount = ((await db.prepare(`
          SELECT count(*) as count FROM (
            SELECT 1 FROM songs_fts f WHERE f.songs_fts MATCH ?
          )
        `).get(matchQuery)) as any)?.count || 0;

        songs = await db.prepare(`
          SELECT s.id, s.title, s.artist, s.genre, s.album, s.source, s.difficulty, s.chord_data
          FROM songs_fts f JOIN songs s ON f.id = s.id
          WHERE f.songs_fts MATCH ?
          ORDER BY bm25(songs_fts, 20.0, 5.0, 1.0, 0.5)
          LIMIT ? OFFSET ?
        `).all(matchQuery, limit, offset);
      }

      if (songs.length === 0) {
        const tok = `%${rawQ.split('').join('%')}%`;
        if (level) {
          totalCount = ((await db.prepare('SELECT count(*) as count FROM songs WHERE (title LIKE ? OR artist LIKE ?) AND difficulty = ?').get(tok, tok, level)) as any)?.count || 0;
          songs = await db.prepare('SELECT id, title, artist, genre, album, source, difficulty, chord_data FROM songs WHERE (title LIKE ? OR artist LIKE ?) AND difficulty = ? LIMIT ? OFFSET ?').all(tok, tok, level, limit, offset);
        } else {
          totalCount = ((await db.prepare('SELECT count(*) as count FROM songs WHERE (title LIKE ? OR artist LIKE ?)').get(tok, tok)) as any)?.count || 0;
          songs = await db.prepare('SELECT id, title, artist, genre, album, source, difficulty, chord_data FROM songs WHERE (title LIKE ? OR artist LIKE ?) LIMIT ? OFFSET ?').all(tok, tok, limit, offset);
        }
      }

    } else {
      if (level) {
        totalCount = ((await db.prepare('SELECT count(*) as count FROM songs WHERE difficulty = ?').get(level)) as any)?.count || 0;
        songs = await db.prepare('SELECT id, title, artist, genre, album, source, difficulty, chord_data FROM songs WHERE difficulty = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(level, limit, offset);
      } else {
        totalCount = ((await db.prepare('SELECT count(*) as count FROM songs').get()) as any)?.count || 0;
        songs = await db.prepare('SELECT id, title, artist, genre, album, source, difficulty, chord_data FROM songs ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
      }
    }

    const payload = {
      songs: songs || [],
      pagination: { total: totalCount, page, limit, pages: Math.ceil(totalCount / limit) },
    };

    if (SEARCH_CACHE.size >= MAX_CACHE_ENTRIES) {
      const firstKey = SEARCH_CACHE.keys().next().value;
      if (firstKey) SEARCH_CACHE.delete(firstKey);
    }
    SEARCH_CACHE.set(cacheKey, { data: payload, timestamp: Date.now() });

    return NextResponse.json(payload, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' },
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
