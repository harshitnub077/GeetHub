const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const SONGS_FILE = path.join(__dirname, '../src/data/songs.json');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function scrapeUser() {
  let browser;
  try {
    let songs = [];
    if (fs.existsSync(SONGS_FILE)) {
      try {
        songs = JSON.parse(fs.readFileSync(SONGS_FILE, 'utf8'));
      } catch (e) {
        console.error('Could not read songs.json');
        return;
      }
    }
    
    console.log('Launching Puppeteer browser...');
    // headless: 'new' is the modern headless mode
    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Visit the user page first to get cookies and bypass Cloudflare/401
    console.log('Visiting wrytin.com to establish session...');
    await page.goto('https://wrytin.com/dhruvi1', { waitUntil: 'networkidle2' });
    
    let allBlogs = [];
    let skip = 0;
    const limit = 50;
    
    while (true) {
        console.log(`Fetching API with skip=${skip} and limit=${limit}...`);
        const apiResText = await page.evaluate(async (s, l) => {
          try {
            const res = await fetch(`https://wrytin.com/api/users/dhruvi1/blogs?skip=${s}&limit=${l}`);
            return await res.text();
          } catch (e) {
            return "ERROR: " + e.message;
          }
        }, skip, limit);
        
        let apiRes;
        try {
            apiRes = JSON.parse(apiResText);
        } catch(e) {
            console.log("Failed to parse JSON API response");
            break;
        }
        
        if (apiRes.error) {
            console.log("API returned error:", apiRes.error.errmsg || apiRes.error);
            break;
        }
        
        const blogsChunk = apiRes.blogs || [];
        if (blogsChunk.length === 0) {
            break;
        }
        
        allBlogs.push(...blogsChunk);
        skip += limit;
        await delay(500);
    }
    
    const blogs = allBlogs;
    console.log(`Found ${blogs.length} articles from API.`);
    
    let added = 0;

    for (let i = 0; i < blogs.length; i++) {
      const blog = blogs[i];
      const url = `https://wrytin.com/dhruvi1/${blog.url}`;
      
      const fullTitle = blog.title.trim();
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
         console.log(`[${i+1}/${blogs.length}] Song "${title}" already in database. Skipping.`);
         continue;
      }
      
      console.log(`[${i+1}/${blogs.length}] Fetching ${url}...`);
      
      try {
        // Instead of navigating for every single page which is slow, we can just fetch it inside the page context!
        // This is much faster and still uses the browser's cookies and User-Agent!
        const rawContent = await page.evaluate(async (fetchUrl) => {
           const res = await fetch(fetchUrl);
           const html = await res.text();
           const parser = new DOMParser();
           const doc = parser.parseFromString(html, 'text/html');
           let text = '';
           doc.querySelectorAll('p, pre').forEach(el => text += el.textContent + '\n');
           return text;
        }, url);
        
        // Anti-bot detection check
        if (rawContent.includes('Dil ki baatein') && rawContent.includes('Hum toh tere')) {
            console.log('\nWARNING: Caught anti-bot fake lyrics! Wrytin detected the scraper.');
            break; 
        }

        if (rawContent.trim() !== '') {
            let formattedChords = rawContent.trim();
            formattedChords = formattedChords.replace(/\(\s*([A-G][#b]?(?:m|maj|min|aug|dim|sus)?[0-9]*)\s*\)/gi, '[$1]');
            
            songs.push({
              id: id,
              title: title,
              artist: artist,
              genre: "Bollywood",
              contributor_username: "dhruvi1",
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
      
      await delay(500); // 0.5s delay to be polite
    }
    
    console.log(`\nDone! Successfully added ${added} songs from user dhruvi1.`);
    
  } catch (error) {
    console.error('Error in scraper:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

scrapeUser();
