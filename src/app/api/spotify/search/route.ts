import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!q.trim()) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  // Fallback direct Spotify link and embed
  const fallbackResponse = {
    query: q,
    directUrl: `https://open.spotify.com/search/${encodeURIComponent(q)}`,
    embedUrl: `https://open.spotify.com/embed?uri=spotify:search:${encodeURIComponent(q)}`,
    track: null,
  };

  // If credentials are not present, return fallback immediately
  if (!clientId || !clientSecret) {
    return NextResponse.json(fallbackResponse);
  }

  try {
    // 1. Get access token
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
      next: { revalidate: 3600 },
    });

    if (!tokenRes.ok) {
      return NextResponse.json(fallbackResponse);
    }

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    // 2. Search track
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 86400 },
      }
    );

    if (!searchRes.ok) {
      return NextResponse.json(fallbackResponse);
    }

    const searchData = await searchRes.json();
    const item = searchData?.tracks?.items?.[0];

    if (!item) {
      return NextResponse.json(fallbackResponse);
    }

    return NextResponse.json({
      query: q,
      directUrl: item.external_urls?.spotify || fallbackResponse.directUrl,
      embedUrl: `https://open.spotify.com/embed/track/${item.id}?utm_source=geethub`,
      track: {
        id: item.id,
        name: item.name,
        artist: item.artists?.map((a: any) => a.name).join(', '),
        albumName: item.album?.name,
        albumCover: item.album?.images?.[0]?.url,
        previewUrl: item.preview_url,
        externalUrl: item.external_urls?.spotify,
        durationMs: item.duration_ms,
      },
    });
  } catch (error) {
    console.error('Spotify API Error:', error);
    return NextResponse.json(fallbackResponse);
  }
}
