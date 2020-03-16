const puppeteer = require('puppeteer');
const fs = require('fs');

async function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

function run () {
    return new Promise(async (resolve, reject) => {
        try {
			const browser = await puppeteer.launch({ headless: false});
			const page = await browser.newPage();
			await page.setViewport({
				width: 1920,
				height: 1080
			});
			await page.goto(
				"https://www.flipkart.com/hp-14q-core-i3-7th-gen-4-gb-1-tb-hdd-windows-10-home-14q-cs0005tu-thin-light-laptop/p/itmfb4fw3qzgyyhr?pid=COMFB4FWSBFFFXSR&lid=LSTCOMFB4FWSBFFFXSRQJBU37&marketplace=FLIPKART&srno=b_1_1&otracker=browse&fm=organic&iid=en_MSXejIW5s%2FZA2jxDWalnd9qg9H6gr8f7KQY0%2Bo875lvDOOIfebZPkD68%2FAOipwrF0MWC1l6KeFGpL6ksiBSaHA%3D%3D&ssid=asyeqbfsw00000001576752161011",
				// "https://www.flipkart.com/laptops/pr?sid=6bo,b5g",
				// "https://paytmmall.com/laptops-glpid-6453?use_mw=1&src=store&from=storefront",
				{
				waitUntil: "networkidle0", 
				timeout: 0
				}
			);
			
			//await page.evaluate(() => { window.scrollBy(0, document.body.scrollHeight); })
			
			await timeout(1000);
			await autoScroll(page);
			await page.evaluate(() => { window.scrollTo(0, 0); });
			
			let results = [];
			let items = await page.$$('img');
			for (const item of items) {
				let temp_src = await item.getProperty('src');
				let src_path = await temp_src.jsonValue()
				let bbox = await item.boundingBox();
				results.push({
					'url': src_path,
					'bbox': bbox
				});
			}
			console.log(results.length);
			
			var jsonString = JSON.stringify(results, null, 4);
			fs.writeFile("out_json2.json", jsonString, function(err) {
				if (err) {
				console.log(err);
				}
			});
			
			await page.screenshot({
				path: "out2.png",
				fullPage: true
			});
			
			await page.close();
            await browser.close();
            return resolve(results);
        } catch (e) {
            return reject(e);
        }
    })
}

// run().then(console.log).catch(console.error);
run().then().catch(console.error);
