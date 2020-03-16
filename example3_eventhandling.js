const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  //console.info(browser);
  const page = await browser.newPage();
  
  // Emitted when a script within the page uses `console.timeStamp`
  page.on('metrics', data => console.info(`👉 Timestamp added at ${data.metrics.Timestamp}`));
  // Emitted when a script within the page uses `console`
  page.on('console', message => console.info(`👉 ${message.text()}`));
  // Emitted after the page is closed
  page.once('close', () => console.info('✅ Page is closed'));
  // Emitted when a script within the page uses `alert`, `prompt`, `confirm` or `beforeunload`
  page.on('dialog', async dialog => {
    console.info(`👉 ${dialog.message()}`);
    await dialog.dismiss();
  });
  
  await page.setViewport({
    width: 1920,
    height: 1080
  });

  await page.goto(
	"https://www.flipkart.com/laptops/pr?sid=6bo,b5g",
    // "https://paytmmall.com/laptops-glpid-6453?use_mw=1&src=store&from=storefront",
    {
      waitUntil: "networkidle0",
      timeout: 0
    }
  );
  
  // Triggers `metrics` event
  await page.evaluate(() => console.timeStamp());

  // Triggers `console` event
  await page.evaluate(() => console.info('A console message within the page'));

  // Triggers `dialog` event
  await page.evaluate(() => alert('An alert within the page'));

  await page.screenshot({
    path: "out2.png",
    fullPage: true
  });
  
  // Triggers `close` event
  await page.close(); 

  await browser.close();
})();

