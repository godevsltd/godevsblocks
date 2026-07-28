/**
 * GoBlocks Full Visual Audit — full-page screenshots of all blocks and patterns
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8080';
const OUT = path.join(__dirname, 'audit-shots');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

async function login(page) {
  await page.goto(`${BASE}/wp-admin/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.fill('#user_login', 'admin');
  await page.fill('#user_pass', 'password');
  await page.click('#wp-submit');
  await page.waitForURL('**/wp-admin/**', { timeout: 20000 });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0,150)); });

  await login(page);

  // ─── 1. All Blocks Showcase ───────────────────────────────────────────────
  console.log('Capturing All Blocks showcase...');
  await page.goto(`${BASE}/goblocks-all-blocks/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  const gbCount = await page.locator('[class*="gb-"]').count();
  const jsErrCount = consoleErrors.length;

  // Multiple viewport screenshots (1400x900 = ~4 shots for a tall page)
  await page.screenshot({ path: path.join(OUT, 'blocks-01-top.png') });
  await page.evaluate(() => window.scrollTo(0, 2000));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'blocks-02-mid1.png') });
  await page.evaluate(() => window.scrollTo(0, 4000));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'blocks-03-mid2.png') });
  await page.evaluate(() => window.scrollTo(0, 6000));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'blocks-04-mid3.png') });
  await page.evaluate(() => window.scrollTo(0, 8000));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'blocks-05-bottom.png') });

  console.log(`  GoBlocks elements: ${gbCount}, JS errors: ${jsErrCount}`);
  consoleErrors.length = 0;

  // ─── 2. All Patterns Showcase ─────────────────────────────────────────────
  console.log('Capturing All Patterns showcase...');
  await page.goto(`${BASE}/goblocks-all-patterns/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  const patCount = await page.locator('[class*="gb-"]').count();

  await page.screenshot({ path: path.join(OUT, 'patterns-01-top.png') });
  await page.evaluate(() => window.scrollTo(0, 3000));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'patterns-02-sec2.png') });
  await page.evaluate(() => window.scrollTo(0, 6000));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'patterns-03-sec3.png') });
  await page.evaluate(() => window.scrollTo(0, 9000));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'patterns-04-sec4.png') });
  await page.evaluate(() => window.scrollTo(0, 12000));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'patterns-05-sec5.png') });
  await page.evaluate(() => window.scrollTo(0, 15000));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'patterns-06-sec6.png') });
  await page.evaluate(() => window.scrollTo(0, 18000));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'patterns-07-sec7.png') });
  await page.evaluate(() => window.scrollTo(0, 21000));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'patterns-08-sec8.png') });

  console.log(`  GoBlocks elements: ${patCount}`);

  // ─── 3. Pattern panel in editor ───────────────────────────────────────────
  console.log('Capturing pattern panel thumbnails...');
  await page.goto(`${BASE}/wp-admin/post-new.php?post_type=page`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  const btn = page.locator('button[aria-label="Block Inserter"]').first();
  await btn.waitFor({ state: 'visible', timeout: 10000 });
  await btn.click();
  await page.waitForTimeout(1500);

  await page.locator('[role="tab"]:has-text("Patterns")').click();
  await page.waitForTimeout(3000);

  // Click GoBlocks category
  await page.mouse.click(310, 479);
  await page.waitForTimeout(7000);
  await page.screenshot({ path: path.join(OUT, 'editor-patterns-01.png') });

  // Scroll the pattern list panel
  for (let i = 2; i <= 6; i++) {
    await page.mouse.wheel(0, 500, { x: 608, y: 500 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT, `editor-patterns-0${i}.png`) });
  }

  await browser.close();
  console.log('\nAll screenshots saved to', OUT);
})().catch(e => { console.error('Fatal:', e.message); process.exit(1); });