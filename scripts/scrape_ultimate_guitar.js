const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const songsFilePath = path.join(__dirname, '../src/data/songs.json');

// Configuration
const BASE_URL = 'https://www.ultimate-guitar.com/top/tabs';
const CONTRIBUTOR_NAME = 'harshit';
const DELAY_BETWEEN_SONGS_MS = 5000; // 5 seconds to prevent immediate bans

// Utility to pause execution
const delay = ms => new Promise(res => setTimeout(res, ms));

async function scrapeTopTabs() {
  console.log('Launching browser with stealth capabilities...');
  const browser = await puppeteer.launch({
    headless: false, // Run in headful mode to solve captchas manually if required
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');

  try {
    console.log(`Navigating to ${BASE_URL}...`);
    console.log('IMPORTANT: If a CAPTCHA appears in the browser, please solve it manually. You have 2 minutes.');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });

    // Wait for at least one tab link to appear (giving time to solve CAPTCHA)
    await page.waitForFunction(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.some(a => a.href && a.href.includes('/tab/') && !a.href.includes('/pro/') && !a.href.includes('/official/'));
    }, { timeout: 120000 });

    console.log('Extracting song links from the top tabs page...');
    const tabLinks = await page.evaluate(() => {
      const links = [];
      const anchors = document.querySelectorAll('a');
      anchors.forEach(a => {
        const href = a.href;
        if (href && href.includes('/tab/') && !href.includes('/pro/') && !href.includes('/official/')) {
          links.push(href);
        }
      });
      // Deduplicate links
      return [...new Set(links)];
    });

    console.log(`Found ${tabLinks.length} potential tab links.`);

    // Read existing database to avoid duplicates
    let songsData = [];
    try {
      songsData = JSON.parse(fs.readFileSync(songsFilePath, 'utf8'));
    } catch (e) {
      console.log('Could not read existing songs.json, starting fresh or check path.');
    }

    const existingUrls = new Set(songsData.map(s => s.ug_url).filter(Boolean));

    for (let i = 0; i < tabLinks.length; i++) {
      const url = tabLinks[i];
      
      if (existingUrls.has(url)) {
        console.log(`[${i+1}/${tabLinks.length}] Skipping (already scraped): ${url}`);
        continue;
      }

      console.log(`\n[${i+1}/${tabLinks.length}] Navigating to song: ${url}`);
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
        
        // Ultimate guitar uses window.UGAPP.store for its data
        console.log('Extracting chord data from window.UGAPP...');
        const songData = await page.evaluate(() => {
          if (!window.UGAPP || !window.UGAPP.store || !window.UGAPP.store.page) {
            return null;
          }
          const pageData = window.UGAPP.store.page.data;
          if (!pageData || !pageData.tab_view || !pageData.tab_view.wiki_tab) {
            return null;
          }

          const rawContent = pageData.tab_view.wiki_tab.content;
          const artist = pageData.tab?.artist_name || "Unknown Artist";
          const title = pageData.tab?.song_name || "Unknown Song";
          
          return { artist, title, rawContent };
        });

        if (songData && songData.rawContent) {
          // Format the raw content: Convert [ch]C[/ch] to [C]
          let formattedChords = songData.rawContent
            .replace(/\\[ch\\]/g, '[')
            .replace(/\\[\\/ch\\]/g, ']')
            .replace(/\\[tab\\]/g, '')
            .replace(/\\[\\/tab\\]/g, '');

          // Generate ID
          const id = songData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

          // Check if title already exists to prevent duplicate titles with different URLs
          const titleExists = songsData.some(s => s.title.toLowerCase() === songData.title.toLowerCase());
          
          if (!titleExists) {
            const newSongEntry = {
              id: id,
              title: songData.title,
              artist: songData.artist,
              genre: "Popular", // Generic genre for top tabs
              contributor_username: CONTRIBUTOR_NAME,
              ug_url: url, // Store URL to prevent rescraping
              chord_data: formattedChords
            };

            songsData.push(newSongEntry);
            
            // Save after every successful extraction to avoid losing data on crash
            fs.writeFileSync(songsFilePath, JSON.stringify(songsData, null, 2), 'utf8');
            console.log(`SUCCESS: Added "${songData.title}" by ${songData.artist} (Contributor: ${CONTRIBUTOR_NAME})`);
          } else {
             console.log(`Song "${songData.title}" already exists in the database. Skipping.`);
          }
        } else {
          console.log(`Failed to extract data for ${url}. It might be a Pro tab or official tab.`);
        }
      } catch (err) {
        console.error(`Error scraping ${url}:`, err.message);
      }

      console.log(`Waiting ${DELAY_BETWEEN_SONGS_MS / 1000} seconds before next request...`);
      await delay(DELAY_BETWEEN_SONGS_MS);
    }
    
    console.log('\n--- Scraping Complete ---');

  } catch (error) {
    console.error('Critical Error during scraping:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

scrapeTopTabs();
