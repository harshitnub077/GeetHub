import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbSync';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const { postId, userId } = await request.json();
    if (!postId || !userId) {
      return NextResponse.json({ error: 'postId and userId are required' }, { status: 400 });
    }

    // Check if already liked
    const existing = await db
      .prepare('SELECT 1 FROM community_likes WHERE post_id = ? AND user_id = ?')
      .get(postId, userId);

    let liked = false;
    if (existing) {
      // Unlike
      await db.prepare('DELETE FROM community_likes WHERE post_id = ? AND user_id = ?').run(postId, userId);
      await db.prepare('UPDATE community_posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?').run(postId);
      liked = false;
    } else {
      // Like
      await db.prepare('INSERT INTO community_likes (post_id, user_id) VALUES (?, ?)').run(postId, userId);
      await db.prepare('UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = ?').run(postId);
      liked = true;
    }

    const updated = await db.prepare('SELECT likes_count FROM community_posts WHERE id = ?').get(postId);
    return NextResponse.json({ success: true, liked, likesCount: updated?.likes_count || 0 });
  } catch (error: any) {
    console.error('Like toggle error:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
