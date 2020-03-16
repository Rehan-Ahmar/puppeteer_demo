const puppeteer = require('puppeteer');
function run () {
    return new Promise(async (resolve, reject) => {
        try {
			const browser = await puppeteer.launch({ headless: false });
			const page = await browser.newPage();
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
			
			console.log('------------ 1 ------------')
			let results = [];
			let items = await page.$$('img');
			for (const item of items) {
				let temp_src = await item.getProperty('src');
				src_path = await temp_src.jsonValue()
				let bbox = await item.boundingBox();
				results.push({
					'url': src_path,
					'bbox': bbox
				});
			}
			console.log(results)
			
			
			console.log('------------ 2 ------------')
			// const imgs = await page.$$eval('img', imgs => imgs.map(img => img.getAttribute('src')));
			const imgs = await page.$$eval('img', imgs => imgs.map(img => {
				return { 'url': img.getAttribute('src') } // , 'bbox': await img.boundingBox() 
			}));
			console.log(imgs);
			
			
			
			console.log('------------ 3 ------------')
			let results3 = await page.evaluate(() => {
                let temp = [];
                let items = document.querySelectorAll('img'); 
                items.forEach((item) => {
                    temp.push({
                        url:  item.getAttribute('src')
                    });
                });
                return temp;
            })
			console.log(results3);
			
            browser.close();
            return resolve(results);
        } catch (e) {
            return reject(e);
        }
    })
}
run().then(console.log).catch(console.error);