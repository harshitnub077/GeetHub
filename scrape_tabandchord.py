import asyncio
import aiohttp
from bs4 import BeautifulSoup
import sqlite3
import uuid
import re
import logging
import xml.etree.ElementTree as ET

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

DB_FILE = 'geethub_master.db'
SITEMAP_URLS = [
    'https://tabandchord.com/post-sitemap3.xml',
    'https://tabandchord.com/post-sitemap2.xml',
    'https://tabandchord.com/post-sitemap.xml'
]

async def fetch_urls():
    urls = []
    connector = aiohttp.TCPConnector(ssl=False)
    async with aiohttp.ClientSession(connector=connector) as session:
        for sitemap_url in SITEMAP_URLS:
            if len(urls) >= 500:
                break
            try:
                async with session.get(sitemap_url) as response:
                    content = await response.text()
                    root = ET.fromstring(content)
                    namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
                    for loc in root.findall('.//ns:loc', namespace):
                        if len(urls) >= 500:
                            break
                        urls.append(loc.text)
            except Exception as e:
                logging.error(f"Error fetching sitemap {sitemap_url}: {e}")
    return urls[:500]

async def scrape_song(session, url):
    try:
        async with session.get(url, timeout=10) as response:
            if response.status != 200:
                return None
            html = await response.text()
            soup = BeautifulSoup(html, 'lxml')
            
            title_tag = soup.find('meta', property='og:title')
            title = title_tag['content'] if title_tag else "Unknown Title"
            title = title.split(' Guitar Tabs')[0].split(' Chords')[0].split(' – ')[0].strip()
            
            content_div = soup.find('div', class_='entry-content') or soup.find('div', class_='post-content')
            if not content_div:
                paragraphs = soup.find_all('p')
            else:
                paragraphs = content_div.find_all('p')
                
            chord_data = []
            for p in paragraphs:
                text = p.get_text(separator='\n').strip()
                if "Click to Download" in text or "tabandchord" in text.lower() or "easy lesson" in text:
                    continue
                if len(text) > 5:
                    chord_data.append(text)
            
            full_text = "\n\n".join(chord_data)
            
            if len(full_text) > 50:
                return {
                    'title': title,
                    'artist': 'Various Indian Artists',
                    'chord_data': full_text
                }
    except Exception as e:
        pass
    return None

async def main():
    logging.info("Fetching sitemap URLs...")
    urls = await fetch_urls()
    logging.info(f"Found {len(urls)} URLs to scrape.")
    
    songs = []
    connector = aiohttp.TCPConnector(limit=20, ssl=False)
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = [scrape_song(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
        for res in results:
            if res:
                songs.append(res)
                
    logging.info(f"Successfully scraped {len(songs)} songs.")
    
    if songs:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        batch = []
        for s in songs:
            batch.append((
                str(uuid.uuid4()),
                s['title'],
                s['artist'],
                'tabandchord_latest',
                s['chord_data'],
                'system_importer'
            ))
        cursor.executemany('''
            INSERT INTO songs (id, title, artist, source, chord_data, contributor_username)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', batch)
        conn.commit()
        
        logging.info("Optimizing FTS index...")
        cursor.execute("INSERT INTO songs_fts(songs_fts) VALUES('optimize')")
        conn.commit()
        conn.close()
        
    logging.info("Done!")

if __name__ == "__main__":
    asyncio.run(main())
