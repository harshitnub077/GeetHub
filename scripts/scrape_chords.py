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
MAX_WORKERS = 10  # Reduced to avoid overwhelming the server or getting rate limited

# List of artists from sync_artists.py
ARTISTS = [
    "A.R. Rahman", "Adnan Sami", "Akhil Sachdeva", "Alisha Chinai", "Amaal Malik", "Ankit Tiwari", "Anuradha Paudwal",
    "Arijit Singh", "Armaan Malik", "Asha Bhosle", "Ayushmann Khurrana", "Bhupinder Singh", "Coke Studio", "Dhvani Bhanushali",
    "Farhan Akhtar", "Gajendra Verma", "Gulzar", "Hemant Kumar", "Ilaiyaraaja", "Jagjit Singh", "Jeet Gannguli", "Junoon",
    "Kailash Kher", "Kavita Krishnamurthy", "Kumar Sanu", "Lata Mangeshkar", "Madan Mohan", "Manna Dey", "Mika Singh",
    "Mohammad Irfan", "Mohit Chauhan", "Mukesh", "Nadeem Shravan", "Nusrat Fateh Ali Khan", "Palak Muchhal", "Papon",
    "Prateek Kuhad", "R.D. Burman", "Rahat Fateh Ali Khan", "Roop Kumar Rathore", "S.P. Balasubrahmanyam", "Salil Chowdhury",
    "Shaan", "Shankar Mahadevan", "Shibani Kashyap", "Soham Naik", "Sonu Nigam", "Sukhwinder Singh", "Suresh Wadkar",
    "Vinod Rathod", "Vishal Mishra", "Yesudas", "Abhijeet", "Ajay Atul", "Ali Azmat", "Alka Yagnik", "Amit Trivedi",
    "Anu Malik", "Anuv Jain", "Arko", "Aryans", "Atif Aslam", "Bappi Lahiri", "Chithra", "Darshan Raval", "Falak",
    "Fuzon", "Ghulam Ali", "Hariharan", "Himesh Reshammiya", "Indian Ocean", "Javed Ali", "Jubin Nautiyal", "K.K.",
    "Kamran Ahmed", "Kishore Kumar", "Kunal Ganjawala", "Lucky Ali", "Mahendra Kapoor", "Mehdi Hasan", "Mithoon",
    "Mohammed Rafi", "Monali Thakur", "Mustafa Zahid", "Neha Kakkar", "O.P. Nayyar", "Palash Sen", "Praak", "Pritam",
    "Rabbi Shergill", "Ram Sampath", "S.D. Burman", "Sadhana Sargam", "Salim Merchant", "Shafqat Amanat Ali", "Sharib Toshi",
    "Shreya Ghoshal", "Sona Mohapatra", "Strings", "Sunidhi Chauhan", "Udit Narayan", "Vishal Bhardwaj", "Vishal Shekhar", "Zubin Garg"
]

def normalize_artist(name):
    if not name: return "Various Artists"
    name_clean = name.lower().replace("-", " ").replace(".", "").strip()
    for target in ARTISTS:
        target_clean = target.lower().replace("-", " ").replace(".", "").strip()
        if target_clean == name_clean or target_clean in name_clean or name_clean in target_clean:
            return target
    return name

def fetch_sitemap():
    print(f"Fetching sitemap from {SITEMAP_URL}...")
    try:
        res = requests.get(SITEMAP_URL, timeout=15)
        res.raise_for_status()
        root = ET.fromstring(res.content)
        ns = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        urls = [loc.text for loc in root.findall('.//ns:loc', ns)]
        song_urls = [u for u in urls if '/song/' in u]
        
        def get_id(u):
            match = re.search(r'/song/(\d+)/', u)
            return int(match.group(1)) if match else 0
            
        song_urls.sort(key=get_id, reverse=True)
        print(f"Found {len(song_urls)} song URLs in sitemap.")
        return song_urls
    except Exception as e:
        print(f"Error fetching sitemap: {e}")
        return []

def scrape_song(url):
    try:
        res = requests.get(url, timeout=10)
        res.raise_for_status()
        soup = BeautifulSoup(res.content, 'html.parser')

        article = soup.find('article')
        if not article: return None

        title_tag = article.find('h1')
        title = title_tag.get_text(strip=True) if title_tag else ""
        
        if not title or title.lower() == "indichords":
            slug_part = url.split('/')[-1].replace('-', ' ').title()
            title = slug_part

        meta_tag = article.find('p', class_='song-meta')
        artist = "Various Artists"
        if meta_tag:
            artist_text = meta_tag.get_text(strip=True)
            artist = artist_text.replace("Artist:", "").strip()
            if not artist: artist = "Various Artists"

        # Check if artist is in our target list
        normalized_artist = normalize_artist(artist)
        is_target_artist = normalized_artist in ARTISTS

        # Generic Hindi check
        is_hindi = "hindi" in res.text.lower() or "/language/hindi" in res.text.lower()
        
        if not is_target_artist and not is_hindi:
            return None

        lyrics_div = article.find('div', class_='lyrics')
        if not lyrics_div: return None

        chord_data = ""
        for child in lyrics_div.children:
            if child.name == 'h7':
                chord_text = child.get_text(strip=True)
                if not chord_text.startswith('['): chord_text = f"[{chord_text}]"
                chord_data += chord_text
            elif child.name == 'br':
                chord_data += "\n"
            elif isinstance(child, str):
                chord_data += child
            elif child.name in ['div', 'p']:
                chord_data += child.get_text()

        chord_data = chord_data.replace('\xa0', ' ')
        slug = url.split('/')[-1]
        
        return {
            "id": slug,
            "title": title,
            "artist": normalized_artist,
            "genre": "Hindi",
            "album": "Indichords Collection",
            "contributor_username": "indichords_bot",
            "chord_data": chord_data.strip()
        }

    except Exception as e:
        return None

def main():
    song_urls = fetch_sitemap()
    if not song_urls: return

    existing_songs = []
    if os.path.exists(MASTER_FILE):
        with open(MASTER_FILE, 'r') as f:
            existing_songs = json.load(f)
    
    existing_ids = {s["id"] for s in existing_songs}
    print(f"Loaded {len(existing_songs)} existing songs.")

    new_urls = [u for u in song_urls if u.split('/')[-1] not in existing_ids][:150]
    print(f"Planning to scrape {len(new_urls)} new URLs...")

    scraped_songs = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_url = {executor.submit(scrape_song, url): url for url in new_urls}
        for i, future in enumerate(as_completed(future_to_url)):
            song = future.result()
            if song and song["chord_data"]:
                scraped_songs.append(song)
                print(f"[{i+1}/{len(new_urls)}] Added: {song['artist']} - {song['title']}")
            
            if (i+1) % 50 == 0:
                print(f"--- Progress: {i+1}/{len(new_urls)} processed ---")

    if not scraped_songs:
        print("No new songs found to add matching the criteria.")
        return

    # Merge and save
    existing_songs.extend(scraped_songs)
    # Final deduplication just in case
    unique_songs = {s['id']: s for s in existing_songs}.values()
    
    with open(MASTER_FILE, 'w') as f:
        json.dump(list(unique_songs), f, indent=2)

    print(f"Successfully added {len(scraped_songs)} new songs. Total: {len(unique_songs)}")

if __name__ == "__main__":
    main()
