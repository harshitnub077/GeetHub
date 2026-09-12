import sqlite3
import json
import uuid
import logging
import ast

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

DB_FILE = 'geethub_master.db'

def import_hf_chords(conn):
    logging.info("Importing HF jammai/chords_and_lyrics dataset...")
    cursor = conn.cursor()
    
    # Delete existing to prevent duplication if run multiple times
    cursor.execute("DELETE FROM songs WHERE source = 'hf_jammai'")
    
    count = 0
    batch = []
    batch_size = 50000
    
    with open('hf_chords_dataset.jsonl', 'r') as f:
        for line in f:
            if not line.strip(): continue
            song = json.loads(line)
            
            song_id = str(uuid.uuid4())
            title = song.get('song_name', 'Unknown Title')
            artist = song.get('artist_name', 'Unknown Artist')
            
            # Combine the chords and lyrics dictionaries into a single JSON object to store in chord_data
            chord_data_dict = {
                "verse_to_harte_chords": song.get('verse_to_harte_chords', '{}'),
                "verse_to_lyrics": song.get('verse_to_lyrics', '{}')
            }
            chord_data = json.dumps(chord_data_dict)
            source = 'hf_jammai'
            
            batch.append((song_id, title, artist, source, chord_data, 'system_importer'))
            count += 1
            
            if len(batch) >= batch_size:
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

def main():
    conn = sqlite3.connect(DB_FILE)
    try:
        import_hf_chords(conn)
    finally:
        conn.close()

if __name__ == "__main__":
    main()
