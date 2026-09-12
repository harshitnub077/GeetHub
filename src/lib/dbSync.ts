import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import { createClient } from '@libsql/client/web';

const DB_PATH = path.join(process.cwd(), 'geethub_master.db');

// Fallback credentials for the live Turso database (174,112 verified songs)
const FALLBACK_TURSO_URL = 'libsql://geethub-live-harshitkudhial.aws-ap-south-1.turso.io';
const FALLBACK_TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODkyMTQzNDEsImlkIjoiMDFhMDk1N2EtMGIwMS03MzIwLWI5NDEtYmU1ODZlZWVhYTc5Iiwia2lkIjoib3k2YXFoaW5qVFBERko3M1ZWWk12ME8xbEpqcHliVGotLTNkVlBOVDQxcyIsInJpZCI6ImEyZDZkNTkzLTQyNDQtNGI3Zi1hZDRhLTRhYWRjMjQ5N2FiOSJ9.cIdEyW7qCTpUGjmM4S9yNY49as1mOBF4Lil-4ZVENEp_c2YvrCw-341Q6BxGXQJxDeo8YzzN1TxB1XEeXLd9DQ';

function formatArgs(args: any[]): any[] {
  if (args.length === 1 && Array.isArray(args[0])) return args[0];
  return args.map((a) => (a === undefined ? null : a));
}

function initSchema(db: any): void {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS songs (
        id                   TEXT PRIMARY KEY,
        title                TEXT NOT NULL,
        artist               TEXT NOT NULL,
        genre                TEXT DEFAULT '',
        album                TEXT DEFAULT '',
        difficulty           TEXT DEFAULT 'Intermediate',
        source               TEXT DEFAULT '',
        chord_data           TEXT DEFAULT '',
        contributor_username TEXT DEFAULT 'community',
        created_at           TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre);
      CREATE INDEX IF NOT EXISTS idx_songs_difficulty ON songs(difficulty);
      CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
      CREATE INDEX IF NOT EXISTS idx_songs_created_at ON songs(created_at DESC);

      CREATE TABLE IF NOT EXISTS community_posts (
        id               TEXT PRIMARY KEY,
        author_name      TEXT NOT NULL,
        author_id        TEXT DEFAULT '',
        author_avatar    TEXT DEFAULT '',
        title            TEXT NOT NULL,
        description      TEXT DEFAULT '',
        video_url        TEXT NOT NULL,
        video_type       TEXT DEFAULT 'embed',
        song_tag         TEXT DEFAULT '',
        likes_count      INTEGER DEFAULT 0,
        comments_count   INTEGER DEFAULT 0,
        created_at       TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS community_comments (
        id               TEXT PRIMARY KEY,
        post_id          TEXT NOT NULL,
        author_name      TEXT NOT NULL,
        author_avatar    TEXT DEFAULT '',
        comment_text     TEXT NOT NULL,
        created_at       TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS community_likes (
        post_id          TEXT NOT NULL,
        user_id          TEXT NOT NULL,
        created_at       TEXT DEFAULT (datetime('now')),
        PRIMARY KEY (post_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS community_messages (
        id               TEXT PRIMARY KEY,
        channel          TEXT DEFAULT 'general',
        sender_name      TEXT NOT NULL,
        sender_avatar    TEXT DEFAULT '',
        text             TEXT NOT NULL,
        created_at       TEXT DEFAULT (datetime('now'))
      );
    `);

    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS songs_fts USING fts5(
        id UNINDEXED,
        title,
        artist,
        content='songs',
        content_rowid='rowid'
      );
    `);

    db.exec(`
      CREATE TRIGGER IF NOT EXISTS songs_ai AFTER INSERT ON songs BEGIN
        INSERT INTO songs_fts(rowid, id, title, artist)
        VALUES (new.rowid, new.id, new.title, new.artist);
      END;

      CREATE TRIGGER IF NOT EXISTS songs_au AFTER UPDATE ON songs BEGIN
        INSERT INTO songs_fts(songs_fts, rowid, id, title, artist)
        VALUES('delete', old.rowid, old.id, old.title, old.artist);
        INSERT INTO songs_fts(rowid, id, title, artist)
        VALUES (new.rowid, new.id, new.title, new.artist);
      END;

      CREATE TRIGGER IF NOT EXISTS songs_ad AFTER DELETE ON songs BEGIN
        INSERT INTO songs_fts(songs_fts, rowid, id, title, artist)
        VALUES('delete', old.rowid, old.id, old.title, old.artist);
      END;
    `);

    db.exec(`
      INSERT OR IGNORE INTO songs_fts(rowid, id, title, artist)
      SELECT rowid, id, title, artist FROM songs
      WHERE rowid NOT IN (SELECT rowid FROM songs_fts);
    `);
  } catch {
    // Schema already exists — safe to ignore
  }
}

let _dbInstance: any = null;
let _dbAttempted = false;

function getDatabase(): any {
  if (_dbAttempted && _dbInstance) return _dbInstance;
  _dbAttempted = true;

  // 1. Turso Cloud Database for Serverless / Vercel Production
  const tursoUrl = process.env.TURSO_DATABASE_URL || FALLBACK_TURSO_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || FALLBACK_TURSO_TOKEN;

  if (tursoUrl) {
    try {
      const client = createClient({
        url: tursoUrl,
        authToken: tursoAuthToken || undefined,
      });

      console.log('[GeetHub] Connected to Turso cloud database —', tursoUrl);

      _dbInstance = {
        isTurso: true,
        client,
        prepare: (sql: string) => ({
          get: async (...args: any[]) => {
            const res = await client.execute({ sql, args: formatArgs(args) });
            return res.rows[0] || null;
          },
          all: async (...args: any[]) => {
            const res = await client.execute({ sql, args: formatArgs(args) });
            return res.rows;
          },
          run: async (...args: any[]) => {
            return await client.execute({ sql, args: formatArgs(args) });
          },
        }),
        exec: async (sql: string) => {
          return await client.executeMultiple(sql);
        },
      };

      return _dbInstance;
    } catch (err: any) {
      console.warn('[GeetHub] Turso connection failed, falling back to local SQLite:', err?.message || err);
    }
  }

  // 2. Local SQLite mode for development when database file exists
  if (fs.existsSync(DB_PATH)) {
    try {
      const _require = createRequire(path.join(process.cwd(), 'package.json'));
      const sqlite = _require('node:sqlite');
      const db = new sqlite.DatabaseSync(DB_PATH);
      db.exec('PRAGMA journal_mode = WAL;');
      db.exec('PRAGMA busy_timeout = 5000;');
      db.exec('PRAGMA synchronous = NORMAL;');
      db.exec('PRAGMA foreign_keys = ON;');
      db.exec('PRAGMA mmap_size = 3000000000;');
      db.exec('PRAGMA temp_store = MEMORY;');
      initSchema(db);
      _dbInstance = db;
      console.log('[GeetHub] Local SQLite connected —', DB_PATH);
      return _dbInstance;
    } catch (err: any) {
      console.warn('[GeetHub] SQLite unavailable — JSON-fallback mode.', err?.message ?? err);
    }
  }

  return _dbInstance;
}

export const getDb = () => getDatabase();

