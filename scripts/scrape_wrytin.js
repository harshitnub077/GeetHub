const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://wrytin.com';
const SONGS_FILE = path.join(__dirname, '../src/data/songs.json');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function scrapeWrytin() {
  try {
    console.log(`Fetching homepage of ${BASE_URL}...`);
    const homeRes = await axios.get(BASE_URL);
    let $ = cheerio.load(homeRes.data);
    
    // Find all links that might be chords
    const chordLinks = new Set();
    
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.toLowerCase().includes('chords')) {
        // Resolve to absolute URL if needed
        const absoluteUrl = href.startsWith('http') ? href : `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
        chordLinks.add(absoluteUrl);
      }
    });
    
    // Convert to array
    const urlsToScrape = Array.from(chordLinks);
    console.log(`Found ${urlsToScrape.length} chord articles on the homepage.`);
    
    if (urlsToScrape.length === 0) {
      console.log('No chord links found. They might be loaded dynamically.');
      return;
    }

    let songs = [];
    try {
      songs = JSON.parse(fs.readFileSync(SONGS_FILE, 'utf8'));
    } catch (e) {
      console.error('Could not read songs.json');
      return;
    }
    
    let added = 0;

    for (let i = 0; i < urlsToScrape.length; i++) {
      const url = urlsToScrape[i];
      console.log(`[${i+1}/${urlsToScrape.length}] Fetching ${url}...`);
      
      try {
        const articleRes = await axios.get(url);
        const _$ = cheerio.load(articleRes.data);
        
        // Wrytin article title is usually in h1
        const fullTitle = _$('h1').text().trim();
        
        // Extract Artist and Song from "Song Name Chords - Artist/Movie"
        let title = fullTitle;
        let artist = "Unknown";
        
        if (fullTitle.includes('-')) {
            const parts = fullTitle.split('-');
            title = parts[0].replace(/chords/i, '').trim();
            artist = parts.slice(1).join('-').trim();
        } else {
            title = title.replace(/chords/i, '').trim();
        }
        
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        // Check if exists
        if (songs.some(s => s.id === id)) {
           console.log(`Song "${title}" already in database. Skipping.`);
           continue;
        }
        
        // Extract content (paragraphs)
        let rawContent = '';
        _$('p, pre').each((idx, el) => {
           rawContent += _$(el).text() + '\n';
        });
        
        // Basic formatting cleanup for Geethub
        // Wrytin often uses (Am) format instead of [Am]. We will convert them.
        if (rawContent.trim() !== '') {
            let formattedChords = rawContent.trim();
            formattedChords = formattedChords.replace(/\\(([A-G][#b]?(?:m|maj|min|aug|dim|sus)?[0-9]*)\\)/g, '[$1]');
            
            songs.push({
              id: id,
              title: title,
              artist: artist,
              genre: "Bollywood", // Defaulting as wrytin mostly has Bollywood chords
              contributor_username: "harshit",
              source_url: url,
              chord_data: formattedChords
            });
            added++;
            console.log(`SUCCESS: Added "${title}" by ${artist}`);
            
            // Save incrementally
            fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2), 'utf8');
        } else {
            console.log(`No readable content found for ${url}`);
        }
        
      } catch (err) {
         console.error(`Error fetching ${url}: ${err.message}`);
      }
      
      await delay(1000); // 1 sec delay to be polite
    }
    
    console.log(`\nDone! Successfully added ${added} songs from Wrytin.`);
    
  } catch (error) {
    console.error('Error in scraper:', error.message);
  }
}

scrapeWrytin();
