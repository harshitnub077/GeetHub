import asyncio
import aiohttp
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
import json
import logging
import sys

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

SITEMAP_URL = "https://indichords.com/sitemap.xml"
OUTPUT_FILE = "indichords_songs.jsonl"
CONCURRENCY_LIMIT = 10

async def fetch_sitemap(session):
    logging.info(f"Fetching sitemap from {SITEMAP_URL}")
    async with session.get(SITEMAP_URL) as response:
        response.raise_for_status()
        content = await response.text()
        return content

def extract_song_urls(sitemap_xml):
    logging.info("Parsing sitemap XML")
    root = ET.fromstring(sitemap_xml)
    urls = []
    # Sitemap uses namespaces
    ns = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    for url in root.findall('ns:url/ns:loc', ns):
        loc = url.text
        if loc and "https://indichords.com/song/" in loc:
            urls.append(loc)
    logging.info(f"Found {len(urls)} song URLs")
    return urls

async def fetch_and_parse_song(session, url, sem, out_file):
    async with sem:
        try:
            async with session.get(url, timeout=20) as response:
                if response.status != 200:
                    logging.warning(f"Failed to fetch {url} - Status: {response.status}")
                    return
                html = await response.text()
                
                soup = BeautifulSoup(html, 'lxml')
                
                title_tag = soup.find('meta', property='og:title')
                title = title_tag['content'] if title_tag and title_tag.has_attr('content') else ""
                
                meta_tag = soup.find('p', class_='song-meta')
                meta = meta_tag.text.strip() if meta_tag else ""
                
                lyrics_div = soup.find('div', id='mainData', class_='lyrics')
                lyrics_html = str(lyrics_div) if lyrics_div else ""
                
                # To make it cleaner, let's keep both raw HTML for the chords and a textual version if needed.
                # However, raw HTML preserves the [G] etc tags perfectly.
                
                data = {
                    "url": url,
                    "title": title,
                    "artist_meta": meta,
                    "lyrics_html": lyrics_html
                }
                
                # Write to jsonl
                out_file.write(json.dumps(data) + "\n")
                out_file.flush()
                
        except Exception as e:
            logging.error(f"Error fetching {url}: {e}")

async def main():
    test_mode = "--test" in sys.argv
    
    connector = aiohttp.TCPConnector(ssl=False)
    async with aiohttp.ClientSession(connector=connector) as session:
        sitemap_content = await fetch_sitemap(session)
        urls = extract_song_urls(sitemap_content)
        
        if test_mode:
            urls = urls[:10]
            logging.info(f"Running in test mode. Only fetching {len(urls)} URLs.")
        
        sem = asyncio.Semaphore(CONCURRENCY_LIMIT)
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            tasks = []
            for i, url in enumerate(urls):
                tasks.append(fetch_and_parse_song(session, url, sem, f))
            
            logging.info(f"Starting to fetch {len(urls)} songs concurrently...")
            await asyncio.gather(*tasks)
            logging.info("Finished scraping.")

if __name__ == "__main__":
    asyncio.run(main())
