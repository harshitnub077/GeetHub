import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'geethub_master.db');

function initSchema(db: DatabaseSync): void {
  // Core songs table
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

  // FTS5 virtual table for full-text search
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS songs_fts USING fts5(
      id UNINDEXED,
      title,
      artist,
      content='songs',
      content_rowid='rowid'
    );
  `);

  // Sync triggers
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

  // Initial FTS sync in case rows exist but FTS is out of date
  db.exec(`
    INSERT OR IGNORE INTO songs_fts(rowid, id, title, artist)
    SELECT rowid, id, title, artist FROM songs
    WHERE rowid NOT IN (SELECT rowid FROM songs_fts);
  `);
}

class DatabaseManager {
  private static instance: DatabaseSync | null = null;

  static getInstance(): DatabaseSync {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseSync(DB_PATH);
      DatabaseManager.instance.exec('PRAGMA journal_mode = WAL;');
      DatabaseManager.instance.exec('PRAGMA foreign_keys = ON;');
      initSchema(DatabaseManager.instance);
    }
    return DatabaseManager.instance;
  }
}

export const getDb = () => DatabaseManager.getInstance();
