const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const mobile = await browser.newPage({ viewport: { width: 390, height: 1000 } });
  await mobile.goto('http://localhost:8793/');
  await mobile.waitForTimeout(1200);
  await mobile.evaluate(() => { document.querySelectorAll('.hero-photo-mobile img')[0].style.opacity = 1; });
  await mobile.screenshot({ path: 'shot-mobile-v2.png' });

  const desktop = await browser.newPage({ viewport: { width: 1280, height: 950 } });
  await desktop.goto('http://localhost:8793/');
  await desktop.waitForTimeout(1200);
  await desktop.evaluate(() => { document.querySelectorAll('.banner-photos img')[0].style.opacity = 1; });
  await desktop.screenshot({ path: 'shot-desktop-v2.png' });
  await browser.close();
})();
