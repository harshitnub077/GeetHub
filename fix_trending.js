const fs = require('fs');

let songsContent = fs.readFileSync('src/data/songs.json', 'utf8');
let songs = JSON.parse(songsContent);
let songTitlesAndArtists = new Set(songs.map(s => s.title + '|||' + s.artist));

let trendingContent = fs.readFileSync('src/data/trending_songs.json', 'utf8');
let trending = JSON.parse(trendingContent);

let newTrending = [];
let rank = 1;
for (let t of trending) {
  if (songTitlesAndArtists.has(t.title + '|||' + t.artist) || t.title === '60 Years Of Bollywood In 4 Chords') {
    t.rank = rank++;
    newTrending.push(t);
  }
}

fs.writeFileSync('src/data/trending_songs.json', JSON.stringify(newTrending, null, 2));
console.log(`Cleaned trending_songs.json. Retained ${newTrending.length} out of ${trending.length}.`);
