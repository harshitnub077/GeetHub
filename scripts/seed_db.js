/**
 * seed_db.js — Initialize the Geethub database with sample songs.
 * Run: node scripts/seed_db.js
 */
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(process.cwd(), 'geethub_master.db');
const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Create schema
db.exec(`
  CREATE TABLE IF NOT EXISTS songs (
    id                   TEXT PRIMARY KEY,
    title                TEXT NOT NULL,
    artist               TEXT NOT NULL,
    genre                TEXT DEFAULT '',
    album                TEXT DEFAULT '',
    source               TEXT DEFAULT '',
    chord_data           TEXT DEFAULT '',
    contributor_username TEXT DEFAULT 'community',
    created_at           TEXT DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS songs_fts USING fts5(
    id UNINDEXED,
    title,
    artist,
    content='songs',
    content_rowid='rowid'
  );
`);

db.exec(`
  CREATE TRIGGER IF NOT EXISTS songs_ai AFTER INSERT ON songs BEGIN
    INSERT INTO songs_fts(rowid, id, title, artist)
    VALUES (new.rowid, new.id, new.title, new.artist);
  END;
  CREATE TRIGGER IF NOT EXISTS songs_au AFTER UPDATE ON songs BEGIN
    INSERT INTO songs_fts(songs_fts, rowid, id, title, artist)
    VALUES('delete', old.rowid, old.id, old.title, old.artist);
    INSERT INTO songs_fts(rowid, id, title, artist)
    VALUES (new.rowid, new.id, new.title, new.artist);
  END;
  CREATE TRIGGER IF NOT EXISTS songs_ad AFTER DELETE ON songs BEGIN
    INSERT INTO songs_fts(songs_fts, rowid, id, title, artist)
    VALUES('delete', old.rowid, old.id, old.title, old.artist);
  END;
`);

const songs = [
  // Bollywood
  { title: "Tum Hi Ho", artist: "Arijit Singh", genre: "Bollywood", album: "Aashiqui 2", chord_data: "[Am]Hum tere bin [F]ab reh nahi sakte\n[C]Tere bina kya [G]wajood mera\n[Am]Tujhse juda [F]gar ho jaayenge\n[C]To khud se hi [G]ho jaayenge juda\n[Am]Tum Hi Ho [F] [C] [G]" },
  { title: "Kal Ho Na Ho", artist: "Sonu Nigam", genre: "Bollywood", album: "Kal Ho Na Ho", chord_data: "[C]Har ghadi [G]badal rahi hai [Am]roop zindagi\n[F]Chhaon hai kabhi kabhi [C]hai dhoop zindagi\n[C]Har pal yahan [G]ji bhar jiyo\n[Am]Jo hai samaa [F]kal ho na ho" },
  { title: "Channa Mereya", artist: "Arijit Singh", genre: "Bollywood", album: "Ae Dil Hai Mushkil", chord_data: "[Em]Acha chalta hoon\n[G]Duaon mein yaad rakhna\n[D]Mere dil ki dhadkan\n[Am]Mujhe bhi zindagi mein [Em]aazma" },
  { title: "Phir Le Aya Dil", artist: "Rekha Bhardwaj", genre: "Bollywood", album: "Barfi!", chord_data: "[Am]Phir le aaya dil [F]majboor kya kiya\n[C]Teri yaad ne [G]dil ko chura liya\n[Am]Kho gaya hoon [F]main kahin\n[C]Tujhko dhundta [G]hoon yahan wahin" },
  { title: "Khairiyat", artist: "Arijit Singh", genre: "Bollywood", album: "Chhichhore", chord_data: "[C]Khairiyat pucho kabhi to mera haal\n[G]Poocho na poocho dil ka yeh kya haal\n[Am]Tere bin zindagi mein rang kaisa\n[F]Tujhe dekhna hai mujhe kaisa" },
  { title: "Main Agar Kahoon", artist: "Sonu Nigam", genre: "Bollywood", album: "Om Shanti Om", chord_data: "[G]Main agar kahoon\n[D]Tum meri manogi\n[Em]Ya phir khamoshi\n[C]Meri baat sunogi" },
  { title: "Aaj Ki Raat", artist: "AR Rahman", genre: "Bollywood", album: "Don", chord_data: "[Am]Aaj ki raat koi [E]aane ko hai\n[Am]Pehli nazar mein [G]yeh kehne ko hai\n[F]Aaj ki raat [C]naya kuch hoga\n[Am]Dil mera [E]dhadkane laga" },
  { title: "Raabta", artist: "Arijit Singh", genre: "Bollywood", album: "Agent Sai Srinivasa Athreya", chord_data: "[Em]Kehte hain khuda ne iss jagah\n[G]Pehle se teri meri kahani likh di\n[D]Raabta raabta\n[Am]Raabta raabta" },
  { title: "Dil Dhadakne Do", artist: "Priyanka Chopra, Farhan Akhtar", genre: "Bollywood", album: "Dil Dhadakne Do", chord_data: "[C]Dil dhadakne do\n[G]Dil dhadakne do\n[Am]Aankhon ke raste\n[F]Dil dhadakne do" },
  { title: "Ilahi", artist: "Arijit Singh", genre: "Bollywood", album: "Yeh Jawaani Hai Deewani", chord_data: "[Dm]Ilahi ilahi\n[Bb]Mujhe tere sath chalna hai\n[F]Ilahi ilahi\n[C]Mujhe teri zaroorat hai" },
  // English
  { title: "Let Her Go", artist: "Passenger", genre: "Pop", album: "All the Little Lights", chord_data: "[C]Well you only need the [G]light when it's burning [Am]low\n[F]Only miss the sun when it [C]starts to snow\n[C]Only know you love her when you [G]let her go\n[Am] [F] [C] [G]" },
  { title: "Wonderwall", artist: "Oasis", genre: "Rock", album: "(What's the Story) Morning Glory?", chord_data: "[Em7]Today is gonna be the day that they're gonna [G]throw it back to you\n[Dsus4]By now you should've somehow realized [A7sus4]what you gotta do\n[Em7]I don't believe that anybody [G]feels the way I do [Dsus4]about you now [A7sus4]" },
  { title: "Hotel California", artist: "Eagles", genre: "Rock", album: "Hotel California", chord_data: "[Bm]On a dark desert highway [F#]cool wind in my hair\n[A]Warm smell of colitas [E]rising up through the air\n[G]Up ahead in the distance [D]I saw a shimmering light\n[Em]My head grew heavy and my sight grew dim [F#]I had to stop for the night" },
  { title: "Knockin' on Heaven's Door", artist: "Bob Dylan", genre: "Folk", album: "Pat Garrett & Billy the Kid", chord_data: "[G]Mama take this badge off of me\n[D]I can't use it anymore\n[G]It's getting dark, [Am]too dark to see\n[D]I feel I'm knockin' on [G]heaven's door\n[G]Knock knock knockin' on [D]heaven's door\n[G]Knock knock knockin' on [Am]heaven's door" },
  { title: "Stand By Me", artist: "Ben E. King", genre: "Soul", album: "Don't Play That Song!", chord_data: "[A]When the night has come\n[A]And the land is dark\n[F#m]And the moon is the only [F#m]light we see\n[D]No I won't [E]be afraid\n[D]Oh I won't [E]be afraid\n[A]Just as long as you stand [E]stand by me [A]" },
  { title: "Creep", artist: "Radiohead", genre: "Alternative", album: "Pablo Honey", chord_data: "[G]When you were here before\n[B]Couldn't look you in the eye\n[C]You're just like an angel\n[Cm]Your skin makes me cry" },
  { title: "Someone Like You", artist: "Adele", genre: "Pop", album: "21", chord_data: "[A]I heard that you're settled down\n[E]That you found a girl [F#m]and you're married now\n[D]I heard that your dreams came true\n[A]Guess she gave you things [E]I didn't give to you" },
  { title: "The House of the Rising Sun", artist: "The Animals", genre: "Rock", album: "The Animals", chord_data: "[Am]There is [C]a house in [D]New Orleans\n[F]They call the [Am]Rising [C]Sun\n[Am]And it's [C]been the [D]ruin of [F]many a poor [Am]boy\n[E]And God I [E7]know I'm [Am]one" },
  { title: "Wish You Were Here", artist: "Pink Floyd", genre: "Rock", album: "Wish You Were Here", chord_data: "[C]So, so you think you can tell\n[D]Heaven from hell\n[Am]Blue skies from pain\n[G]Can you tell a green field\n[C]From a cold steel rail?\n[D]A smile from a veil?\n[Am]Do you think you can tell?" },
  { title: "Shape of You", artist: "Ed Sheeran", genre: "Pop", album: "÷", chord_data: "[C#m]The club isn't the best place to find a lover\n[F#]So the bar is where I go\n[A]Me and my friends at the table doing shots\n[B]Drinking faster and we talk slow" },
  { title: "Photograph", artist: "Ed Sheeran", genre: "Pop", album: "X", chord_data: "[E]Loving can hurt, loving can hurt sometimes\n[C#m]But it's the only thing that I know\n[A]When it gets hard, you know it can get hard sometimes\n[B]It is the only thing that makes us feel alive" },
  { title: "Thinking Out Loud", artist: "Ed Sheeran", genre: "Pop", album: "X", chord_data: "[D]When your legs don't work like they used to before\n[D/F#]And I can't sweep you off of your feet\n[G]Will your mouth still remember the taste of my love\n[A]Will your eyes still smile from your cheeks" },
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO songs (id, title, artist, genre, album, source, chord_data, contributor_username)
  VALUES (?, ?, ?, ?, ?, ?, ?, 'community')
`);

let count = 0;
for (const song of songs) {
  const id = `seed-${crypto.createHash('md5').update(song.title + song.artist).digest('hex').slice(0, 12)}`;
  insert.run(id, song.title, song.artist, song.genre || '', song.album || '', 'seed', song.chord_data || '');
  count++;
}

// Sync FTS
db.exec(`
  INSERT OR IGNORE INTO songs_fts(rowid, id, title, artist)
  SELECT rowid, id, title, artist FROM songs;
`);

const total = (db.prepare('SELECT count(*) as c FROM songs').get()).c;
console.log(`✓ Seeded ${count} songs. Total in DB: ${total}`);
