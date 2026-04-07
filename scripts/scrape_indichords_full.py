import requests
from bs4 import BeautifulSoup
import json
import os
import xml.etree.ElementTree as ET
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

SITEMAP_URL = "https://indichords.com/sitemap.xml"
MASTER_FILE = "src/data/songs.json"
MAX_WORKERS = 8

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
}

def fetch_sitemap():
    print(f"Fetching sitemap from {SITEMAP_URL}...")
    try:
        res = requests.get(SITEMAP_URL, timeout=15, headers=HEADERS)
        res.raise_for_status()
        root = ET.fromstring(res.content)
        ns = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        urls = [loc.text for loc in root.findall('.//ns:loc', ns)]
        song_urls = [u for u in urls if '/song/' in u]
        print(f"Found {len(song_urls)} song URLs in sitemap.")
        return song_urls
    except Exception as e:
        print(f"Error fetching sitemap: {e}")
        return []

def make_song_id(url):
    """Generate a stable song ID from the Indichords URL pattern /song/{numeric_id}/{slug}"""
    match = re.search(r'/song/(\d+)/([^/]+)', url)
    if match:
        return f"ic-{match.group(1)}-{match.group(2)}"
    # fallback
    return f"ic-{url.rstrip('/').split('/')[-1]}"

def scrape_song(url):
    try:
        time.sleep(0.3)
        res = requests.get(url, timeout=15, headers=HEADERS)
        if res.status_code != 200:
            return None
        soup = BeautifulSoup(res.content, 'html.parser')

        # Title — find the second h1 (the first is "Indichords" site logo)
        h1s = soup.find_all('h1')
        song_h1s = [h for h in h1s if h.get_text(strip=True).lower() != 'indichords']
        title = song_h1s[0].get_text(strip=True) if song_h1s else ""
        if not title:
            title = url.rstrip('/').split('/')[-1].split('-')[0].title()

        # Artist — song-meta p contains a slug like "arijit-singh-ae-dil-hai-mushkil"
        # Extract just the artist portion by removing the part matching the title
        artist = "Various Artists"
        meta_p = soup.find('p', class_='song-meta')
        if meta_p:
            meta_slug = meta_p.get_text(strip=True)
            # Title-case the slug words, replacing hyphens with spaces
            artist = meta_slug.replace('-', ' ').title().strip()

        # Better: extract artist from URL slug pattern /song/{id}/{song-title}-{artist}-{movie}
        # The URL slug minus the song title slug gives artist context
        url_slug = url.rstrip('/').split('/')[-1]
        title_slug = title.lower().replace(' ', '-')
        if url_slug.startswith(title_slug + '-'):
            remainder = url_slug[len(title_slug) + 1:]
            artist = remainder.replace('-', ' ').title().strip()

        # Chords/Lyrics — the chord data is inside .chord-sheet, .lyrics, or .tab-content
        chord_data = ""
        for sel in ['.chord-sheet', '.lyrics', '.tab-content', '.song-content', 'article .content', 'article']:
            div = soup.select_one(sel)
            if div:
                # Remove scripts/ads
                for tag in div(['script', 'style', 'ins', 'iframe', 'button', 'nav']):
                    tag.decompose()
                
                # Build text preserving chord brackets
                parts = []
                for elem in div.descendants:
                    if isinstance(elem, str):
                        parts.append(elem)
                    elif elem.name == 'br':
                        parts.append('\n')
                    elif elem.name in ['h7', 'b', 'strong'] and elem.get_text(strip=True):
                        chord = elem.get_text(strip=True)
                        if re.match(r'^[A-G]', chord):
                            parts.append(f'[{chord}]')
                
                chord_data = ''.join(parts)
                # Normalize whitespace
                lines = [ln.rstrip() for ln in chord_data.split('\n')]
                chord_data = '\n'.join(lines).strip()
                if chord_data:
                    break

        if not chord_data:
            return None

        song_id = make_song_id(url)

        return {
            "id": song_id,
            "title": title,
            "artist": artist,
            "genre": "Hindi",
            "album": "Indichords Collection",
            "contributor_username": "indichords_bot",
            "chord_data": chord_data,
            "source": "indichords"
        }

    except Exception as e:
        return None

def main():
    song_urls = fetch_sitemap()
    if not song_urls:
        print("No URLs found. Exiting.")
        return

    # Load existing songs
    existing_songs = []
    if os.path.exists(MASTER_FILE):
        with open(MASTER_FILE, 'r') as f:
            existing_songs = json.load(f)
    
    existing_ids = {s["id"] for s in existing_songs}
    print(f"Loaded {len(existing_songs)} existing songs.")

    # Filter URLs not already in DB (by generated ID)
    new_urls = [u for u in song_urls if make_song_id(u) not in existing_ids]
    print(f"Planning to scrape {len(new_urls)} new Indichords URLs...")

    if not new_urls:
        print("All Indichords songs already imported!")
        return

    scraped_songs = []
    added = 0

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_url = {executor.submit(scrape_song, url): url for url in new_urls}
        for i, future in enumerate(as_completed(future_to_url)):
            song = future.result()
            if song and song["chord_data"]:
                scraped_songs.append(song)
                added += 1
                print(f"[{added}] Added: {song['artist']} - {song['title']}")
            
            if (i + 1) % 100 == 0:
                print(f"--- Progress: {i+1}/{len(new_urls)} processed, {added} found ---")
                # Checkpoint save every 100
                if scraped_songs:
                    all_songs = list({s['id']: s for s in existing_songs + scraped_songs}.values())
                    with open(MASTER_FILE, 'w') as f:
                        json.dump(all_songs, f, indent=2)

    if not scraped_songs:
        print("No new songs extracted.")
        return

    # Final merge & save
    all_songs = list({s['id']: s for s in existing_songs + scraped_songs}.values())
    with open(MASTER_FILE, 'w') as f:
        json.dump(all_songs, f, indent=2)

    print(f"\nDone! Added {len(scraped_songs)} Indichords songs. Total library: {len(all_songs)}")

if __name__ == "__main__":
    main()
