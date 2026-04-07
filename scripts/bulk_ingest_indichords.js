const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'geethub_master.db');

async function ingestSong(url, db) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const html = await res.text();

    // Extract Title using Regex - <h1> inside <article>
    const titleMatch = html.match(/<article[^>]*>[\s\S]*?<h1>([^<]+)<\/h1>/i);
    let title = titleMatch ? titleMatch[1].trim() : '';

    // Extract Artist using Regex - <p class="song-meta">
    const artistMatch = html.match(/<p class=\"song-meta\">([\s\S]*?)<\/p>/i);
    let artist = artistMatch ? artistMatch[1].trim() : 'Various Artists';
    // Clean artist slug if it's a link or hyphenated
    artist = artist.replace(/<[^>]+>/g, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    // Extract Chord Data using Regex - <div id="mainData">
    const contentMatch = html.match(/<div [^>]*id=\"mainData\"[^>]*>([\s\S]+?)<\/div>/i);
    let rawContent = contentMatch ? contentMatch[1].trim() : '';

    if (!title || !rawContent || rawContent.length < 50) return null;

    // Convert <h7>Chord</h7> to [Chord] for Geethub format
    let chordData = rawContent.replace(/<h7>([\s\S]*?)<\/h7>/gi, '[$1]')
                            .replace(/<script[\s\S]*?<\/script>/gi, '')
                            .replace(/<style[\s\S]*?<\/style>/gi, '')
                            .replace(/<[^>]+>/g, '')
                            .replace(/&nbsp;/g, ' ')
                            .replace(/\s+/g, ' ').trim();

    const id = url.split('/').filter(Boolean).pop() || Date.now().toString();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO songs (id, title, artist, chord_data, source)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, title, artist, chordData, 'indichords-native-v2');
    return { id, title, artist };
  } catch (err) {
    console.error('Error ingesting', url, err.message);
    return null;
  }
}

async function main() {
  const songsFile = 'data/indichords_songs_to_scrape.txt';
  if (!fs.existsSync(songsFile)) {
    console.error('Songs file not found:', songsFile);
    process.exit(1);
  }
  
  const urls = fs.readFileSync(songsFile, 'utf8').split('\n').filter(Boolean);
  const db = new DatabaseSync(DB_PATH);
  
  console.log('Starting ingestion of', urls.length, 'songs...');
  
  let successCount = 0;
  for (let i = 0; i < urls.length; i++) {
    const result = await ingestSong(urls[i], db);
    if (result) {
      successCount++;
      if (successCount % 20 === 0) {
        console.log(`Ingested ${successCount} songs... Latest: ${result.title}`);
      }
    }
  }
  
  console.log('Ingestion complete! Total new songs added:', successCount);
}

main();
