import path from 'path';

const DB_PATH = path.join(process.cwd(), 'geethub_master.db');

function initSchema(db: any): void {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS songs (
        id                   TEXT PRIMARY KEY,
        title                TEXT NOT NULL,
        artist               TEXT NOT NULL,
        genre                TEXT DEFAULT '',
        album                TEXT DEFAULT '',
        source               TEXT DEFAULT '',
        chord_data           TEXT DEFAULT '',
        contributor_username TEXT DEFAULT 'community',
        created_at           TEXT DEFAULT (datetime('now'))
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
    // Schema already exists or partial — safe to ignore
  }
}

let _dbInstance: any = null;
let _dbAttempted = false;

function getDatabase(): any {
  if (_dbAttempted) return _dbInstance;
  _dbAttempted = true;

  try {
    // Use require() so a missing module doesn't crash at import time.
    // node:sqlite requires Node.js 22.5+ — not available on Vercel/Netlify (Node 20).
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sqlite = require('node:sqlite');
    const db = new sqlite.DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');
    initSchema(db);
    _dbInstance = db;
  } catch {
    // SQLite unavailable — API routes will serve data from songs.json fallback.
    console.warn('[GeetHub] SQLite unavailable — running in JSON-fallback mode.');
    _dbInstance = null;
  }

  return _dbInstance;
}

export const getDb = () => getDatabase();
