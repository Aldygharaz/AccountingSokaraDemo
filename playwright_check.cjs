const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  let errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', exception => {
    errors.push(exception.message);
  });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    console.log('Page loaded. Errors:', errors);
  } catch (e) {
    console.log('Failed to load:', e.message);
  }
  
  await browser.close();
})();
