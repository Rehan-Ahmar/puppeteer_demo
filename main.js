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
			const url = 'https://www.amazon.in/Lenovo-Legion-Graphics-Windows-81SY00CKIN/dp/B07W6H9YM9/ref=pd_rhf_dp_p_img_10?_encoding=UTF8&psc=1&refRID=NKVPJAJJD5SFAEWZXV4M'
			//'https://www.amazon.in/HP-15-6-inch-Windows-Natural-15-DA0326TU/dp/B07FV57FC1/ref=sr_1_7?fst=as%3Aoff&qid=1576814456&refinements=p_n_feature_thirteen_browse-bin%3A12598161031%7C12598162031%7C12598163031&rnid=12598141031&s=computers&sr=1-7'
			// 'https://www.flipkart.com/hp-14q-core-i3-7th-gen-4-gb-1-tb-hdd-windows-10-home-14q-cs0005tu-thin-light-laptop/p/itmfb4fw3qzgyyhr?pid=COMFB4FWSBFFFXSR&lid=LSTCOMFB4FWSBFFFXSRQJBU37&marketplace=FLIPKART&srno=b_1_1&otracker=browse&fm=organic&iid=en_MSXejIW5s%2FZA2jxDWalnd9qg9H6gr8f7KQY0%2Bo875lvDOOIfebZPkD68%2FAOipwrF0MWC1l6KeFGpL6ksiBSaHA%3D%3D&ssid=asyeqbfsw00000001576752161011'
			// 'https://www.flipkart.com/laptops/pr?sid=6bo,b5g'
			// 'https://paytmmall.com/laptops-glpid-6453?use_mw=1&src=store&from=storefront'
			await page.goto(url,
				{
				waitUntil: 'networkidle0', 
				timeout: 0
				}
			);
			
			await timeout(1000);
			// await page.evaluate(() => { window.scrollBy(0, document.body.scrollHeight); })
			await autoScroll(page);
			await page.evaluate(() => { window.scrollTo(0, 0); });
			
			let title = await page.$eval('#productTitle', e => e.innerText);
			let rating = await page.$eval('#acrPopover', e => e.title);
			//let feature = await page.$eval('#feature-bullets > ul > li > span', e => e.innerText)
			let features_list = await page.$$eval('#feature-bullets > ul > li > span', items => items.map(e => e.innerText))
			
			let details_list = await page.$$eval('#prodDetails .pdTab table tr', items => items.map(e => e.innerText.split("\t")))
			let details = Object.fromEntries(new Map(details_list))
			
			let thumbnails = await page.$$eval('#altImages .imageThumbnail .a-button-input', thumbnails => thumbnails.map(thumb => thumb.click()))
			let prod_imgs = await page.$$eval('.imgTagWrapper img', items => items.map(img => img.getAttribute('src')))
			
			let manufacturer_imgs = await page.$$eval('#aplus_feature_div img', items => items.map(img => img.getAttribute('src')))
							   
			var out_map = new Map([['url', url],
								   ['product_title', title],
								   ['avg_rating', rating],
								   ['features', features_list],
								   ['details', details],
								   ['product_images', prod_imgs],
								   ['manufacturer_images', manufacturer_imgs]]);
			
			var jsonString = JSON.stringify(Object.fromEntries(out_map), null, 4);
			fs.writeFile('parsed2.json', jsonString, function(err) {
				if (err) {
					console.log(err);
				}
			});
			
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
			fs.writeFile('out_bbox_details.json', jsonString, function(err) {
				if (err) {
					console.log(err);
				}
			});
			
			await page.screenshot({
				path: 'out.png',
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
