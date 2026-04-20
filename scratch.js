const fs = require('fs');

const dummy1 = "[Verse]\n[C]Dil ki baatein [Am]dil hi jaane\n[F]Hum toh tere [G]deewane\n[C]Raat din bas [Am]tujhe soche\n[F]Aur kuch na [G]maange\n\n[Chorus]\n[C]Oh mere [Am]sanam\n[F]Tere [G]kasam\n[C]Sath [Am]na chodenge\n[F]Hum [G]kabhi";

const dummy2 = "[Verse]\n[Am]Kaise kahu bina [G]tere zindagi ye kya hogi\n[F]Jaise koi saza [E]koi baddua hogi\n\n[Chorus]\n[Am]Tu hi toh [G]mera khuda\n[F]Tujhse main [E]kaise juda\n[Am]Mera yeh [G]haal hai\n[F]Tera [E]khayal hai";

const dummy3 = "[Verse 1]\n[G]Lord I come to [D]You\n[Em]Let my heart be [C]changed, renewed\n[G]Flowing from the [D]grace\n[Em]That I found in [C]You\n\n[Chorus]\n[G]Lord unveil my [D]eyes\n[Em]Let me see You [C]face to face\n[G]The knowledge of Your [D]love\n[Em]As You live in [C]me";

const dummy4 = "[Verse 1]\n[C]I've been looking for a [G]way out\n[Am]But I'm stuck inside this [F]house\n[C]Thinking about the [G]memories\n[Am]That we used to [F]share\n\n[Chorus]\n[C]And I know [G]it's hard\n[Am]To be so [F]far apart\n[C]But I'll keep [G]you in my heart\n[Am]Until we meet [F]again";

function cleanFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let data = JSON.parse(content);
  let originalLen = data.length;
  
  data = data.filter(song => {
    if (!song.chord_data) return true;
    let cd = song.chord_data.trim();
    return cd !== dummy1 && cd !== dummy2 && cd !== dummy3 && cd !== dummy4;
  });
  
  if (data.length !== originalLen) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Cleaned ${filePath}: removed ${originalLen - data.length} songs.`);
  } else {
    console.log(`No fake songs found in ${filePath}`);
  }
}

cleanFile('src/data/trending_songs.json');
