import requests
from bs4 import BeautifulSoup
import json
import os
import xml.etree.ElementTree as ET
import re

SITEMAP_URL = "https://indichords.com/sitemap.xml"
OUTPUT_FILE = "src/data/songs_scraped.json"
MASTER_FILE = "src/data/songs.json"
LIMIT = 150  # Increase limit for full import

def fetch_sitemap():
    print(f"Fetching sitemap from {SITEMAP_URL}...")
    try:
        res = requests.get(SITEMAP_URL, timeout=10)
        res.raise_for_status()
        root = ET.fromstring(res.content)
        # sitemap namespace
        ns = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        urls = [loc.text for loc in root.findall('.//ns:loc', ns)]
        song_urls = [u for u in urls if '/song/' in u]
        print(f"Found {len(song_urls)} song URLs in sitemap.")
        return song_urls
    except Exception as e:
        print(f"Error fetching sitemap: {e}")
        return []

def scrape_song(url):
    print(f"Scraping: {url}")
    try:
        res = requests.get(url, timeout=10)
        res.raise_for_status()
        soup = BeautifulSoup(res.content, 'html.parser')

        # Title
        title_tag = soup.find('h1')
        title = title_tag.get_text(strip=True) if title_tag else "Unknown Title"

        # Artist - often included in title as "SongName - ArtistName" or inside h2/span
        # Let's clean up title or find artist tag
        artist = "Unknown Artist"
        if " - " in title:
            parts = title.split(" - ", 1)
            title = parts[0].strip()
            artist = parts[1].strip()

        # Lyrics and Chords container
        lyrics_div = soup.find('div', class_='lyrics')
        if not lyrics_div:
            print("No lyrics div found.")
            return None

        chord_data = ""
        for child in lyrics_div.children:
            if child.name == 'h7':
                chord_text = child.get_text(strip=True)
                # Ensure brackets
                if not chord_text.startswith('['):
                    chord_text = f"[{chord_text}]"
                chord_data += chord_text
            elif child.name == 'br':
                chord_data += "\n"
            elif isinstance(child, str):
                chord_data += child
            elif child.name == 'div' or child.name == 'p':
                # Recursive or nested? Usually simple text/h7
                chord_data += child.get_text()

        # Clean up double spaces or spaces before chords if messy
        chord_data = chord_data.replace('\xa0', ' ') # Replace non-breaking space
        
        # Deduce ID from URL
        slug = url.split('/')[-1]
        
        return {
            "id": slug,
            "title": title,
            "artist": artist,
            "genre": "Indie Pop", # Default or extract
            "album": "Unknown",
            "contributor_username": "indichords_bot",
            "chord_data": chord_data.strip()
        }

    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return None

def main():
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    song_urls = fetch_sitemap()
    if not song_urls:
        return

    scraped_songs = []
    # Take first LIMIT songs
    urls_to_scrape = song_urls[:LIMIT]
    
    for url in urls_to_scrape:
        song = scrape_song(url)
        if song and song["chord_data"]:
            scraped_songs.append(song)

    print(f"Successfully scraped {len(scraped_songs)} songs.")

    # Load existing songs
    existing_songs = []
    if os.path.exists(MASTER_FILE):
        with open(MASTER_FILE, 'r') as f:
            existing_songs = json.load(f)

    # Merge avoiding duplicates by ID
    existing_ids = {s["id"] for s in existing_songs}
    new_count = 0
    for s in scraped_songs:
        if s["id"] not in existing_ids:
            existing_songs.append(s)
            new_count += 1

    # Save back
    with open(MASTER_FILE, 'w') as f:
        json.dump(existing_songs, f, indent=2)

    print(f"Merged {new_count} new songs into {MASTER_FILE}. Total songs: {len(existing_songs)}")

if __name__ == "__main__":
    main()
