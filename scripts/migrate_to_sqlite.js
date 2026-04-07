const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'geethub_master.db');
const SONGS_JSON = path.join(process.cwd(), 'src/data/songs.json');

if (!fs.existsSync(SONGS_JSON)) {
  console.error('Source songs.json not found.');
  process.exit(1);
}

const db = new DatabaseSync(DB_PATH);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    genre TEXT,
    album TEXT,
    year INTEGER,
    chord_data TEXT NOT NULL,
    contributor_username TEXT,
    source TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);
  CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
  CREATE INDEX IF NOT EXISTS idx_songs_search ON songs(title, artist);
`);

const songs = JSON.parse(fs.readFileSync(SONGS_JSON, 'utf8'));
const stmt = db.prepare(`
  INSERT OR REPLACE INTO songs (id, title, artist, genre, album, chord_data, contributor_username, source)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

db.exec('BEGIN TRANSACTION');
let count = 0;
songs.forEach((s) => {
  try {
    stmt.run(
      s.id,
      s.title,
      s.artist,
      s.genre || null,
      s.album || null,
      s.chord_data,
      s.contributor_username || null,
      s.source || 'legacy'
    );
    count++;
  } catch (err) {
    console.error('Failed to migrate song:', s.id, err.message);
  }
});
db.exec('COMMIT');

console.log('Successfully migrated', count, 'songs to geethub_master.db');
