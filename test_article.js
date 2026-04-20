const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  try {
    const res = await axios.get('https://wrytin.com/dhruvi1/ganga-ke-kinare-guitar-chords-bunny-sagar-mnscjovt');
    const $ = cheerio.load(res.data);
    let rawContent = '';
    $('p, pre').each((idx, el) => {
       rawContent += $(el).text() + '\n';
    });
    console.log(rawContent.trim());
  } catch(e) {
    console.log("Error:", e.message);
  }
}
test();
