import requests
from bs4 import BeautifulSoup
import json
import os
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

CAT_BASE_URL = "https://tabandchord.com/category/chord/chord-hindi/page/"
MASTER_FILE = "src/data/songs.json"
MAX_WORKERS = 5
LIMIT = 500

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
}

session = requests.Session()
session.headers.update(HEADERS)

def get_page_urls(page_num):
    url = f"{CAT_BASE_URL}{page_num}/"
    print(f"Fetching URLs from Page {page_num}...")
    try:
        res = session.get(url, timeout=15)
        res.raise_for_status()
        soup = BeautifulSoup(res.content, 'html.parser')
        links = soup.select('h2.cm-entry-title a')
        return [link['href'] for link in links]
    except Exception as e:
        print(f"Error fetching page {page_num}: {e}")
        return []

def parse_song(url):
    try:
        # Random sleep to avoid detection
        time.sleep(1.0)
        res = session.get(url, timeout=15)
        if res.status_code != 200:
            return {"error": f"Status {res.status_code}"}
        
        res.raise_for_status()
        soup = BeautifulSoup(res.content, 'html.parser')

        # Extract Title and Artist
        title_tag = soup.select_one('h1.entry-title') or soup.find('h1')
        if not title_tag:
            return {"error": f"Missing title. Page start: {res.text[:100]}"}
        full_title = title_tag.get_text(strip=True)
        
        # Extract Chords/Lyrics
        content_div = soup.select_one('.entry-content') or soup.select_one('.cm-entry-summary') or soup.select_one('article')
        if not content_div:
            return {"error": "Missing content div"}
        
        # Format: "Song Name Guitar Chords – Artist"
        # Often: "O Sajni Re Guitar Chords – Laapataa Ladies"
        artist = "Various Artists"
        title = full_title
        
        # Site uses both " – " (en-dash) and " - " (hyphen) and " Guitar Chords"
        delimiters = [" Guitar Chords – ", " Chords – ", " – ", " - ", " Guitar Chords ", " chords "]
        for d in delimiters:
            if d in full_title:
                parts = full_title.split(d)
                title = parts[0].strip()
                artist = parts[1].strip()
                break
        
        # Clean up song name from extra "Guitar Chords" if still present
        title = title.replace(" Guitar Chords", "").replace(" chords", "").replace(" Chords", "").strip()

        # Remove common sidebars/ads inside content
        for script in content_div(["script", "style", "ins"]):
            script.decompose()

        raw_text = content_div.get_text()
        
        # Standardize (G) or [G] -> [G]
        # Regex to find (Chord) or [Chord]
        # Some newer pages already use [G], older use (G)
        chord_pattern = re.compile(r'[\(\[]([A-G][b#]?[a-zA-Z0-9\/#]*)[\)\]]')
        
        def chord_replacer(match):
            val = match.group(1)
            if len(val) <= 10 and re.match(r'^[A-G]', val):
                return f"[{val}]"
            return match.group(0)

        clean_data = chord_pattern.sub(chord_replacer, raw_text)
        
        # Further cleaning: remove empty lines and extra spaces
        lines = [line.strip() for line in clean_data.split('\n') if line.strip()]
        chord_data = '\n'.join(lines)

        slug = url.rstrip('/').split('/')[-1]
        
        return {
            "id": f"tab-{slug}",
            "title": title,
            "artist": artist,
            "genre": "Latest Bollywood",
            "album": "Tab and Chord Collection",
            "contributor_username": "tabandchord_bot",
            "chord_data": chord_data.strip()
        }

    except Exception as e:
        return {"error": f"Exception: {str(e)}"}

def main():
    print("Step 1: Collecting URLs for the latest 500 Bollywood songs...")
    all_urls = []
    page = 1
    while len(all_urls) < LIMIT and page <= 60:
        urls = get_page_urls(page)
        if not urls: break
        all_urls.extend(urls)
        page += 1
    
    # Prune to exactly LIMIT
    target_urls = all_urls[:LIMIT]
    print(f"Found {len(target_urls)} unique URLs. Starting extraction...")

    # Load existing to avoid duplicates
    existing_songs = []
    if os.path.exists(MASTER_FILE):
        with open(MASTER_FILE, "r") as f:
            existing_songs = json.load(f)
    
    existing_ids = {s["id"] for s in existing_songs}
    print(f"Current library size: {len(existing_songs)}")

    scraped_songs = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_url = {executor.submit(parse_song, url): url for url in target_urls}
        for i, future in enumerate(as_completed(future_to_url)):
            song = future.result()
            if not song or "error" in song:
                reason = song.get("error", "Parse error") if song else "Parse error"
                # print(f"Skip: {reason} for {future_to_url[future]}")
            elif not song.get("chord_data"):
                # print(f"Skip: No chords for {song['title']}")
                pass
            elif song["id"] in existing_ids:
                pass
            else:
                scraped_songs.append(song)
                print(f"[{len(scraped_songs)}] Extracted: {song['artist']} - {song['title']}")
            
            if (i+1) % 50 == 0:
                print(f"--- Processed {i+1} URLs ---")

    if not scraped_songs:
        print("No new songs found to add.")
        return

    # Merge and Save
    existing_songs.extend(scraped_songs)
    # Deduplicate by ID
    unique_songs = {s['id']: s for s in existing_songs}.values()
    
    with open(MASTER_FILE, 'w') as f:
        json.dump(list(unique_songs), f, indent=2)

    print(f"Successfully added {len(scraped_songs)} new songs. Total: {len(unique_songs)}")

if __name__ == "__main__":
    main()
