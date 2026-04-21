import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbSync';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawQ = searchParams.get('q')?.toLowerCase().trim() || '';
  const artist = searchParams.get('artist')?.trim() || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 50;
  const offset = (page - 1) * limit;

  try {
    const db = getDb();
    
    let songs: any[] = [];
    let totalCount = 0;

    if (artist && rawQ) {
      // safe words for FTS
      const safeQ = rawQ.replace(/["^=:]/g, '');
      const words = safeQ.split(/\s+/).filter(w => w.length > 0);
      const matchQuery = words.length > 0 ? words.map(w => `"${w}"*`).join(" AND ") : "a*";

      const artistQuery = `%${artist}%`;
      
      const countRow = db.prepare(`
        SELECT count(*) as count FROM (
          SELECT 1 FROM songs_fts f 
          JOIN songs s ON f.id = s.id 
          WHERE f.songs_fts MATCH ? AND s.artist LIKE ?
        )
      `).get(matchQuery, artistQuery) as { count: number };
      totalCount = countRow?.count || 0;

      songs = db.prepare(`
        SELECT s.id, s.title, s.artist, s.genre, s.album, s.source 
        FROM songs_fts f
        JOIN songs s ON f.id = s.id
        WHERE f.songs_fts MATCH ? AND s.artist LIKE ?
        ORDER BY bm25(songs_fts, 10.0, 5.0, 1.0, 0.5)
        LIMIT ? OFFSET ?
      `).all(matchQuery, artistQuery, limit, offset);

    } else if (artist) {
      const artistQuery = `%${artist}%`;
      const countRow = db.prepare('SELECT count(*) as count FROM songs WHERE artist LIKE ?').get(artistQuery) as { count: number };
      totalCount = countRow?.count || 0;
      
      songs = db.prepare(`
        SELECT id, title, artist, genre, album, source 
        FROM songs 
        WHERE artist LIKE ? 
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `).all(artistQuery, limit, offset);

    } else if (rawQ) {
      const safeQ = rawQ.replace(/["^=:]/g, '');
      const words = safeQ.split(/\s+/).filter(w => w.length > 0);
      const matchQuery = words.length > 0 ? words.map(w => `"${w}"*`).join(" AND ") : "a*";

      const countRow = db.prepare(`
        SELECT count(*) as count FROM (
          SELECT 1 FROM songs_fts f 
          JOIN songs s ON f.id = s.id 
          WHERE f.songs_fts MATCH ?
        )
      `).get(matchQuery) as { count: number };
      totalCount = countRow?.count || 0;
      
      songs = db.prepare(`
        SELECT s.id, s.title, s.artist, s.genre, s.album, s.source 
        FROM songs_fts f
        JOIN songs s ON f.id = s.id
        WHERE f.songs_fts MATCH ? 
        ORDER BY bm25(songs_fts, 20.0, 5.0, 1.0, 0.5)
        LIMIT ? OFFSET ?
      `).all(matchQuery, limit, offset);

      // Fallback
      if (songs.length === 0) {
        const likeToken = `%${rawQ.split('').join('%')}%`;
        const countRowFb = db.prepare('SELECT count(*) as count FROM songs WHERE title LIKE ? OR artist LIKE ?').get(likeToken, likeToken) as { count: number };
        totalCount = countRowFb?.count || 0;
        songs = db.prepare(`
          SELECT id, title, artist, genre, album, source 
          FROM songs WHERE title LIKE ? OR artist LIKE ?
          LIMIT ? OFFSET ?
        `).all(likeToken, likeToken, limit, offset);
      }

    } else {
      const countRow = db.prepare('SELECT count(*) as count FROM songs').get() as { count: number };
      totalCount = countRow?.count || 0;
      
      songs = db.prepare(`
        SELECT id, title, artist, genre, album, source 
        FROM songs 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `).all(limit, offset);
    }

    return NextResponse.json({
      songs: songs || [],
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error: any) {
    console.error('Search API Error:', error);
    
    // Fallback for Vercel / Serverless environments where SQLite might fail
    try {
      const fs = require('fs');
      const path = require('path');
      const dataPath = path.join(process.cwd(), 'src/data/songs.json');
      
      if (fs.existsSync(dataPath)) {
        const staticSongs = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        
        // Simple search logic for the fallback
        const filtered = staticSongs.filter((s: any) => 
          !rawQ || s.title.toLowerCase().includes(rawQ) || s.artist.toLowerCase().includes(rawQ)
        ).filter((s: any) =>
          !artist || s.artist.toLowerCase().includes(artist.toLowerCase())
        );

        return NextResponse.json({
          songs: filtered.slice(offset, offset + limit),
          pagination: {
            total: filtered.length,
            page,
            limit,
            pages: Math.ceil(filtered.length / limit)
          },
          is_fallback: true
        });
      }
    } catch (fallbackError) {
      console.error('Fallback Error:', fallbackError);
    }

    return NextResponse.json({ error: 'Search Engine Error', details: error.message }, { status: 500 });
  }
}
