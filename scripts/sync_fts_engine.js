/**
 * sync_fts_engine.js — Rebuilds the FTS5 index after bulk ingestion.
 * Run after any batch song import to keep BM25 search results current.
 * Usage: node scripts/sync_fts_engine.js
 */
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'geethub_master.db');

function setup() {
  const db = new DatabaseSync(DB_PATH);
  
  console.log('Synchronizing Million-Song Search Engine...');

  db.exec(`
    -- 1. Drop existing FTS table to ensure clean sync
    DROP TABLE IF EXISTS songs_fts;

    -- 2. Create FTS5 Contentless / External Content table for performance
    -- We use 'content=songs' to point to our main storage
    CREATE VIRTUAL TABLE songs_fts USING fts5(
      id, title, artist,
      content='songs',
      content_rowid='rowid'
    );

    -- 3. Populate the FTS5 index from the main table
    INSERT INTO songs_fts(rowid, id, title, artist)
    SELECT rowid, id, title, artist FROM songs;

    -- 4. Create Triggers for Automatic Synchronization (Enterprise Standard)
    -- This ensures any new song ingestion automatically updates the search index

    DROP TRIGGER IF EXISTS songs_ai;
    CREATE TRIGGER songs_ai AFTER INSERT ON songs BEGIN
      INSERT INTO songs_fts(rowid, id, title, artist) VALUES (new.rowid, new.id, new.title, new.artist);
    END;

    DROP TRIGGER IF EXISTS songs_ad;
    CREATE TRIGGER songs_ad AFTER DELETE ON songs BEGIN
      INSERT INTO songs_fts(songs_fts, rowid, id, title, artist) VALUES('delete', old.rowid, old.id, old.title, old.artist);
    END;

    DROP TRIGGER IF EXISTS songs_au;
    CREATE TRIGGER songs_au AFTER UPDATE ON songs BEGIN
      INSERT INTO songs_fts(songs_fts, rowid, id, title, artist) VALUES('delete', old.rowid, old.id, old.title, old.artist);
      INSERT INTO songs_fts(rowid, id, title, artist) VALUES (new.rowid, new.id, new.title, new.artist);
    END;
  `);

  console.log('Search Engine Synchronization Complete! 1,000,000-song Triggers are active.');
}

setup();
