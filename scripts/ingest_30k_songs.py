import asyncio
import aiohttp
from bs4 import BeautifulSoup
import sqlite3
import uuid
import re
import html
import time
import os
import sys

DB_FILE = 'geethub_master.db'
TARGET_NEW_SONGS = 30000
CONCURRENCY = 8
BATCH_SIZE = 1000

CHORD_REGEX = re.compile(
    r'\b[A-G][b#]?(?:m|maj|min|dim|aug|sus|M)?(?:\d{1,2})?(?:[b#]\d{1,2})?(?:/[A-G][b#]?)?\b'
)

def slugify(text):
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text)[:45]

def bracketize(text):
    out = []
    for line in text.split('\n'):
        if re.match(r'^\s*\[[A-Za-z0-9\s]+\]\s*$', line):
            out.append(line.strip())
            continue
        words = [w.strip() for w in line.split() if w.strip()]
        if not words:
            out.append(line)
            continue
        chord_count = sum(1 for w in words if CHORD_REGEX.fullmatch(w))
        if len(words) > 0 and (chord_count / len(words) >= 0.5 or (len(words) <= 2 and chord_count >= 1)):
            new_line = ' '.join(f'[{w}]' if CHORD_REGEX.fullmatch(w) else w for w in words)
            out.append(new_line)
        else:
            out.append(line)
    return '\n'.join(out)

def estimate_difficulty(chord_data):
    chords = set(CHORD_REGEX.findall(chord_data))
    complex_chords = [c for c in chords if any(x in c for x in ['dim', 'aug', '7b', '9', '11', '13', 'maj7', '/'])]
    if len(complex_chords) > 3 or len(chords) > 8:
        return 'Advanced'
    elif len(chords) <= 4:
        return 'Beginner'
    return 'Intermediate'

def parse_chordzone_post(post):
    raw_title = post.get('title', {}).get('rendered', '')
    t = html.unescape(raw_title).strip()
    t = re.sub(r'Chords\s*(for\s*Piano\s*(?:&|and)\s*Guitar)?', '', t, flags=re.I).strip()
    t = re.sub(r'\s*\|\s*.*$', '', t).strip()
    parts = re.split(r'\s*[-–—]\s*', t, maxsplit=1)
    if len(parts) == 2:
        artist, song = parts[0].strip(), parts[1].strip()
    else:
        artist, song = 'Unknown Artist', t
        
    html_content = post.get('content', {}).get('rendered', '')
    if not html_content or len(html_content) < 150:
        return None
        
    soup = BeautifulSoup(html_content, 'html.parser')
    pre_tag = soup.find('pre')
    raw_text = pre_tag.get_text() if pre_tag else soup.get_text()
        
    cleaned_lines = []
    for line in raw_text.split('\n'):
        l_low = line.lower()
        if 'www.chordzone.org' in l_low or 'click here to download' in l_low:
            continue
        cleaned_lines.append(line)
        
    chord_text = '\n'.join(cleaned_lines).strip()
    if len(chord_text) < 150:
        return None
        
    formatted_chords = bracketize(chord_text)
    unique_chords = set(CHORD_REGEX.findall(formatted_chords))
    if len(unique_chords) < 2:
        return None
        
    return {
        "title": song.title() if song else "Untitled",
        "artist": artist.title() if artist else "Unknown Artist",
        "chord_data": formatted_chords,
        "genre": "Bollywood" if any(x in (artist + song).lower() for x in ['singh', 'kumar', 'shreya', 'arijit', 'sonu', 'armaan', 'pritam', 'sachet']) else "Pop",
        "difficulty": estimate_difficulty(formatted_chords),
        "source": "chordzone"
    }

def parse_guitartwitt_post(post):
    raw_title = post.get('title', {}).get('rendered', '')
    t = html.unescape(raw_title).strip()
    t = re.sub(r'\s*\|\s*.*$', '', t).strip()
    
    if any(k in t.lower() for k in ['lesson', 'riff', 'scale', 'exercise', 'how to play']):
        return None
        
    m = re.match(r'^(.*?)\s+Chords\s+(?:by|from)\s+(.*)$', t, re.I)
    if m:
        song, artist = m.group(1).strip(), m.group(2).strip()
    else:
        parts = re.split(r'\s*[-–—]\s*', t, maxsplit=1)
        if len(parts) == 2:
            artist, song = parts[0].strip(), parts[1].strip()
        else:
            artist, song = 'Unknown Artist', t
            
    song = re.sub(r'\s*Guitar Chords.*', '', song, flags=re.I).strip()
    song = re.sub(r'\s*Chords.*', '', song, flags=re.I).strip()
    
    html_content = post.get('content', {}).get('rendered', '')
    if not html_content or len(html_content) < 150:
        return None
        
    soup = BeautifulSoup(html_content, 'html.parser')
    content_div = soup.find('div', class_='entry-content') or soup
    raw_text = content_div.get_text()
    
    cleaned_lines = []
    for line in raw_text.split('\n'):
        if 'guitartwitt.com' in line.lower() or 'easy lesson' in line.lower():
            continue
        cleaned_lines.append(line)
        
    chord_text = '\n'.join(cleaned_lines).strip()
    if len(chord_text) < 150:
        return None
        
    formatted_chords = bracketize(chord_text)
    unique_chords = set(CHORD_REGEX.findall(formatted_chords))
    if len(unique_chords) < 2:
        return None
        
    return {
        "title": song.title() if song else "Untitled",
        "artist": artist.title() if artist else "Unknown Artist",
        "chord_data": formatted_chords,
        "genre": "Rock",
        "difficulty": estimate_difficulty(formatted_chords),
        "source": "guitartwitt"
    }

async def fetch_page(session, url, sem):
    async with sem:
        for attempt in range(3):
            try:
                headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}
                async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=20)) as resp:
                    if resp.status == 200:
                        return await resp.json()
                    elif resp.status in (400, 404):
                        return None
                    await asyncio.sleep(0.5 + attempt * 0.5)
            except Exception:
                if attempt == 2:
                    return None
                await asyncio.sleep(0.5 + attempt * 0.5)
        return None

async def main():
    print(f"[Ingest] Target: {TARGET_NEW_SONGS:,} brand-new songs...", flush=True)
    
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Temporarily drop insert trigger for high-speed bulk ingestion
    cursor.execute("DROP TRIGGER IF EXISTS songs_ai;")
    conn.commit()
    
    # Load existing songs for deduplication
    print("[Ingest] Loading existing songs from database for deduplication...", flush=True)
    cursor.execute("SELECT lower(title), lower(artist) FROM songs;")
    existing_set = set(cursor.fetchall())
    print(f"[Ingest] Loaded {len(existing_set):,} existing songs into memory.", flush=True)
    
    # Prepare URL lists
    cz_urls = [f"https://chordzone.org/wp-json/wp/v2/posts?per_page=100&page={i}" for i in range(1, 245)]
    gt_urls = [f"https://guitartwitt.com/wp-json/wp/v2/posts?per_page=100&page={i}" for i in range(1, 155)]
    
    interleaved_urls = []
    max_len = max(len(cz_urls), len(gt_urls))
    for i in range(max_len):
        if i < len(cz_urls): interleaved_urls.append(('cz', cz_urls[i]))
        if i < len(gt_urls): interleaved_urls.append(('gt', gt_urls[i]))
        
    sem = asyncio.Semaphore(CONCURRENCY)
    connector = aiohttp.TCPConnector(ssl=False, limit=CONCURRENCY * 2)
    
    imported_count = 0
    batch = []
    t0 = time.time()
    
    async with aiohttp.ClientSession(connector=connector) as session:
        CHUNK_SIZE = 12
        for i in range(0, len(interleaved_urls), CHUNK_SIZE):
            if imported_count >= TARGET_NEW_SONGS:
                break
                
            chunk = interleaved_urls[i:i+CHUNK_SIZE]
            tasks = [fetch_page(session, u, sem) for _, u in chunk]
            results = await asyncio.gather(*tasks)
            
            for (source_type, _), post_list in zip(chunk, results):
                if not post_list or not isinstance(post_list, list):
                    continue
                    
                for post in post_list:
                    if imported_count >= TARGET_NEW_SONGS:
                        break
                        
                    parsed = parse_chordzone_post(post) if source_type == 'cz' else parse_guitartwitt_post(post)
                    if not parsed:
                        continue
                        
                    key = (parsed['title'].lower(), parsed['artist'].lower())
                    if key in existing_set or not parsed['title'] or not parsed['artist']:
                        continue
                        
                    existing_set.add(key)
                    
                    song_id = f"{slugify(parsed['title'])}-{uuid.uuid4().hex[:8]}"
                    batch.append((
                        song_id,
                        parsed['title'],
                        parsed['artist'],
                        parsed['genre'],
                        '', # album
                        parsed['source'],
                        parsed['chord_data'],
                        'curated_library',
                        parsed['difficulty']
                    ))
                    imported_count += 1
                    
                    if len(batch) >= BATCH_SIZE:
                        cursor.executemany("""
                            INSERT OR IGNORE INTO songs (id, title, artist, genre, album, source, chord_data, contributor_username, difficulty)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                        """, batch)
                        conn.commit()
                        rate = imported_count / (time.time() - t0)
                        print(f"[Ingest] Progress: {imported_count:,} / {TARGET_NEW_SONGS:,} new songs imported ({rate:.1f} songs/sec)...", flush=True)
                        batch = []
                        
            await asyncio.sleep(0.05)
            
    if batch:
        cursor.executemany("""
            INSERT OR IGNORE INTO songs (id, title, artist, genre, album, source, chord_data, contributor_username, difficulty)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, batch)
        conn.commit()
        
    print(f"\n[Ingest] Successfully imported {imported_count:,} brand-new songs in {time.time()-t0:.1f}s!", flush=True)
    
    # Re-sync Full-Text Search index for newly inserted songs
    print("[Ingest] Synchronizing Full-Text Search (FTS5) index...", flush=True)
    t_fts = time.time()
    cursor.execute("""
        INSERT OR IGNORE INTO songs_fts(rowid, id, title, artist)
        SELECT rowid, id, title, artist FROM songs
        WHERE rowid NOT IN (SELECT rowid FROM songs_fts);
    """)
    conn.commit()
    print(f"[Ingest] FTS5 back-fill completed in {time.time()-t_fts:.2f}s.", flush=True)
    
    # Recreate trigger
    cursor.execute("""
        CREATE TRIGGER IF NOT EXISTS songs_ai AFTER INSERT ON songs BEGIN
            INSERT INTO songs_fts(rowid, id, title, artist)
            VALUES (new.rowid, new.id, new.title, new.artist);
        END;
    """)
    conn.commit()
    
    # Optimize FTS
    print("[Ingest] Optimizing FTS5 index...", flush=True)
    cursor.execute("INSERT INTO songs_fts(songs_fts) VALUES('optimize');")
    conn.commit()
    
    cursor.execute("SELECT count(*) FROM songs;")
    final_count = cursor.fetchone()[0]
    print(f"[Ingest] Total verified songs in GeetHub now: {final_count:,}", flush=True)
    
    conn.close()

if __name__ == "__main__":
    asyncio.run(main())
