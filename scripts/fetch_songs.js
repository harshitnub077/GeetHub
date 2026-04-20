const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const songsFilePath = path.join(__dirname, '../src/data/songs.json');

// Example usage: node fetch_songs.js "Song Name" "Artist Name"
const songName = process.argv[2];
const artistName = process.argv[3];

if (!songName) {
  console.log('Please provide a song name and artist.');
  console.log('Usage: node fetch_songs.js "Song Title" "Artist Name"');
  process.exit(1);
}

// NOTE: This is a basic template scraper.
// Scraping Ultimate Guitar directly might face Cloudflare protections.
// For a production 5000-song crawler, consider using Puppeteer and proxies.

async function fetchChords(title, artist) {
  try {
    const query = `${title} ${artist || ''} chords ultimate guitar`;
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    console.log(`Searching for: ${title} by ${artist || 'Unknown'}`);
    
    const searchRes = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    
    const $ = cheerio.load(searchRes.data);
    let ugLink = null;
    
    $('a.result__url').each((i, el) => {
      const link = $(el).attr('href');
      if (link && link.includes('tabs.ultimate-guitar.com/tab/')) {
        ugLink = link;
        return false; // break
      }
    });
    
    if (!ugLink) {
      console.log('Could not find chords for this song.');
      return;
    }
    
    console.log(`Found link: ${ugLink}`);
    // Extracting chords from the UG page would go here.
    // However, UG uses a complex React store.
    // As a placeholder, we log success and append a dummy object to show functionality.
    
    console.log('To fully parse chords, use Puppeteer to evaluate window.UGAPP.store.page.data.tab_view.wiki_tab.content');
    
    // Simulate appending to DB
    const songsData = fs.readFileSync(songsFilePath, 'utf8');
    let songs = JSON.parse(songsData);
    
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!songs.some(s => s.id === id)) {
      songs.push({
        id: id,
        title: title,
        artist: artist || 'Unknown',
        genre: 'Scraped',
        contributor_username: 'auto_scraper',
        chord_data: '[Verse 1]\n[C]Scraped chords will go here\n[G]Requires Puppeteer for UG React Store'
      });
      fs.writeFileSync(songsFilePath, JSON.stringify(songs, null, 2), 'utf8');
      console.log(`Added ${title} to database.`);
    } else {
      console.log(`${title} already exists in database.`);
    }
    
  } catch (err) {
    console.error('Error fetching chords:', err.message);
  }
}

fetchChords(songName, artistName);
