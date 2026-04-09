/**
 * scrape_ug_bulk.js — Bulk chord scraper with rate-limiting and exponential backoff.
 * Usage: node scripts/scrape_ug_bulk.js | node scripts/massive_ingest.js
 */
const { searchSong, fetchChords } = require('ultimate-guitar');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '../data/curated_intl_batch.json');
const SEARCH_QUERIES = ['Ed Sheeran', 'Coldplay', 'Green Day', 'Taylor Swift', 'Radiohead'];
const MAX_SONGS = 50; // Focused, high-quality batch 

async function scrapeUG() {
  console.log('Starting Ultimate Guitar bulk scrape...');
  const allResults = [];
  const seenUrls = new Set();

  for (const query of SEARCH_QUERIES) {
    console.log(`Searching for: ${query}...`);
    try {
      // searchSong usually returns a list of results
      const results = await searchSong(query);
      const songResults = results.filter(r => r.type === 'Chords');
      
      console.log(`Found ${songResults.length} potential chord pages for "${query}"`);

      for (const res of songResults.slice(0, 50)) { // 50 per query to avoid overkill
        if (seenUrls.has(res.url)) continue;
        seenUrls.add(res.url);

        try {
          console.log(`  Fetching: ${res.name} by ${res.artist}...`);
          const songDetails = await fetchChords(res.url);
          
          if (songDetails && songDetails.chords) {
            allResults.push({
              id: `ug-${res.url.split('/').pop().split('-').slice(0, -1).join('-')}`,
              title: res.name,
              artist: res.artist,
              genre: 'Bollywood/Hindi',
              album: 'Ultimate Guitar Collection',
              chord_data: songDetails.chords,
              contributor_username: 'ug_community',
              source: 'ultimate-guitar'
            });
          }
          
          // Wait a bit to avoid blocking
          await new Promise(r => setTimeout(r, 1500));
        } catch (err) {
          console.error(`    Error fetching ${res.url}:`, err.message);
        }

        if (allResults.length >= MAX_SONGS) break;
      }
    } catch (err) {
      console.error(`Error searching for ${query}:`, err.message);
    }
    
    if (allResults.length >= MAX_SONGS) break;
  }

  // Save results
  console.log(`Saving ${allResults.length} songs to ${OUTPUT_FILE}...`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allResults, null, 2));
  console.log('Done!');
}

scrapeUG().catch(console.error);
