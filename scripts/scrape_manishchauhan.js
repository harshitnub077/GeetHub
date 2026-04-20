const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const USER_URL_BASE = 'https://wrytin.com/manishchauhan';
const BASE_URL = 'https://wrytin.com';
const SONGS_FILE = path.join(__dirname, '../src/data/songs.json');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function scrapeUser() {
  try {
    let songs = [];
    try {
      songs = JSON.parse(fs.readFileSync(SONGS_FILE, 'utf8'));
    } catch (e) {
      console.error('Could not read songs.json');
      return;
    }
    
    let added = 0;
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const urlToFetch = `${USER_URL_BASE}?page=${page}`;
      console.log(`\n--- Fetching Page ${page} (${urlToFetch}) ---`);
      
      let homeRes;
      try {
        homeRes = await axios.get(urlToFetch, { timeout: 15000 });
      } catch (err) {
        console.error(`Failed to fetch page ${page}. Error: ${err.message}. Retrying next time...`);
        break; // Stop paginating if the main page fails
      }
      
      let $ = cheerio.load(homeRes.data);
      
      const chordLinks = new Set();
      
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.toLowerCase().includes('chords')) {
          const absoluteUrl = href.startsWith('http') ? href : `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
          chordLinks.add(absoluteUrl);
        }
      });
      
      const urlsToScrape = Array.from(chordLinks);
      console.log(`Found ${urlsToScrape.length} chord articles on page ${page}.`);
      
      if (urlsToScrape.length === 0) {
        console.log('No more chord links found. Reached the end of the profile.');
        hasMorePages = false;
        break;
      }

      for (let i = 0; i < urlsToScrape.length; i++) {
        const url = urlsToScrape[i];
        console.log(`[Page ${page} - ${i+1}/${urlsToScrape.length}] Fetching ${url}...`);
        
        try {
          const articleRes = await axios.get(url, { timeout: 15000 });
          const _$ = cheerio.load(articleRes.data);
          
          const fullTitle = _$('h1').text().trim();
          
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
          
          if (songs.some(s => s.id === id)) {
             console.log(`Song "${title}" already in database. Skipping.`);
             continue;
          }
          
          let rawContent = '';
          _$('p, pre').each((idx, el) => {
             rawContent += _$(el).text() + '\n';
          });
          
          if (rawContent.trim() !== '') {
              let formattedChords = rawContent.trim();
              formattedChords = formattedChords.replace(/\(\s*([A-G][#b]?(?:m|maj|min|aug|dim|sus)?[0-9]*)\s*\)/g, '[$1]');
              
              songs.push({
                id: id,
                title: title,
                artist: artist,
                genre: "Bollywood",
                contributor_username: "manishchauhan",
                source_url: url,
                chord_data: formattedChords
              });
              added++;
              console.log(`SUCCESS: Added "${title}" by ${artist}`);
              
              fs.writeFileSync(SONGS_FILE, JSON.stringify(songs, null, 2), 'utf8');
          } else {
              console.log(`No readable content found for ${url}`);
          }
          
        } catch (err) {
           console.error(`Error fetching ${url}: ${err.message}`);
        }
        
        await delay(500);
      }
      
      page++;
    }
    
    console.log(`\nDone! Successfully added ${added} songs from user manishchauhan across all pages.`);
    
  } catch (error) {
    console.error('Error in scraper:', error.message);
  }
}

scrapeUser();
