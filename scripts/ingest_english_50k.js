const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'geethub_master.db');
const CSV_PATH = path.join(process.cwd(), 'data/english_chords_50k.csv');

async function main() {
  const db = new DatabaseSync(DB_PATH);
  const fileStream = fs.createReadStream(CSV_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log('Starting ingestion of 50,000 English hits...');

  let count = 0;
  let successCount = 0;

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO songs (id, title, artist, chord_data, source)
    VALUES (?, ?, ?, ?, ?)
  `);

  for await (const line of rl) {
    count++;
    if (count === 1) continue; // Skip header

    try {
      // Basic CSV parsing for current format: genres,artist_name,song_name,chords_str
      // Handling quotes: ["genres"], "artist", "song", "chords"
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      if (parts.length < 4) continue;

      const artist = parts[1].replace(/\"/g, '').trim();
      const title = parts[2].replace(/\"/g, '').trim();
      const chordsRaw = parts[3].replace(/\"/g, '').trim();

      if (!title || !chordsRaw) continue;

      // Normalize chords to [Chord] format
      // melodyGPT often uses "G G/B C G..."
      const chordData = chordsRaw.split(/\s+/).map(c => `[${c}]`).join(' ');

      const id = `eng_${count}_${Date.now()}`;
      
      insertStmt.run(id, title, artist, chordData, 'english-monster-v1');
      successCount++;

      if (successCount % 2000 === 0) {
        console.log(`Ingested ${successCount} songs... Latest: ${title} by ${artist}`);
      }
    } catch (err) {
      // Skip malformed lines
    }
  }

  console.log(`Ingestion complete! Successfully added ${successCount} professional English hits.`);
}

main();
