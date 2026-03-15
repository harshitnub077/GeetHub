// Next.js API Route: /api/song/[id]
// Proxy to lrclib.net to get lyrics by track ID (no API key needed)
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const res = await fetch(`https://lrclib.net/api/get/${id}`, {
      headers: { 'Lrclib-Client': 'Geethub (https://github.com/harshitnub077)' },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });
    if (!res.ok) throw new Error('Track not found');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Track not found' }, { status: 404 });
  }
}
