import requests
from bs4 import BeautifulSoup
import json
import os
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

MASTER_FILE = "src/data/songs.json"
MAX_WORKERS = 10

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
}

def get_artist_from_url(url, title):
    """Extract artist from URL slug pattern: /song/{id}/{title-slug}-{artist-and-movie}"""
    url_slug = url.rstrip('/').split('/')[-1]
    title_slug = title.lower().replace(' ', '-')
    if url_slug.startswith(title_slug + '-'):
        remainder = url_slug[len(title_slug) + 1:]
        return remainder.replace('-', ' ').title().strip()
    return None

def fix_song(song):
    """Re-scrape an Indichords song to get the correct title and artist."""
    if not song.get('id', '').startswith('ic-'):
        return None  # Not an indichords song
    if song.get('artist') != 'IOS App':
        return None  # Already has a real artist

    # Reconstruct URL from id: ic-{numeric_id}-{slug}
    parts = song['id'].split('-', 2)  # ['ic', '1234', 'song-slug']
    if len(parts) < 3:
        return None
    numeric_id = parts[1]
    slug = parts[2]
    url = f"https://indichords.com/song/{numeric_id}/{slug}"

    try:
        time.sleep(0.4)
        res = requests.get(url, timeout=15, headers=HEADERS)
        if res.status_code != 200:
            return None
        soup = BeautifulSoup(res.content, 'html.parser')

        # Title — second h1 (first is the site logo "Indichords")
        h1s = soup.find_all('h1')
        song_h1s = [h for h in h1s if h.get_text(strip=True).lower() != 'indichords']
        title = song_h1s[0].get_text(strip=True) if song_h1s else song['title']

        # Artist from URL slug
        artist = get_artist_from_url(url, title)
        if not artist:
            # Fallback: use meta-p slug
            meta_p = soup.find('p', class_='song-meta')
            if meta_p:
                artist = meta_p.get_text(strip=True).replace('-', ' ').title().strip()

        if not artist or artist.lower() == 'ios app':
            return None

        return {'id': song['id'], 'title': title, 'artist': artist}
    except Exception:
        return None

def main():
    with open(MASTER_FILE, 'r') as f:
        songs = json.load(f)

    ios_songs = [s for s in songs if s.get('artist') == 'IOS App']
    print(f"Found {len(ios_songs)} songs with 'IOS App' artist to fix...")

    fixes = {}
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(fix_song, s): s for s in ios_songs}
        for i, future in enumerate(as_completed(futures)):
            result = future.result()
            if result:
                fixes[result['id']] = result
                print(f"[{len(fixes)}] Fixed: {result['artist']} - {result['title']}")
            if (i + 1) % 200 == 0:
                print(f"--- Progress {i+1}/{len(ios_songs)}, fixed {len(fixes)} ---")

    # Apply fixes
    fixed_count = 0
    for song in songs:
        if song['id'] in fixes:
            song['title'] = fixes[song['id']]['title']
            song['artist'] = fixes[song['id']]['artist']
            fixed_count += 1

    with open(MASTER_FILE, 'w') as f:
        json.dump(songs, f, indent=2)

    print(f"\nDone! Fixed {fixed_count}/{len(ios_songs)} songs. Total library: {len(songs)}")

if __name__ == "__main__":
    main()
