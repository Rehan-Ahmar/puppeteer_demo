const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.flipkart.com/search?q=laptop&page=1');
  //await page.waitForNavigation({'waitUntil' : 'networkidle'});
  await page.waitFor(90000);
  // await page.screenshot({path: 'example.png'});
  await page.screenshot({path: 'results.png', fullPage: true});

  await browser.close();
})();