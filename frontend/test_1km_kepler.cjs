const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('http://localhost:5180');
  console.log('Loading frontend...');
  await page.waitForTimeout(3000);

  // 1. Capture All-India National View (Default View)
  await page.screenshot({ path: '/Users/aadeshkhande/.gemini/antigravity-ide/brain/ef4d6bbc-eec5-448f-88aa-3ab2cc998a1d/scratch/kepler_1km_all_india.png' });
  console.log('Saved kepler_1km_all_india.png');

  // 2. Capture Central India Regional View (Nagpur / Betul / Chhindwara [78.6, 21.6], zoom 7.4)
  await page.evaluate(() => {
    if (window.__MAP__) {
      window.__MAP__.flyTo({
        center: [78.6, 21.6],
        zoom: 7.4,
        duration: 500
      });
    }
  });

  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/Users/aadeshkhande/.gemini/antigravity-ide/brain/ef4d6bbc-eec5-448f-88aa-3ab2cc998a1d/scratch/kepler_1km_central_india.png' });
  console.log('Saved kepler_1km_central_india.png');

  await browser.close();
})();
