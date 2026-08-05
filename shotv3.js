const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 850 } });
  await desktop.goto('http://localhost:8794/');
  await desktop.waitForTimeout(1200);
  await desktop.evaluate(() => { document.querySelectorAll('.banner-photos img')[0].style.opacity = 1; });
  await desktop.screenshot({ path: 'shot-desktop-v3.png' });
  await browser.close();
})();
