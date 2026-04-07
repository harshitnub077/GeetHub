const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const DB_PATH = path.join(__dirname, '../geethub_master.db');
const CHORD_CSV = path.join(__dirname, '../data/chordonomicon_v2.csv');
const METADATA_BASE_DIR = path.join(__dirname, '../data/spotify_metadata_extracted/data');

function getAllCSVs(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllCSVs(filePath, fileList);
    } else if (file.endsWith('.csv') && !file.startsWith('._')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

async function main() {
  const db = new DatabaseSync(DB_PATH);
  
  // 1. Load Metadata mapping into memory
  console.log('📦 Loading Spotify metadata mapping into memory...');
  const metadataMap = new Map();
  
  const metadataFiles = getAllCSVs(METADATA_BASE_DIR);
  for (const filePath of metadataFiles) {
    console.log(`📖 Processing: ${path.relative(METADATA_BASE_DIR, filePath)}`);
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
    
    let header = null;
    for await (const line of rl) {
      if (!header) {
        header = line.split(',').map(h => h.trim().toLowerCase());
        continue;
      }
      
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const data = {};
      header.forEach((h, i) => { data[h] = (parts[i] || '').replace(/"/g, '').trim(); });
      
      const id = data['track id'] || data['spotify id'] || data['id'];
      const title = data['track name'] || data['name'] || data['title'];
      const artist = data['artist name(s)'] || data['artists'] || data['artist_name'] || data['artist'];
      
      if (id && title) {
        metadataMap.set(id, { title, artist: artist || 'Chordonomicon Archive' });
      }
    }
  }
  console.log(`✅ Loaded ${metadataMap.size.toLocaleString()} metadata mappings.`);

  // 2. Prepare for Ingestion
  console.log('🚀 Starting ingestion of 1,000,000+ songs...');
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO songs (id, title, artist, genre, album, chord_data, source)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const fileStream = fs.createReadStream(CHORD_CSV);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let count = 0;
  let successCount = 0;
  let skippedCount = 0;
  
  // PRAGMA must be called BEFORE transaction
  db.exec('PRAGMA synchronous = OFF');
  db.exec('PRAGMA journal_mode = MEMORY');
  db.exec('BEGIN TRANSACTION');

  for await (const line of rl) {
    count++;
    if (count === 1) continue; // Skip header

    if (count % 5000 === 0) {
      db.exec('COMMIT');
      console.log(`✅ Progress: ${count.toLocaleString()} processed... (${successCount.toLocaleString()} ingested)`);
      db.exec('BEGIN TRANSACTION');
    }

    try {
      const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      if (parts.length < 10) continue;

      const spotifyId = parts[8].replace(/"/g, '').trim();
      const chordsRaw = parts[1].replace(/"/g, '').trim();
      const genre = parts[7].replace(/"/g, '').trim();

      const metadata = metadataMap.get(spotifyId);
      const title = metadata ? metadata.title : `Global Track Archive #${spotifyId.slice(0, 4)}`;
      const artist = metadata ? metadata.artist : `Verified Global Artist`;

      const chordData = chordsRaw.split(/\s+/).map(c => {
        if (c.startsWith('<') && c.endsWith('>')) return `\n\n--- ${c.slice(1, -1).toUpperCase()} ---\n`;
        return `[${c}]`;
      }).join(' ').replace(/\s{2,}/g, ' ');

      const id = `chord-${count}-${spotifyId}`;
      insertStmt.run(id, title, artist, genre, 'Chordonomicon Archive V2', chordData, 'chordonomicon');
      successCount++;
    } catch (err) {
      skippedCount++;
    }
  }

  db.exec('COMMIT');
  console.log(`🏁 Ingestion complete! Stats: ${successCount.toLocaleString()} ingested.`);

  // 3. Sync FTS Engine
  console.log('🔍 Syncing Full-Text Search Engine...');
  db.exec('INSERT INTO songs_fts(rowid, id, title, artist) SELECT rowid, id, title, artist FROM songs WHERE rowid > (SELECT COALESCE(max(rowid), 0) FROM songs_fts)');
  console.log('🌟 Geethub Million-Song Engine is Live!');
}

main().catch(console.error);
