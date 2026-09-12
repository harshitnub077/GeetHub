import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbSync';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json({ posts: [] });
    }

    const posts = await db
      .prepare('SELECT * FROM community_posts ORDER BY created_at DESC LIMIT 50')
      .all();

    return NextResponse.json({ posts: posts || [] });
  } catch (error: any) {
    console.error('Community posts GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const body = await request.json();
    const { title, description, video_url, song_tag, author_name, author_avatar } = body;

    if (!title?.trim() || !video_url?.trim()) {
      return NextResponse.json({ error: 'Title and video URL are required' }, { status: 400 });
    }

    const id = `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const author = author_name?.trim() || 'Musician';
    const avatar =
      author_avatar ||
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80';

    let videoType = 'mp4';
    if (video_url.includes('youtube.com') || video_url.includes('youtu.be')) {
      videoType = 'youtube';
    } else if (video_url.includes('vimeo.com')) {
      videoType = 'vimeo';
    }

    await db
      .prepare(
        `INSERT INTO community_posts (id, author_name, author_avatar, title, description, video_url, video_type, song_tag, likes_count, comments_count, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, datetime('now'))`
      )
      .run(id, author, avatar, title.trim(), description?.trim() || '', video_url.trim(), videoType, song_tag?.trim() || '');

    const created = await db.prepare('SELECT * FROM community_posts WHERE id = ?').get(id);
    return NextResponse.json({ success: true, post: created });
  } catch (error: any) {
    console.error('Community posts POST error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
