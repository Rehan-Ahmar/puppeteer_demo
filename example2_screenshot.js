const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080
  });

  await page.goto(
    "https://paytmmall.com/laptops-glpid-6453?use_mw=1&src=store&from=storefront",
    {
      waitUntil: "networkidle0",
      timeout: 0
    }
  );

  await page.screenshot({
    path: "out2.png",
    fullPage: true
  });

  await browser.close();
})();