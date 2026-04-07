const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'geethub_master.db');

try {
  const db = new DatabaseSync(DB_PATH);

  console.log("Creating database indexes to optimize queries...");

  // Index for exact querying and sorting
  db.exec(`CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_songs_created_at ON songs(created_at DESC);`);
  
  // Composite index for the GROUP BY title, artist queries which run on explore page loads
  db.exec(`CREATE INDEX IF NOT EXISTS idx_songs_title_artist ON songs(title, artist);`);

  // Optimize SQLite pragmas for reading
  db.exec(`PRAGMA journal_mode = WAL;`);
  db.exec(`PRAGMA synchronous = NORMAL;`);
  db.exec(`PRAGMA temp_store = MEMORY;`);
  db.exec(`PRAGMA mmap_size = 3000000000;`); // Use memory-mapped I/O
  
  // Run optimize on the FTS table
  console.log("Optimizing FTS5 table...");
  db.exec(`INSERT INTO songs_fts(songs_fts) VALUES('optimize');`);

  // Compute database statistics for query planner
  console.log("Analyzing database...");
  db.exec(`ANALYZE;`);

  console.log("Database optimization complete.");
} catch (err) {
  console.error("Failed to optimize DB:", err);
}
