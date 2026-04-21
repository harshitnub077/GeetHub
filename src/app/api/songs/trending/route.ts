import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbSync';
import fs from 'fs';
import path from 'path';

function loadStaticSongs(): any[] {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/songs.json'), 'utf8'));
  } catch { return []; }
}

// Curated list of the best Bollywood songs - popular, trending, and evergreen
const BOLLYWOOD_2026_PICKS = [
  'GT-5330204', 'GT-9618845', 'GT-8906940', 'dhurandhar-the-revenge-phir-se',
  'GT-5575012', 'husn-anuv-jain', 'alag-aasmaan-anuv-jain', 'GJo-tum-mere-ho',
  'GT-6574049', 'GT-4628748', 'GT-9497923', 'PR-6534224',
  'kaise-hua-kabir-singh-vishal-mishra', 'bekhayali-sachet-tandon-kabir-singh',
  'GT-9782287', 'tum-hi-ho-arijit-singh-mithoon-aashiqui-2', 'agar-tum-saath-ho-tamasha',
  'darkhaast-shivaay-arijit-singh-sunidhi-chauhan-mithoon', 'GT-1502779',
  'tab-o-sajni-re-guitar-chords-arijit-singh', 'tab-darkhaast-guitar-chords-shivaay',
  'tab-samjhawan-chords-humpty-sharma-ki-dulhania', 'tab-janam-janam-chords-dilwale',
  'tum-se-hi-mohit-chauhan-pritam-jab-we-met', 'raabta-shreya-ghoshal-pritam-arijit-singh',
  'janam-janam-arijit-pritam', 'ambarsariya-fukrey-sona-mahapatra-ram-sampath',
  'GT-7851226',
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(24, parseInt(searchParams.get('limit') || '20'));

  const db = getDb();

  // ── JSON fallback when DB unavailable ──
  if (!db) {
    const staticSongs = loadStaticSongs();
    return NextResponse.json({ songs: staticSongs.slice(0, limit), total: staticSongs.length });
  }

  try {
    const placeholders = BOLLYWOOD_2026_PICKS.map(() => '?').join(',');
    const rows = db.prepare(`
      SELECT id, title, artist, genre FROM songs WHERE id IN (${placeholders})
    `).all(...BOLLYWOOD_2026_PICKS) as any[];

    const seen = new Set<string>();
    const unique: any[] = [];
    for (const row of rows) {
      const key = row.title.toLowerCase().trim();
      if (!seen.has(key)) { seen.add(key); unique.push(row); }
    }

    const idIndex = new Map(BOLLYWOOD_2026_PICKS.map((id, i) => [id, i]));
    unique.sort((a, b) => (idIndex.get(a.id) ?? 99) - (idIndex.get(b.id) ?? 99));

    if (unique.length < limit) {
      const existingIds = unique.map((r) => r.id);
      let extras: any[];
      if (existingIds.length > 0) {
        const notIn = existingIds.map(() => '?').join(',');
        extras = db.prepare(`
          SELECT id, title, artist, genre FROM songs
          WHERE (genre LIKE '%Bollywood%') AND id NOT IN (${notIn})
          ORDER BY ROWID DESC LIMIT ?
        `).all(...existingIds, limit - unique.length) as any[];
      } else {
        extras = db.prepare(`
          SELECT id, title, artist, genre FROM songs
          WHERE genre LIKE '%Bollywood%' ORDER BY ROWID DESC LIMIT ?
        `).all(limit - unique.length) as any[];
      }
      unique.push(...extras);
    }

    return NextResponse.json({ songs: unique.slice(0, limit), total: unique.length });
  } catch (err: any) {
    console.error('GET /api/songs/trending error:', err);
    const staticSongs = loadStaticSongs();
    return NextResponse.json({ songs: staticSongs.slice(0, limit), total: staticSongs.length });
  }
}
