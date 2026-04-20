const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api') || url.includes('wrytups') || url.includes('feed')) {
      console.log('Found API request:', url);
    }
  });

  await page.goto('https://wrytin.com/dhruvi1', { waitUntil: 'networkidle2' });
  
  // Scroll a few times
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await new Promise(r => setTimeout(r, 1000));
  }
  
  await browser.close();
})();
