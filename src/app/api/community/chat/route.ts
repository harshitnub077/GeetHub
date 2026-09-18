import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/dbSync';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = (searchParams.get('channel') || 'general').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32) || 'general';
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const before = searchParams.get('before')?.trim();

    const db = getDb();
    if (!db) {
      return NextResponse.json({ messages: [] });
    }

    let messages;
    if (before) {
      messages = await db
        .prepare('SELECT * FROM community_messages WHERE channel = ? AND created_at < ? ORDER BY created_at ASC LIMIT ?')
        .all(channel, before, limit);
    } else {
      messages = await db
        .prepare('SELECT * FROM community_messages WHERE channel = ? ORDER BY created_at ASC LIMIT ?')
        .all(channel, limit);
    }

    return NextResponse.json({ messages: messages || [], channel, count: messages?.length || 0 });
  } catch (error: any) {
    console.error('Chat GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch chat messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const { channel, sender_name, sender_avatar, text } = await request.json();
    const cleanText = text?.trim();
    if (!cleanText) {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }
    if (cleanText.length > 1000) {
      return NextResponse.json({ error: 'Message exceeds maximum length of 1000 characters' }, { status: 400 });
    }

    const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const ch = (channel || 'general').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32) || 'general';
    const name = (sender_name?.trim() || 'Musician').slice(0, 50);
    const avatar = sender_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

    await db
      .prepare(
        `INSERT INTO community_messages (id, channel, sender_name, sender_avatar, text, created_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`
      )
      .run(id, ch, name, avatar, cleanText);

    const created = await db.prepare('SELECT * FROM community_messages WHERE id = ?').get(id);
    return NextResponse.json({ success: true, message: created });
  } catch (error: any) {
    console.error('Chat POST error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
