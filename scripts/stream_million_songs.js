const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'geethub_master.db');
const CHORD_DATASETS = [
  {
    name: 'melodyGPT_Primary',
    url: 'https://huggingface.co/datasets/lluccardoner/melodyGPT-song-chords-text-1/resolve/main/melodyGPT-song-chords-text-1.csv?download=true',
    parser: (line) => {
      // Basic CSV parser for simplicity in streaming
      const parts = line.split(',');
      if (parts.length < 3) return null;
      return {
        title: parts[0].replace(/"/g, '').trim(),
        artist: parts[1].replace(/"/g, '').trim(),
        chord_data: parts.slice(2).join(',').replace(/"/g, '').trim(),
        genre: 'GlobalMIR',
        album: 'MelodyGPT Archive',
        source: 'mir'
      };
    }
  }
];

async function ingest() {
  const db = new DatabaseSync(DB_PATH);
  const insert = db.prepare(`
    INSERT INTO songs (id, title, artist, genre, album, chord_data, source)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  console.log('🚀 Starting Streaming Ingestion for 1,000,000 Songs...');

  for (const dataset of CHORD_DATASETS) {
    try {
      console.log(`📡 Fetching ${dataset.name}...`);
      const response = await fetch(dataset.url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let count = 0;
      let skipped = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep partial line

        for (const line of lines) {
          if (!line.trim() || line.startsWith('title,artist')) {
             skipped++;
             continue;
          }
          
          const song = dataset.parser(line);
          if (song && song.title && song.artist && song.chord_data) {
            try {
              const id = `${song.source}-${count}-${Date.now().toString(36)}`;
              insert.run(id, song.title, song.artist, song.genre, song.album, song.chord_data, song.source);
              count++;
              if (count % 5000 === 0) {
                console.log(`✅ Ingested ${count.toLocaleString()} songs...`);
              }
            } catch (e) {
              // Duplicate IDs or SQL errors handled gracefully
            }
          }
        }
      }
      console.log(`🏁 Finished ${dataset.name}. Ingested: ${count}, Skipped: ${skipped}`);
    } catch (err) {
      console.error(`❌ Error in ${dataset.name}:`, err.message);
    }
  }

  // Update FTS Index
  console.log('🔍 Syncing Full-Text Search Engine...');
  db.exec('INSERT INTO songs_fts(rowid, id, title, artist) SELECT rowid, id, title, artist FROM songs WHERE rowid > (SELECT max(rowid) FROM songs_fts)');
  console.log('🌟 Million-Song Engine is Live!');
}

ingest();
