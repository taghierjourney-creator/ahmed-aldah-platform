/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('playwright');
const { injectAxe, checkA11y } = require('axe-playwright');

(async () => {
  const base = process.env.TEST_URL || 'http://localhost:3000';
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  try {
    console.log('Visiting', base);
    await page.goto(base, { waitUntil: 'networkidle' });

    await injectAxe(page);
    // Run axe directly in the page context to avoid any adapter API mismatch
    const results = await page.evaluate(async () => {
      // window.axe is injected by injectAxe
      // eslint-disable-next-line no-undef
      return await window.axe.run();
    });

    if (!results) {
      console.error('axe.run() returned no result — treating as failure');
      await browser.close();
      process.exit(3);
    }

    if (results.violations && results.violations.length > 0) {
      console.error('Accessibility violations detected:');
      for (const v of results.violations) {
        console.error(`- ${v.id}: ${v.impact} - ${v.description}`);
      }
      // Output full JSON for CI logs
      console.error(JSON.stringify(results.violations, null, 2));
      await browser.close();
      process.exit(2);
    }

    console.log('No accessibility violations found on', base);
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('A11y check failed:', err);
    await browser.close();
    process.exit(3);
  }
})();
