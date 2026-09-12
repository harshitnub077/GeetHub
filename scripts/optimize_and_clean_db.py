import sqlite3
import os
import time

DB_FILE = 'geethub_master.db'

def get_db_size():
    if os.path.exists(DB_FILE):
        return os.path.getsize(DB_FILE) / (1024 * 1024)
    return 0

def optimize_db():
    print(f"[Optimizer] Initial database size: {get_db_size():.2f} MB")
    
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # 1. Check existing counts
    cursor.execute("SELECT count(*) FROM songs;")
    total_songs = cursor.fetchone()[0]
    
    cursor.execute("SELECT count(*) FROM songs WHERE source = 'hf_jammai';")
    hf_jammai_count = cursor.fetchone()[0]
    
    print(f"[Optimizer] Total songs in DB: {total_songs:,}")
    print(f"[Optimizer] Redundant unformatted 'hf_jammai' duplicate rows: {hf_jammai_count:,}")
    
    # 2. Delete redundant unformatted duplicates
    if hf_jammai_count > 0:
        print("[Optimizer] Deleting redundant 'hf_jammai' rows (formatted 'jammai_chords_and_lyrics' is preserved)...")
        cursor.execute("DELETE FROM songs WHERE source = 'hf_jammai';")
        conn.commit()
        print("[Optimizer] Deleted redundant rows successfully.")
        
    # 3. Drop unused auxiliary table if exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='ug_chords_dataset';")
    if cursor.fetchone():
        print("[Optimizer] Dropping unused table 'ug_chords_dataset' (679k numeric progression IDs)...")
        cursor.execute("DROP TABLE IF EXISTS ug_chords_dataset;")
        conn.commit()
        print("[Optimizer] Dropped 'ug_chords_dataset'.")
        
    # 4. Check remaining clean songs
    cursor.execute("SELECT count(*) FROM songs;")
    remaining_songs = cursor.fetchone()[0]
    print(f"[Optimizer] Clean active songs remaining in database: {remaining_songs:,}")
    
    # 5. Optimize FTS5 table
    print("[Optimizer] Optimizing FTS5 search index...")
    cursor.execute("INSERT INTO songs_fts(songs_fts) VALUES('optimize');")
    conn.commit()
    
    # 6. Reclaim disk space via VACUUM
    print("[Optimizer] Running VACUUM to reclaim disk space (this may take 1-2 minutes)...")
    t0 = time.time()
    cursor.execute("VACUUM;")
    conn.commit()
    print(f"[Optimizer] VACUUM completed in {time.time()-t0:.2f}s.")
    
    conn.close()
    print(f"[Optimizer] Final optimized database size: {get_db_size():.2f} MB")
    print("[Optimizer] Database optimization complete!")

if __name__ == "__main__":
    optimize_db()
