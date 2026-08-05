const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const mobile = await browser.newPage({ viewport: { width: 390, height: 1000 } });
  await mobile.goto('http://localhost:8791/');
  await mobile.waitForTimeout(600);
  await mobile.screenshot({ path: 'shot-mobile2.png' });

  const desktop = await browser.newPage({ viewport: { width: 1280, height: 950 } });
  await desktop.goto('http://localhost:8791/');
  await desktop.waitForTimeout(600);
  await desktop.screenshot({ path: 'shot-desktop2.png' });
  await browser.close();
})();
