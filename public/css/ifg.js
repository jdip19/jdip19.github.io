const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const links = [
    'https://www.flaticon.com/free-icon/test-tube_7691263?term=test&page=1&position=8&origin=style&related_id=7691263',
    // Add more links here
];

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    for (const link of links) {
        await page.goto(link);

        // Wait for the page to load and the button to appear
        await page.waitForSelector('#detail_edit_icon');

        // Click the button
        await page.click('#detail_edit_icon');

        // Wait for the editor to appear
        await page.waitForSelector('.detail__editor');

        // Fetch the inner HTML
        const svgHtml = await page.evaluate(() => {
            const editor = document.querySelector('.detail__editor__icon-holder.icon-holder svg');
            return editor ? editor.outerHTML : null;
        });

        if (svgHtml) {
            // Generate a filename based on the link or use any other logic for naming
            const filename = path.basename(link).split('?')[0] + '.svg';

            // Save the SVG code as a .svg file
            fs.writeFileSync(filename, svgHtml);
            console.log(`Saved SVG as ${filename}`);
        } else {
            console.log('SVG not found on page:', link);
        }

        // Optional: Add a delay between requests to avoid being rate-limited
        await page.waitForTimeout(2000); // 2 seconds
    }

    await browser.close();
})();
