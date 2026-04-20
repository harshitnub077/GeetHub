const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'geethub_master.db');
const JSON_PATH = path.join(process.cwd(), 'src/data/songs.json');

function sync() {
  const db = new DatabaseSync(DB_PATH);
  const songs = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  
  const insertStmt = db.prepare(`
    INSERT INTO songs (id, title, artist, chord_data, genre, source, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  
  const checkStmt = db.prepare('SELECT id FROM songs WHERE id = ?');
  
  let added = 0;
  
  db.exec('BEGIN TRANSACTION');
  try {
    for (const song of songs) {
      const exists = checkStmt.get(song.id);
      if (!exists) {
        insertStmt.run(
          song.id, 
          song.title, 
          song.artist, 
          song.chord_data || '', 
          song.genre || 'Pop', 
          song.source_url || 'Unknown'
        );
        added++;
      }
    }
    db.exec('COMMIT');
    console.log(`Successfully synced ${added} new songs from JSON to the SQLite database.`);
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Error syncing:', err);
  }
}

sync();
