// Next.js API Route: /api/search
// Proxy to lrclib.net to search songs by title/artist (no API key needed)
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const artist = searchParams.get('artist') || '';

  let url = `https://lrclib.net/api/search?q=${encodeURIComponent(q)}`;
  if (artist) url += `&artist_name=${encodeURIComponent(artist)}`;

  try {
    const res = await fetch(url, {
      headers: { 'Lrclib-Client': 'Geethub (https://github.com/harshitnub077)' },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!res.ok) throw new Error('Failed to fetch from lrclib');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
  }
}
