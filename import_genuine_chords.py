import sqlite3
import uuid
import ast
import logging
from datasets import load_dataset

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

DB_FILE = 'geethub_master.db'

def format_tab(lyrics_str, chords_str):
    try:
        lyrics_dict = ast.literal_eval(lyrics_str) if lyrics_str else {}
        chords_dict = ast.literal_eval(chords_str) if chords_str else {}
    except Exception as e:
        return ""
    
    # Get all unique line indices
    keys = set(lyrics_dict.keys()) | set(chords_dict.keys())
    keys = sorted(list(keys))
    
    tab_lines = []
    for k in keys:
        chords_line = chords_dict.get(k, [])
        lyrics_line = lyrics_dict.get(k, "").strip("\n\t ")
        
        if chords_line:
            # Filter out 'N' (no chord)
            filtered_chords = [c for c in chords_line if c != 'N']
            if filtered_chords:
                tab_lines.append(" ".join(f"[{c}]" for c in filtered_chords))
        
        if lyrics_line or not chords_line:
            tab_lines.append(lyrics_line)
            
    return "\n".join(tab_lines)

def main():
    logging.info("Downloading jammai/chords_and_lyrics dataset...")
    dataset = load_dataset("jammai/chords_and_lyrics", split='train')
    
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    logging.info("Starting import into SQLite database...")
    
    batch = []
    batch_size = 50000
    count = 0
    
    for row in dataset:
        artist = row.get('artist_name', 'Unknown Artist')
        title = row.get('song_name', 'Unknown Title')
        
        # Format the chords and lyrics together
        chord_data = format_tab(row.get('verse_to_lyrics'), row.get('verse_to_harte_chords'))
        
        # Only import if there's actually some data
        if len(chord_data) > 20:
            batch.append((
                str(uuid.uuid4()),
                title,
                artist,
                'jammai_chords_and_lyrics',
                chord_data,
                'system_importer'
            ))
            count += 1
            
        if len(batch) >= batch_size:
            cursor.executemany('''
                INSERT INTO songs (id, title, artist, source, chord_data, contributor_username)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', batch)
            conn.commit()
            logging.info(f"Imported {count} genuine songs...")
            batch = []
            
    if batch:
        cursor.executemany('''
            INSERT INTO songs (id, title, artist, source, chord_data, contributor_username)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', batch)
        conn.commit()
        
    logging.info(f"Successfully imported {count} genuine songs with chords and lyrics!")
    
    logging.info("Optimizing Full-Text Search index...")
    cursor.execute("INSERT INTO songs_fts(songs_fts) VALUES('optimize')")
    conn.commit()
    
    conn.close()
    logging.info("Done!")

if __name__ == "__main__":
    main()
