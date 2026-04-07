const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const songsPath = path.join(__dirname, '../src/data/songs.json');
  console.log('Reading songs from:', songsPath);
  
  if (!fs.existsSync(songsPath)) {
    console.error('songs.json not found!');
    return;
  }

  const songsData = JSON.parse(fs.readFileSync(songsPath, 'utf8'));
  console.log(`Found ${songsData.length} songs to seed.`);

  for (const song of songsData) {
    try {
      await prisma.song.upsert({
        where: { id: song.id },
        update: {
          title: song.title,
          artist: song.artist,
          genre: song.genre || 'Various',
          album: song.album || 'Compilation',
          chord_data: song.chord_data,
          contributor_username: song.contributor_username || 'anonymous',
          source: song.source || 'indichords'
        },
        create: {
          id: song.id,
          title: song.title,
          artist: song.artist,
          genre: song.genre || 'Various',
          album: song.album || 'Compilation',
          chord_data: song.chord_data,
          contributor_username: song.contributor_username || 'anonymous',
          source: song.source || 'indichords'
        }
      });
    } catch (e) {
      console.error(`Failed to upsert song ${song.id}:`, e.message);
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
