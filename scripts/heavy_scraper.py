import aiohttp
import asyncio
import json
import re
import os
from bs4 import BeautifulSoup

URLS_FILE = 'scripts/bollywood_urls.txt'
OUTPUT_FILE = 'scripts/scraped_songs_final.json'
BATCH_SIZE = 100
CONCURRENCY_LIMIT = 40

HEADERS_LIST = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
]

CHORD_REGEX = re.compile(r'\b[A-G][b#]?(?:m|maj|min|dim|aug|sus|M)?(?:\d{1,2})?(?:[b#]\d{1,2})?(?:/[A-G][b#]?)?\b')

def clean_text(text):
    return re.sub(r'\s+', ' ', text).strip()

def bracketize_chords(text):
    lines = text.split('\n')
    new_lines = []
    for line in lines:
        words = line.split()
        if not words:
            new_lines.append(line)
            continue
        
        chord_count = sum(1 for w in words if CHORD_REGEX.fullmatch(w))
        if chord_count / len(words) > 0.5:
            new_line = " ".join([f"[{w}]" if CHORD_REGEX.fullmatch(w) else w for w in words])
            new_lines.append(new_line)
        else:
            new_lines.append(line)
    return '\n'.join(new_lines)

def parse_guitartwitt(soup):
    title_tag = soup.select_one('h1.entry-title')
    content_tag = soup.select_one('.entry-content')
    if not title_tag or not content_tag: return None
    
    title_raw = title_tag.get_text()
    parts = re.split(r'[|–-]', title_raw)
    title = clean_text(parts[0])
    artist = clean_text(parts[-1]) if len(parts) > 1 else "Unknown Artist"
    artist = re.sub(r'Guitar Chords', '', artist, flags=re.I).strip()
    
    chord_data = bracketize_chords(content_tag.get_text('\n'))
    return {"title": title, "artist": artist, "chord_data": chord_data, "genre": "Bollywood", "source": "guitartwitt"}

def parse_tabandchord(soup):
    title_tag = soup.select_one('h1.cm-page-title')
    content_tag = soup.select_one('.cm-page-content')
    if not title_tag or not content_tag: return None
    
    title_raw = title_tag.get_text()
    parts = re.split(r'[|–-]', title_raw)
    title = clean_text(parts[0])
    artist = clean_text(parts[-1]) if len(parts) > 1 else "Unknown Artist"
    
    chord_data = bracketize_chords(content_tag.get_text('\n'))
    return {"title": title, "artist": artist, "chord_data": chord_data, "genre": "Bollywood", "source": "tabandchord"}

async def fetch_song(session, url, semaphore):
    async with semaphore:
        headers = {"User-Agent": HEADERS_LIST[hash(url) % len(HEADERS_LIST)]}
        try:
            async with session.get(url, headers=headers, timeout=12) as response:
                if response.status == 200:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    if 'guitartwitt.com' in url: return parse_guitartwitt(soup)
                    elif 'tabandchord.com' in url: return parse_tabandchord(soup)
        except: pass
        return None

async def main():
    if not os.path.exists(URLS_FILE): return
    with open(URLS_FILE, 'r') as f:
        urls = [line.strip() for line in f if line.strip()]
    
    # Load existing songs to avoid duplication and lost progress
    songs = []
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r') as f:
                songs = json.load(f)
        except: pass
        
    print(f"Resuming scrape. Current count: {len(songs)}. Concurrency: {CONCURRENCY_LIMIT}")
    
    semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)
    async with aiohttp.ClientSession() as session:
        for i in range(0, len(urls), BATCH_SIZE):
            batch = urls[i:i+BATCH_SIZE]
            tasks = [fetch_song(session, url, semaphore) for url in batch]
            results = await asyncio.gather(*tasks)
            
            for res in results:
                if res and len(res['chord_data']) > 200:
                    songs.append(res)
            
            print(f"Progress: {i + BATCH_SIZE}/{len(urls)}. Found {len(songs)} songs.")
            with open(OUTPUT_FILE, 'w') as f:
                json.dump(songs, f, indent=2)
            
            if len(songs) >= 11000:
                print("Target reached!")
                break
                
            await asyncio.sleep(0.2)

    print(f"Scrape complete! Total: {len(songs)}")

if __name__ == "__main__":
    asyncio.run(main())
