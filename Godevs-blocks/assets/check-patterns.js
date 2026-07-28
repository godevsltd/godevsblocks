const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'pattern-shots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive:true});

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

  // Login
  await page.goto('http://localhost:8080/wp-admin/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.fill('#user_login', 'admin');
  await page.fill('#user_pass', 'password');
  await page.click('#wp-submit');
  await page.waitForURL('**/wp-admin/**', { timeout: 20000 });

  // Open block editor
  await page.goto('http://localhost:8080/wp-admin/post-new.php?post_type=page', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Open Block Inserter
  const inserterBtn = page.locator('button[aria-label="Block Inserter"]').first();
  await inserterBtn.waitFor({ state: 'visible', timeout: 10000 });
  await inserterBtn.click();
  await page.waitForTimeout(2000);

  // Click Patterns tab
  await page.locator('[role="tab"]:has-text("Patterns")').click();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(dir, '01-patterns-categories.png') });
  console.log('Patterns categories screenshot saved');

  // Click GoBlocks category — scope within the inserter panel to avoid the admin sidebar link
  const inserterArea = page.locator('.block-editor-inserter__panel-content, .block-editor-inserter__main-area, [class*="inserter__panel"]').first();
  const goblocksInInserter = inserterArea.locator('text=GoBlocks');
  if (await goblocksInInserter.isVisible({ timeout: 3000 }).catch(() => false)) {
    await goblocksInInserter.click();
  } else {
    // Fallback: click by coordinates within the inserter area (approx x=200, y=479)
    await page.mouse.click(200, 479);
  }
  await page.waitForTimeout(6000); // Wait for pattern thumbnails to render
  await page.screenshot({ path: path.join(dir, '02-goblocks-patterns.png') });
  console.log('GoBlocks patterns panel screenshot saved');

  // Scroll down to see more patterns
  const inserterPanel = page.locator('.block-editor-inserter__panel-content').first();
  await inserterPanel.evaluate(el => el.scrollTop += 600).catch(() => {});
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(dir, '03-goblocks-patterns-scrolled.png') });
  console.log('Scrolled patterns screenshot saved');

  // Check CSS in pattern preview iframes
  const frames = page.frames();
  let previewFrameCount = 0;
  let goblocksInPreview = 0;
  for (const frame of frames) {
    const name = frame.name();
    const url = frame.url();
    if (name !== 'editor-canvas' && (url.includes('blob:') || url.includes('srcdoc'))) {
      previewFrameCount++;
      const styles = await frame.locator('style').allTextContents().catch(() => []);
      const gbStyles = styles.filter(s => s.includes('.gb-'));
      if (gbStyles.length > 0) goblocksInPreview++;
    }
  }
  console.log(`\nPattern preview iframes found: ${previewFrameCount}`);
  console.log(`Iframes with GoBlocks CSS: ${goblocksInPreview}`);

  // Also check the editor canvas iframe
  for (const frame of frames) {
    if (frame.name() === 'editor-canvas') {
      const styles = await frame.locator('style').allTextContents().catch(() => []);
      const gbStyles = styles.filter(s => s.includes('.gb-'));
      console.log(`Editor canvas: ${styles.length} styles, ${gbStyles.length} GoBlocks`);
    }
  }

  await browser.close();
  console.log('\nDone. Screenshots saved to', dir);
})().catch(e => { console.error('Fatal:', e.message); process.exit(1); });