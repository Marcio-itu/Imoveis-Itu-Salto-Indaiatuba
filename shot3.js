const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 950 } });
  page.on('console', m => console.log('CONSOLE:', m.text()));
  page.on('pageerror', e => console.log('PAGEERROR:', e.message));
  page.on('requestfailed', r => console.log('REQFAIL:', r.url(), r.failure()?.errorText));
  await page.goto('http://localhost:8792/');
  await page.waitForTimeout(1500);
  await page.evaluate(() => { document.querySelectorAll('.banner-photos img')[0].style.opacity = 1; });
  await page.screenshot({ path: 'shot-desktop3.png' });
  await browser.close();
})();
