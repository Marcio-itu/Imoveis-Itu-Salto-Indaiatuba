const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const path = require('path');
  const fileUrl = 'file://' + path.resolve('docs/index.html');

  const mobile = await browser.newPage({ viewport: { width: 390, height: 900 } });
  await mobile.goto(fileUrl);
  await mobile.waitForTimeout(500);
  await mobile.screenshot({ path: 'shot-mobile.png' });

  const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desktop.goto(fileUrl);
  await desktop.waitForTimeout(500);
  await desktop.screenshot({ path: 'shot-desktop.png' });

  await browser.close();
})();
