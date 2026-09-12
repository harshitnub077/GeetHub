/**
 * scripts/normalize_db_chords.js
 * Updates all non-standard chord records in the Turso & local database
 * so every song is stored in the single canonical format.
 */

const { createClient } = require('@libsql/client/web');
const { normalizeChordSheet } = require('../src/lib/chordFormatter.ts');

const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://geethub-live-harshitkudhial.aws-ap-south-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODkyMTQzNDEsImlkIjoiMDFhMDk1N2EtMGIwMS03MzIwLWI5NDEtYmU1ODZlZWVhYTc5Iiwia2lkIjoib3k2YXFoaW5qVFBERko3M1ZWWk12ME8xbEpqcHliVGotLTNkVlBOVDQxcyIsInJpZCI6ImEyZDZkNTkzLTQyNDQtNGI3Zi1hZDRhLTRhYWRjMjQ5N2FiOSJ9.cIdEyW7qCTpUGjmM4S9yNY49as1mOBF4Lil-4ZVENEp_c2YvrCw-341Q6BxGXQJxDeo8YzzN1TxB1XEeXLd9DQ';

const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

async function main() {
  console.log('[Normalizer] Connected to database:', TURSO_URL);

  const condition = `chord_data LIKE '%[ch]%' OR chord_data LIKE '%<div%' OR chord_data LIKE '%&nbsp;%' OR chord_data LIKE '%[tab]%' OR chord_data LIKE '%:maj%'`;
  const countRes = await client.execute(`SELECT count(*) as count FROM songs WHERE ${condition}`);
  const total = countRes.rows[0].count;
  console.log(`[Normalizer] Found ${total} songs needing text format unification.`);

  if (total === 0) {
    console.log('[Normalizer] All songs are already unified!');
    return;
  }

  const BATCH_SIZE = 100;
  let updated = 0;

  while (true) {
    const batch = await client.execute({
      sql: `SELECT id, title, chord_data FROM songs WHERE ${condition} LIMIT ?`,
      args: [BATCH_SIZE],
    });

    if (!batch.rows || batch.rows.length === 0) break;

    const stmts = batch.rows.map((row) => {
      const normalized = normalizeChordSheet(row.chord_data);
      return {
        sql: 'UPDATE songs SET chord_data = ? WHERE id = ?',
        args: [normalized, row.id],
      };
    });

    await client.batch(stmts, 'write');
    updated += batch.rows.length;
    console.log(`[Normalizer] Normalized ${updated}/${total} songs...`);
  }

  console.log(`[Normalizer] Successfully normalized ${updated} songs into the golden GeetHub format!`);
}

main().catch(console.error);
