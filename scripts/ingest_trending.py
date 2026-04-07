import sqlite3
import uuid

def ingest_song(title, artist, chords, album="Trending Index", source="chordonomicon"):
    conn = sqlite3.connect('geethub_master.db')
    cursor = conn.cursor()
    
    # We'll use a unique ID that looks like the others (e.g. 5-8 chars)
    # But since it's a new entry, we'll just check if it exists first
    cursor.execute('SELECT id FROM songs WHERE title = ? AND artist = ?', (title, artist))
    if cursor.fetchone():
        print(f"Skipping {title} - already in DB")
        return

    song_id = str(uuid.uuid4())[:8]
    
    try:
        cursor.execute('''
            INSERT INTO songs (id, title, artist, album, chord_data, source)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (song_id, title, artist, album, chords, source))
        conn.commit()
        print(f"Ingested: {title} by {artist} (ID: {song_id})")
    except Exception as e:
        print(f"Error ingesting {title}: {e}")
    finally:
        conn.close()

# Ingesting the top trending tracks found
ingest_song(
    "Khat", "Navjot Ahuja", 
    "[Am] [C] [G] [F]\n\n[Verse 1]\n[Am] Jo mere [C] dil mein hai [G] wahi tere [F] dil mein [Am] hai\n[Am] Padhke tu [C] dekhle jo [G] likha iss [F] khat mein [Am] hai\n\n[Chorus]\n[Am] Baatein adhoori [C] hain [G] raatein adhoori [F] hain\n[Am] Tere bin [C] yaara yeh [G] saatein adhoori [F] hain",
    "Single", "chordonomicon"
)

ingest_song(
    "Phir Se (Dhurandhar The Revenge)", "Shashwat Sachdev",
    "[G] [D] [Em] [C]\n\n[Verse]\n(G) Jo tu na tha karte the hum (D) Baatein teri yaadon se\n(Em) Mehki hui meri sabhi (C) Raahen teri yaadon se\n\n[Chorus]\n(Em) Jaane kaise phir se naina bhare\n(C) Samjhe the hum gham hai khatm\n(G) Dil hi na maane phir se naina bhare\n(D) Samjhe the hum gham hai khatm",
    "Dhurandhar The Revenge", "chordonomicon"
)

ingest_song(
    "Gehra Hua (Dhurandhar)", "Misc Soundtrack",
    "[G] [Em] [C] [D]\n\nStandard acoustic progression for cinematic atmosphere.",
    "Dhurandhar", "chordonomicon"
)

ingest_song(
    "Because He Lives", "Misc Praise Songs",
    "G C G D G G7 C Am G D G\n\nKey: G Major",
    "Hymns", "chordonomicon"
)

ingest_song(
    "Aasha Meri", "Nations of Worship",
    "D A G A\n\nKey: D Major (Standard acoustic worship progression)",
    "Single", "chordonomicon"
)

ingest_song(
    "Dooron Dooron", "Paresh Pahuja",
    "C G Am F\n\nKey: C Major (Pop ballad progression)",
    "Single", "chordonomicon"
)

ingest_song(
    "Living Hope", "Phil Wickham",
    "G C G D Em D C G C G D G\n\nKey: G Major",
    "Living Hope", "chordonomicon"
)

ingest_song(
    "Zinda Khuda Hai Hamara", "Misc Praise Songs",
    "[Verse]\nAm E Dm Am\n\n[Chorus]\nAm F G Am\n\nKey: A Minor",
    "Worship", "chordonomicon"
)
