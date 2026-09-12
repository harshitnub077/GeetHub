import sqlite3
import json
import uuid
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

DB_FILE = 'geethub_master.db'

def import_hf_chords(conn):
    logging.info("Importing HF jammai/chords_and_lyrics dataset...")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM songs WHERE source = 'hf_jammai'")
    count = 0
    batch = []
    import uuid
    with open('hf_chords_dataset.jsonl', 'r') as f:
        for line in f:
            if not line.strip(): continue
            song = json.loads(line)
            song_id = str(uuid.uuid4())
            title = song.get('song_name', 'Unknown Title')
            artist = song.get('artist_name', 'Unknown Artist')
            chord_data_dict = {
                "verse_to_harte_chords": song.get('verse_to_harte_chords', '{}'),
                "verse_to_lyrics": song.get('verse_to_lyrics', '{}')
            }
            chord_data = json.dumps(chord_data_dict)
            source = 'hf_jammai'
            batch.append((song_id, title, artist, source, chord_data, 'system_importer'))
            count += 1
            if len(batch) >= 50000:
                cursor.executemany('''
                    INSERT INTO songs (id, title, artist, source, chord_data, contributor_username)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', batch)
                conn.commit()
                logging.info(f"Imported {count} rows into songs table from HF dataset...")
                batch = []
    if batch:
        cursor.executemany('''
            INSERT INTO songs (id, title, artist, source, chord_data, contributor_username)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', batch)
        conn.commit()
    logging.info(f"Successfully imported {count} songs from HF into 'songs' table.")

def create_ug_table(conn):
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS ug_chords_dataset (
        id INTEGER PRIMARY KEY,
        chords TEXT,
        release_date TEXT,
        genres TEXT,
        decade REAL,
        rock_genre TEXT,
        artist_id TEXT,
        main_genre TEXT,
        spotify_song_id TEXT,
        spotify_artist_id TEXT
    )
    ''')
    conn.commit()

def import_indichords(conn):
    logging.info("Importing Indichords dataset...")
    cursor = conn.cursor()
    
    count = 0
    with open('indichords_songs.jsonl', 'r') as f:
        for line in f:
            if not line.strip(): continue
            song = json.loads(line)
            
            song_id = str(uuid.uuid4())
            title = song.get('title', 'Unknown Title')
            # Extract artist from artist_meta (e.g. "strings-zinda-sanjay-dutt" -> "Strings Zinda Sanjay Dutt")
            artist_meta = song.get('artist_meta', 'Unknown Artist')
            artist = " ".join(word.capitalize() for word in artist_meta.split('-'))
            
            chord_data = song.get('lyrics_html', '')
            source = 'indichords'
            
            cursor.execute('''
                INSERT INTO songs (id, title, artist, source, chord_data, contributor_username)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (song_id, title, artist, source, chord_data, 'system_importer'))
            count += 1
            
    conn.commit()
    logging.info(f"Successfully imported {count} songs from Indichords into 'songs' table.")

def import_ultimate_guitar(conn):
    logging.info("Importing Ultimate Guitar dataset...")
    cursor = conn.cursor()
    
    # First delete existing if any, to avoid duplicate issues on re-runs
    cursor.execute("DELETE FROM ug_chords_dataset")
    
    batch = []
    batch_size = 50000
    count = 0
    
    with open('ultimate_guitar_songs.jsonl', 'r') as f:
        for line in f:
            if not line.strip(): continue
            song = json.loads(line)
            
            batch.append((
                song.get('id'),
                song.get('chords'),
                song.get('release_date'),
                song.get('genres'),
                song.get('decade'),
                song.get('rock_genre'),
                song.get('artist_id'),
                song.get('main_genre'),
                song.get('spotify_song_id'),
                song.get('spotify_artist_id')
            ))
            count += 1
            
            if len(batch) >= batch_size:
                cursor.executemany('''
                    INSERT INTO ug_chords_dataset (
                        id, chords, release_date, genres, decade, rock_genre, 
                        artist_id, main_genre, spotify_song_id, spotify_artist_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', batch)
                conn.commit()
                logging.info(f"Imported {count} rows into ug_chords_dataset...")
                batch = []
                
    if batch:
        cursor.executemany('''
            INSERT INTO ug_chords_dataset (
                id, chords, release_date, genres, decade, rock_genre, 
                artist_id, main_genre, spotify_song_id, spotify_artist_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', batch)
        conn.commit()
        
    logging.info(f"Successfully imported {count} songs from Ultimate Guitar into 'ug_chords_dataset' table.")

def main():
    conn = sqlite3.connect(DB_FILE)
    try:
        create_ug_table(conn)
        import_indichords(conn)
        import_ultimate_guitar(conn)
        import_hf_chords(conn)
    finally:
        conn.close()

if __name__ == "__main__":
    main()
