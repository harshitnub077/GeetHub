import path from 'path';
import { createRequire } from 'module';

// Use a plain file-path string (NOT import.meta.url) so turbopack
// doesn't encounter the "Unsupported external type Url" error.
const _require = createRequire(path.join(process.cwd(), 'package.json'));

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

    // Back-fill FTS for any existing rows not yet indexed
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
  if (_dbAttempted) return _dbInstance;
  _dbAttempted = true;

  try {
    // node:sqlite is a Node.js 22.5+ built-in; excluded from bundling via
    // serverExternalPackages in next.config.ts.
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
    console.log('[GeetHub] SQLite connected —', DB_PATH);
  } catch (err: any) {
    console.warn('[GeetHub] SQLite unavailable — JSON-fallback mode.', err?.message ?? err);
    _dbInstance = null;
  }

  return _dbInstance;
}

export const getDb = () => getDatabase();
