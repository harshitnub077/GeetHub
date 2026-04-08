const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const DB_PATH = path.join(__dirname, '../geethub_master.db');
const MANIFEST_PATH = path.join(__dirname, '../data/songs_manifest.json');
const INDICHORDS_SITEMAP = 'https://indichords.com/sitemap.xml';

async function getSitemap() {
  console.log('Fetching Indichords Sitemap...');
  try {
    const res = await axios.get(INDICHORDS_SITEMAP);
    const $ = cheerio.load(res.data, { xmlMode: true });
    const urls = [];
    $('loc').each((i, el) => {
      const url = $(el).text();
      if (url.includes('/song/')) urls.push(url);
    });
    return urls;
  } catch (err) {
    console.error('Error fetching sitemap:', err.message);
    return [];
  }
}

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           
    .replace(/[^\w\-]+/g, '')       
    .replace(/\-\-+/g, '-')         
    .replace(/^-+/, '')             
    .replace(/-+$/, '');            
}

async function scrapeSong(url) {
  try {
    const res = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(res.data);
    const article = $('article');
    if (!article.length) return null;

    const title = article.find('h1').text().trim() || url.split('/').pop().replace(/-/g, ' ');
    const meta = article.find('p.song-meta').text().trim();
    const artist = meta.replace('Artist:', '').trim() || 'Various Artists';
    const lyricsDiv = article.find('div.lyrics');

    let chordData = '';
    lyricsDiv.contents().each((i, el) => {
      if (el.name === 'h7') {
        const text = $(el).text().trim();
        chordData += text.startsWith('[') ? text : `[${text}]`;
      } else if (el.name === 'br') {
        chordData += '\n';
      } else if (el.type === 'text') {
        chordData += el.data;
      } else if (['div', 'p'].includes(el.name)) {
        chordData += $(el).text();
      }
    });

    return {
      title,
      artist,
      chord_data: chordData.replace(/\xA0/g, ' ').trim(),
      source: 'indichords'
    };
  } catch (err) {
    return null;
  }
}

async function run() {
  const db = new DatabaseSync(DB_PATH);
  
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('Manifest not found. Run manifest generator first.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const sitemapUrls = await getSitemap();
  
  console.log(`Starting Batch 1: Songs from manifest...`);
  let successCount = 0;
  
  // Batch limit: 1-500
  const batch = manifest.slice(0, 500);

  for (const item of batch) {
    const titleSlug = slugify(item.title);
    const movieSlug = slugify(item.movie);
    
    // Improved matching: Check if slug contains the title OR title contains the slug
    // AND try to match movie if possible
    const match = sitemapUrls.find(u => {
      const urlPart = u.split('/').pop().toLowerCase();
      // Require more significant match: first 3 words of title slug in urlPart
      const titleWords = titleSlug.split('-').slice(0, 2).join('-');
      return urlPart.includes(titleWords);
    });

    if (match) {
      console.log(`Matching: ${item.title} -> ${match}`);
      const data = await scrapeSong(match);
      if (data && data.chord_data) {
        try {
          db.prepare(`
            INSERT INTO songs (id, title, artist, chord_data, genre, source, bpm, music_key)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET chord_data=excluded.chord_data
          `).run(
            `ic-${titleSlug}-${item.idx}`,
            data.title,
            data.artist,
            data.chord_data,
            'Bollywood',
            'indichords',
            90,
            'C'
          );
          successCount++;
          console.log(`   [SUCCESS] ${item.title} ingested.`);
        } catch (e) {
          console.error(`   [ERROR] Database insert failed for ${item.title}:`, e.message);
        }
      }
      // Delay to avoid rate limits
      await new Promise(r => setTimeout(r, 1000));
    } else {
      console.log(`No match for: ${item.title}`);
    }
  }

  console.log(`Batch 1 Complete. Ingested ${successCount} songs.`);
}

run().catch(console.error);
