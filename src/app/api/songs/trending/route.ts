import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbSync';

// Curated list of the best Bollywood songs - popular, trending, and evergreen
const BOLLYWOOD_2026_PICKS = [
  // 2025-2026 hits (Saiyaara & Dhurandhar franchise)
  'GT-5330204',              // Saiyaara - Dhun (Arijit Singh)
  'GT-9618845',              // Saiyaara Title Song
  'GT-8906940',              // Saiyaara: Tum Ho Toh (Vishal Mishra)
  'dhurandhar-the-revenge-phir-se',
  'GT-5575012',              // Dhurandhar 2 - Jaan Se Guzarte Hain

  // Anuv Jain - indie-bollywood wave
  'husn-anuv-jain',          // Husn
  'alag-aasmaan-anuv-jain',  // Alag Aasmaan
  'GJo-tum-mere-ho',
  'GT-6574049',              // Jo Tum Mere Ho
  'GT-4628748',              // Alag Aasmaan
  'GT-9497923',              // Husn
  'PR-6534224',              // Arz Kiya Hai

  // Kabir Singh era (perennial trending)
  'kaise-hua-kabir-singh-vishal-mishra',
  'bekhayali-sachet-tandon-kabir-singh',
  'GT-9782287',              // Kabir Singh: Kaise Hua

  // Arijit Singh classics always trending
  'tum-hi-ho-arijit-singh-mithoon-aashiqui-2',
  'agar-tum-saath-ho-tamasha',
  'darkhaast-shivaay-arijit-singh-sunidhi-chauhan-mithoon',
  'GT-1502779',              // Channa Mereya

  // Latest Bollywood genre picks
  'tab-o-sajni-re-guitar-chords-arijit-singh',
  'tab-darkhaast-guitar-chords-shivaay',
  'tab-samjhawan-chords-humpty-sharma-ki-dulhania',
  'tab-janam-janam-chords-dilwale',

  // Perennial Bollywood favourites
  'tum-se-hi-mohit-chauhan-pritam-jab-we-met',
  'raabta-shreya-ghoshal-pritam-arijit-singh',
  'janam-janam-arijit-pritam',
  'ambarsariya-fukrey-sona-mahapatra-ram-sampath',

  // Animal / recent releases
  'GT-7851226',              // Marham / Pehle Bhi Main
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(24, parseInt(searchParams.get('limit') || '20'));

  try {
    const db = getDb();

    // Build placeholders for the IN clause
    const placeholders = BOLLYWOOD_2026_PICKS.map(() => '?').join(',');
    const rows = db.prepare(`
      SELECT id, title, artist, genre
      FROM songs
      WHERE id IN (${placeholders})
    `).all(...BOLLYWOOD_2026_PICKS) as any[];

    // Deduplicate by title (keep the first occurrence)
    const seen = new Set<string>();
    const unique: any[] = [];
    for (const row of rows) {
      const key = row.title.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(row);
      }
    }

    // Re-order by the curated pick list priority
    const idIndex = new Map(BOLLYWOOD_2026_PICKS.map((id, i) => [id, i]));
    unique.sort((a, b) => (idIndex.get(a.id) ?? 99) - (idIndex.get(b.id) ?? 99));

    // If we don't have enough, pad with popular Bollywood songs from DB
    if (unique.length < limit) {
      const existingIds = unique.map((r) => r.id);
      let extras: any[];
      if (existingIds.length > 0) {
        const notInPlaceholders = existingIds.map(() => '?').join(',');
        extras = db.prepare(`
          SELECT id, title, artist, genre
          FROM songs
          WHERE (genre LIKE '%Latest Bollywood%' OR genre LIKE '%Bollywood%')
            AND id NOT IN (${notInPlaceholders})
          ORDER BY ROWID DESC
          LIMIT ?
        `).all(...existingIds, limit - unique.length) as any[];
      } else {
        extras = db.prepare(`
          SELECT id, title, artist, genre
          FROM songs
          WHERE (genre LIKE '%Latest Bollywood%' OR genre LIKE '%Bollywood%')
          ORDER BY ROWID DESC
          LIMIT ?
        `).all(limit - unique.length) as any[];
      }
      unique.push(...extras);
    }

    return NextResponse.json({
      songs: unique.slice(0, limit),
      total: unique.length,
    });
  } catch (err: any) {
    console.error('GET /api/songs/trending error:', err);
    return NextResponse.json({ error: 'Database error', details: err.message }, { status: 500 });
  }
}
