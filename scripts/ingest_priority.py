import aiohttp
import asyncio
import json
import re
import os
import sqlite3
from bs4 import BeautifulSoup

DB_PATH = 'geethub_master.db'
PRIORITY_LIST_FILE = 'scripts/priority_100_list.txt'
URLS_FILE = 'scripts/bollywood_urls.txt'

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
}

CHORD_REGEX = re.compile(r'\b[A-G][b#]?(?:m|maj|min|dim|aug|sus|M)?(?:\d{1,2})?(?:[b#]\d{1,2})?(?:/[A-G][b#]?)?\b')

def bracketize_chords(text):
    lines = text.split('\n')
    new_lines = []
    for line in lines:
        words = line.split()
        if not words:
            new_lines.append(line)
            continue
        chord_count = sum(1 for w in words if CHORD_REGEX.fullmatch(w))
        if len(words) > 0 and chord_count / len(words) > 0.5:
            new_line = " ".join([f"[{w}]" if CHORD_REGEX.fullmatch(w) else w for w in words])
            new_lines.append(new_line)
        else:
            new_lines.append(line)
    return '\n'.join(new_lines)

async def fetch_and_parse(session, url, title_goal, artist_goal):
    try:
        async with session.get(url, headers=HEADERS, timeout=15) as r:
            if r.status == 200:
                html = await r.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # Broad selector logic
                content = soup.select_one('.entry-content') or soup.select_one('.cm-page-content') or soup.select_one('article')
                if not content: return None
                
                raw_text = content.get_text('\n')
                chord_data = bracketize_chords(raw_text)
                
                if len(chord_data) < 200: return None
                
                return {
                    "id": f"PR-{hash(title_goal + artist_goal) % 10000000}",
                    "title": title_goal,
                    "artist": artist_goal,
                    "chord_data": chord_data,
                    "genre": "Priority",
                    "source": url
                }
    except:
        return None

async def main():
    with open(PRIORITY_LIST_FILE, 'r') as f:
        priority_lines = f.readlines()
        
    with open(URLS_FILE, 'r') as f:
        all_urls = f.readlines()

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    async with aiohttp.ClientSession() as session:
        for line in priority_lines:
            parts = line.strip().split(',')
            if len(parts) < 4: continue
            title = parts[1]
            artist = parts[3]
            
            # Check if already in DB
            cursor.execute("SELECT id FROM songs WHERE title = ? AND artist = ?", (title, artist))
            if cursor.fetchone():
                continue

            # Try to find URL
            match_url = None
            # Search by title in URL
            slug = title.lower().replace(' ', '-')
            for u in all_urls:
                if slug in u.lower():
                    match_url = u.strip()
                    break
            
            if match_url:
                print(f"Scraping priority: {title} from {match_url}...")
                song = await fetch_and_parse(session, match_url, title, artist)
                if song:
                    try:
                        cursor.execute("""
                            INSERT INTO songs (id, title, artist, chord_data, genre, source, created_at)
                            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
                        """, (song['id'], song['title'], song['artist'], song['chord_data'], song['genre'], song['source']))
                        print(f"✅ Ingested: {title}")
                    except:
                        pass
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    asyncio.run(main())
