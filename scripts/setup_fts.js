const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'geethub_master.db');
const db = new DatabaseSync(DB_PATH);

console.log('Enabling FTS5 Full-Text Search...');

try {
  // Create FTS5 table
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS songs_fts USING fts5(
      id UNINDEXED,
      title,
      artist,
      content='songs',
      content_rowid='rowid'
    );
  `);

  // Trigger to keep FTS table in sync on inserts
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS songs_ai AFTER INSERT ON songs BEGIN
      INSERT INTO songs_fts(rowid, id, title, artist)
      VALUES (new.rowid, new.id, new.title, new.artist);
    END;
  `);

  // Trigger to keep FTS table in sync on updates
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS songs_au AFTER UPDATE ON songs BEGIN
      INSERT INTO songs_fts(songs_fts, rowid, id, title, artist)
      VALUES('delete', old.rowid, old.id, old.title, old.artist);
      INSERT INTO songs_fts(rowid, id, title, artist)
      VALUES (new.rowid, new.id, new.title, new.artist);
    END;
  `);

  // Trigger to keep FTS table in sync on deletes
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS songs_ad AFTER DELETE ON songs BEGIN
      INSERT INTO songs_fts(songs_fts, rowid, id, title, artist)
      VALUES('delete', old.rowid, old.id, old.title, old.artist);
    END;
  `);

  // Initial sync for any missing records
  db.exec(`
    INSERT INTO songs_fts(rowid, id, title, artist)
    SELECT rowid, id, title, artist FROM songs 
    WHERE rowid NOT IN (SELECT rowid FROM songs_fts);
  `);

  console.log('FTS5 Full-Text Search setup successfully.');
} catch (err) {
  console.error('FTS5 Setup failed:', err.message);
  process.exit(1);
}
