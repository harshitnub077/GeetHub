import json
import os
import re

MASTER_FILE = "src/data/songs.json"
LOCK_FILE = ".next/dev/lock"

def fix_metadata():
    if not os.path.exists(MASTER_FILE):
        print("Error: songs.json not found.")
        return

    with open(MASTER_FILE, "r") as f:
        songs = json.load(f)

    fixed_count = 0
    for song in songs:
        if song.get("contributor_username") == "indichords_bot" and song.get("title") == "Indichords":
            # Heuristic Title Case from ID
            slug = song["id"]
            
            # Clean up numeric prefix if it exists in the ID slug from Indichords
            # (though current scraper uses the full slug after /song/)
            # IDs look like "conversations-in-the-dark-john-legend"
            
            # Simple title case conversion
            display_title = slug.replace("-", " ").title()
            
            song["title"] = display_title
            song["artist"] = "Imported Artist" # Placeholder better than "Unknown"
            song["genre"] = "Imported"
            song["album"] = "Indichords Collection"
            fixed_count += 1

    with open(MASTER_FILE, "w") as f:
        json.dump(songs, f, indent=2)
    
    print(f"Fixed metadata for {fixed_count} songs.")

def cleanup_lock():
    if os.path.exists(LOCK_FILE):
        try:
            os.remove(LOCK_FILE)
            print(f"Removed stale lock file: {LOCK_FILE}")
        except Exception as e:
            print(f"Could not remove lock file: {e}")
    else:
        print("No stale lock file found.")

if __name__ == "__main__":
    fix_metadata()
    cleanup_lock()
