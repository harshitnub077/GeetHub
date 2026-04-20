import sqlite3
import json
import os

DB_PATH = 'geethub_master.db'
SCRAPED_FILE = 'scripts/scraped_songs_final.json'

def main():
    if not os.path.exists(SCRAPED_FILE):
        print("Scraped file not found!")
        return

    with open(SCRAPED_FILE, 'r') as f:
        songs = json.load(f)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print(f"Adding {len(songs)} songs to the database...")
    
    added_count = 0
    skipped_count = 0

    for song in songs:
        title = song['title']
        artist = song['artist']
        chord_data = song['chord_data']
        genre = song['genre']
        source = song['source']
        
        # Check if exists
        cursor.execute("SELECT id FROM songs WHERE title = ? AND artist = ?", (title, artist))
        if cursor.fetchone():
            skipped_count += 1
            continue
            
        # Insert
        # We'll use a unique ID prefix for this batch
        song_id = f"GT-{hash(title + artist) % 10000000}"
        
        try:
            cursor.execute("""
                INSERT INTO songs (id, title, artist, chord_data, genre, source, created_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            """, (song_id, title, artist, chord_data, genre, source))
            added_count += 1
        except Exception as e:
            print(f"Error inserting {title}: {e}")

    conn.commit()
    conn.close()
    
    print(f"Done.")
    print(f"Added: {added_count}")
    print(f"Skipped: {skipped_count}")

if __name__ == "__main__":
    main()
