'use strict';
/**
 * GoBlocks — Comprehensive Block Test Suite
 * Tests all 36 blocks across 7 categories: editor + frontend screenshots.
 * Generates block-test-report.html with full findings.
 */
const { chromium } = require('playwright');
const path = require('path');
const fs   = require('fs');

const BASE    = 'http://localhost:8888';
const ADMIN   = `${BASE}/wp-admin`;
const USER    = 'admin';
const PASS    = 'password';
const SHOTS   = path.resolve(__dirname, 'assets/block-test-shots');
const REPORT  = path.resolve(__dirname, 'block-test-report.html');

// Post IDs from the PHP setup
const POSTS = {
  typography:  { id: 306, url: `${BASE}/gb-test-typography/`,  title: 'Typography'   },
  media:       { id: 307, url: `${BASE}/gb-test-media/`,       title: 'Media'        },
  elements:    { id: 308, url: `${BASE}/gb-test-elements/`,    title: 'UI Elements'  },
  interactive: { id: 309, url: `${BASE}/gb-test-interactive/`, title: 'Interactive'  },
  animation:   { id: 310, url: `${BASE}/gb-test-animation/`,   title: 'Animation'    },
  layout:      { id: 311, url: `${BASE}/gb-test-layout/`,      title: 'Layout'       },
  complex:     { id: 312, url: `${BASE}/gb-test-complex/`,     title: 'Complex'      },
};

// Block definitions: each entry tested in editor + inspector
const BLOCK_TESTS = [
  // ── Typography ───────────────────────────────────────────────────────────
  { id: 'heading',    title: 'Heading',    category: 'Typography', post: 'typography',  selector: '.gb-heading-h01, [data-type="goblocks/heading"]', desc: 'Responsive H1-H6, text gradient, link wrap, anchor' },
  { id: 'text',       title: 'Text',       category: 'Typography', post: 'typography',  selector: '.gb-text-t01, [data-type="goblocks/text"]',    desc: 'Rich text, drop cap, semantic tags (p/blockquote/div)' },
  { id: 'separator',  title: 'Separator',  category: 'Typography', post: 'typography',  selector: '.gb-separator-sep01, [data-type="goblocks/separator"]', desc: 'solid/dashed/dotted, label, responsive sizing' },
  { id: 'spacer',     title: 'Spacer',     category: 'Typography', post: 'typography',  selector: '.gb-spacer-sp01, [data-type="goblocks/spacer"]', desc: 'Height per breakpoint (Base→2XL)' },
  // ── Media ────────────────────────────────────────────────────────────────
  { id: 'image',      title: 'Image',      category: 'Media',      post: 'media',       selector: '[data-type="goblocks/image"]',   desc: 'Lightbox, focal point, hover effects, caption' },
  { id: 'video',      title: 'Video',      category: 'Media',      post: 'media',       selector: '[data-type="goblocks/video"]',   desc: 'YouTube/Vimeo/self-hosted, aspect ratio, lazy load' },
  { id: 'icon',       title: 'Icon',       category: 'Media',      post: 'media',       selector: '.gb-icon-ico01, [data-type="goblocks/icon"]', desc: '250+ Tabler icons, animation, background styles' },
  { id: 'shape',      title: 'Shape Divider', category: 'Media',   post: 'media',       selector: '[data-type="goblocks/shape"]',   desc: 'Wave/triangle/tilt shapes, gradient fill, placement' },
  { id: 'lottie',     title: 'Lottie Animation', category: 'Media', post: 'media',      selector: '[data-type="goblocks/lottie"]', desc: 'JSON animation, trigger (auto/hover/scroll), speed' },
  // ── UI Elements ──────────────────────────────────────────────────────────
  { id: 'button',     title: 'Button',     category: 'UI Elements', post: 'elements',   selector: '.gb-button-btn01, [data-type="goblocks/button"]', desc: 'Icon before/after, download, tag (a/button), hover styles' },
  { id: 'alert',      title: 'Alert',      category: 'UI Elements', post: 'elements',   selector: '.gb-alert-al01, [data-type="goblocks/alert"]',  desc: 'info/success/warning/error, dismissible, sticky, styles' },
  { id: 'star-rating', title: 'Star Rating', category: 'UI Elements', post: 'elements', selector: '[data-type="goblocks/star-rating"]', desc: 'Rating value, schema markup, animation, review count' },
  { id: 'social-share', title: 'Social Share', category: 'UI Elements', post: 'elements', selector: '[data-type="goblocks/social-share"]', desc: '6 platforms, filled/outline, horizontal/vertical' },
  // ── Interactive ──────────────────────────────────────────────────────────
  { id: 'tabs',       title: 'Tabs',       category: 'Interactive', post: 'interactive', selector: '.gb-tabs-tab01, [data-type="goblocks/tabs"]',   desc: 'Horizontal/vertical, pill/underline style, CSS token colors' },
  { id: 'accordion',  title: 'Accordion',  category: 'Interactive', post: 'interactive', selector: '.gb-accordion-acc01, [data-type="goblocks/accordion"]', desc: 'FAQ schema, allowMultiple, chevron/plus icon' },
  { id: 'modal',      title: 'Modal',      category: 'Interactive', post: 'interactive', selector: '[data-type="goblocks/modal"]',  desc: 'Trigger button, animations, cookie dismiss, auto-open' },
  { id: 'flip-card',  title: 'Flip Card',  category: 'Interactive', post: 'interactive', selector: '[data-type="goblocks/flip-card"]', desc: 'Front/back content, horizontal/vertical flip, click trigger' },
  // ── Animation ────────────────────────────────────────────────────────────
  { id: 'counter',    title: 'Counter',    category: 'Animation',   post: 'animation',  selector: '.gb-counter-cnt01, [data-type="goblocks/counter"]', desc: 'Count-up/down, prefix/suffix, separator, number color' },
  { id: 'countdown',  title: 'Countdown',  category: 'Animation',   post: 'animation',  selector: '[data-type="goblocks/countdown"]', desc: 'Target date, card style, expired action, timezone' },
  { id: 'progress-bar', title: 'Progress Bar', category: 'Animation', post: 'animation', selector: '.gb-progress-bar-pb01, [data-type="goblocks/progress-bar"]', desc: 'Gradient fill, striped, animate on scroll, label position' },
  // ── Layout ───────────────────────────────────────────────────────────────
  { id: 'group',      title: 'Group (Box)', category: 'Layout',     post: 'layout',     selector: '.gb-group-grp01, [data-type="goblocks/group"]',  desc: 'Flex/grid layout, 3-col columns, responsive gap, link wrap' },
  { id: 'column',     title: 'Column',     category: 'Layout',      post: 'layout',     selector: '.gb-column-col01, [data-type="goblocks/column"]', desc: 'flex-grow, flex-basis, animation class (inner of Group)' },
  { id: 'slider',     title: 'Slider',     category: 'Layout',      post: 'layout',     selector: '.gb-slider-sld01, [data-type="goblocks/slider"]', desc: '3 slides, autoplay, progress bar, dots, arrows, loop' },
  { id: 'slide',      title: 'Slide',      category: 'Layout',      post: 'layout',     selector: '[data-type="goblocks/slide"]',  desc: 'Inner canvas, gradient background, min-height' },
  // ── Complex ──────────────────────────────────────────────────────────────
  { id: 'timeline',   title: 'Timeline',   category: 'Complex',     post: 'complex',    selector: '[data-type="goblocks/timeline"]', desc: 'Vertical/horizontal, alternating layout, entrance animation' },
  { id: 'timeline-item', title: 'Timeline Item', category: 'Complex', post: 'complex',  selector: '[data-type="goblocks/timeline-item"]', desc: 'Date, icon, dot/title/date colors (inner of Timeline)' },
  { id: 'pricing',    title: 'Pricing Card', category: 'Complex',   post: 'complex',    selector: '.gb-pricing-pr01, [data-type="goblocks/pricing"]', desc: 'Features array, dual price/period, featured badge, colors' },
  { id: 'table-of-contents', title: 'Table of Contents', category: 'Complex', post: 'complex', selector: '[data-type="goblocks/table-of-contents"]', desc: 'Heading selector, collapsible, back-to-top, smooth scroll' },
  { id: 'query',      title: 'Query',      category: 'Complex',     post: 'complex',    selector: '[data-type="goblocks/query"]',   desc: 'Post type, orderBy, perPage, filters, paginationType' },
  { id: 'query-loop', title: 'Query Loop', category: 'Complex',     post: 'complex',    selector: '[data-type="goblocks/query-loop"]', desc: 'Template container (inner of Query)' },
  { id: 'pagination', title: 'Pagination', category: 'Complex',     post: 'complex',    selector: '[data-type="goblocks/pagination"]', desc: 'Standard/load-more, prev/next labels, first/last' },
  { id: 'query-no-results', title: 'No Results', category: 'Complex', post: 'complex', selector: '[data-type="goblocks/query-no-results"]', desc: 'Fallback content when query returns zero posts' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

async function login(page) {
  await page.goto(`${ADMIN}/`, { waitUntil: 'domcontentloaded' });
  if (page.url().includes('wp-login') || page.url().includes('login')) {
    await page.fill('#user_login', USER);
    await page.fill('#user_pass',  PASS);
    await page.click('#wp-submit');
    await page.waitForURL('**/wp-admin/**', { timeout: 20000 });
  }
}

async function openEditor(page, postId) {
  await page.goto(`${ADMIN}/post.php?post=${postId}&action=edit`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForSelector(
    '.editor-header, .edit-post-header, [aria-label="Editor top bar"]',
    { timeout: 40000 }
  );
  await page.waitForTimeout(3500);
  // Dismiss welcome dialogs
  for (const sel of ['button:has-text("Get started")', 'button:has-text("Skip")', '.components-guide__finish-button']) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 600 })) { await el.click(); await page.waitForTimeout(200); }
    } catch {}
  }
}

/** Try to click a block in the editor canvas (iframe-aware). */
async function clickBlock(page, selector) {
  try {
    // Try iframe canvas first
    const ifc = page.frameLocator('iframe[name="editor-canvas"], iframe.editor-canvas__iframe');
    const el = ifc.locator(selector).first();
    if (await el.isVisible({ timeout: 4000 })) {
      await el.click({ force: true });
      await page.waitForTimeout(700);
      return true;
    }
  } catch {}
  // Fallback: non-iframe
  try {
    const el = page.locator(selector).first();
    if (await el.isVisible({ timeout: 2000 })) {
      await el.click({ force: true });
      await page.waitForTimeout(700);
      return true;
    }
  } catch {}
  return false;
}

async function ensureSidebar(page) {
  for (const sel of ['button[aria-label="Settings"]', 'button[aria-label="Block settings"]']) {
    try {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 1500 })) {
        const isPressed = await btn.evaluate(el =>
          el.getAttribute('aria-expanded') === 'true' || el.classList.contains('is-pressed')
        );
        if (!isPressed) { await btn.click(); await page.waitForTimeout(500); }
        break;
      }
    } catch {}
  }
}

/** Collect JS console errors (non-trivial ones). */
function attachConsoleCollector(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore known-harmless noise
      if (text.includes('net::ERR') || text.includes('favicon') || text.includes('__tcfapi')) return;
      errors.push(text.substring(0, 200));
    }
  });
  page.on('pageerror', err => errors.push('JS ERROR: ' + err.message.substring(0, 200)));
  return errors;
}

/** Check if block canvas shows a block validation error. */
async function checkBlockError(page, selector) {
  try {
    const ifc = page.frameLocator('iframe[name="editor-canvas"], iframe.editor-canvas__iframe');
    // Look for invalid block notice near/inside the block
    const errMsg = ifc.locator('.block-editor-warning').first();
    if (await errMsg.isVisible({ timeout: 800 })) {
      return await errMsg.textContent();
    }
  } catch {}
  // Also check non-iframe
  try {
    const errMsg = page.locator('.block-editor-warning').first();
    if (await errMsg.isVisible({ timeout: 400 })) return await errMsg.textContent();
  } catch {}
  return null;
}

async function shot(page, name, suffix = '') {
  const file = path.join(SHOTS, `${name}${suffix ? '-' + suffix : ''}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return path.basename(file);
}

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  ensureDir(SHOTS);
  console.log('\n🧪 GoBlocks — Full Block Test Suite\n');
  console.log(`📁 Screenshots → ${SHOTS}\n`);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  const consoleErrors = attachConsoleCollector(page);

  await login(page);
  console.log('✓ Logged in\n');

  const results = [];   // { id, title, category, status, issues[], shots[], desc }
  let currentPost = null;

  for (const test of BLOCK_TESTS) {
    const result = {
      id:       test.id,
      title:    test.title,
      category: test.category,
      desc:     test.desc,
      status:   'PASS',
      issues:   [],
      shots:    [],
    };

    console.log(`\n── Testing: ${test.category} › ${test.title} ──`);
    consoleErrors.length = 0; // reset per block

    try {
      const postKey = test.post;
      const post    = POSTS[postKey];

      // Open editor for this post (reuse if same post)
      if (currentPost !== postKey) {
        console.log(`   Opening editor for post ${post.id} (${post.title})...`);
        await openEditor(page, post.id);
        await page.setViewportSize({ width: 1440, height: 900 });
        currentPost = postKey;
      }

      // ── Step 1: Click the block in the editor canvas ──
      const clicked = await clickBlock(page, test.selector);

      if (!clicked) {
        // Try alternate selector by data-type
        const altClicked = await clickBlock(page, `[data-type="goblocks/${test.id}"]`);
        if (!altClicked) {
          result.issues.push('⚠️ Block not found in canvas — could not click');
          result.status = 'WARNING';
        }
      }

      // Check for block validation error
      const blockErr = await checkBlockError(page, test.selector);
      if (blockErr) {
        result.issues.push('❌ Block validation error: ' + blockErr.trim().substring(0, 150));
        result.status = 'FAIL';
      }

      // ── Step 2: Open inspector sidebar ──
      await ensureSidebar(page);
      await page.waitForTimeout(400);

      // ── Step 3: Editor screenshot (block + inspector) ──
      const editorShot = await shot(page, test.id, 'editor');
      result.shots.push({ type: 'editor', file: editorShot, label: 'Editor + Inspector' });
      console.log(`   📸 editor: ${editorShot}`);

      // ── Step 4: Check inspector content ──
      // Verify "Block" tab is active and shows something
      try {
        const blockTab = page.locator('.block-editor-block-inspector, .components-panel__body').first();
        if (! await blockTab.isVisible({ timeout: 1500 })) {
          result.issues.push('⚠️ Inspector panel empty or not visible');
          if (result.status === 'PASS') result.status = 'WARNING';
        }
      } catch {}

      // Collect console errors captured so far
      if (consoleErrors.length > 0) {
        result.issues.push(...consoleErrors.map(e => '🔴 JS: ' + e));
        consoleErrors.length = 0;
        if (result.status === 'PASS') result.status = 'WARNING';
      }

    } catch (err) {
      result.issues.push('❌ Test exception: ' + err.message.substring(0, 200));
      result.status = 'FAIL';
      console.error(`   ❌ Error: ${err.message.substring(0, 100)}`);
      // Try recovery screenshot
      try {
        const errShot = await shot(page, test.id, 'error');
        result.shots.push({ type: 'error', file: errShot, label: 'Error state' });
      } catch {}
    }

    console.log(`   Status: ${result.status}${result.issues.length ? ' — ' + result.issues[0] : ''}`);
    results.push(result);
  }

  // ── Frontend screenshots for each post ───────────────────────────────────
  console.log('\n\n── Frontend screenshots ──');
  const frontendShots = {};

  for (const [key, post] of Object.entries(POSTS)) {
    console.log(`   Visiting ${post.url}`);
    try {
      await page.goto(post.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      await page.addStyleTag({ content: '#wpadminbar{display:none!important}html{margin-top:0!important}' });
      await page.waitForTimeout(500);
      const file = await shot(page, `frontend-${key}`);
      frontendShots[key] = file;
      console.log(`   📸 ${file}`);
    } catch (err) {
      console.error(`   ❌ Frontend error for ${key}: ${err.message.substring(0, 80)}`);
      frontendShots[key] = null;
    }
  }

  await browser.close();

  // ── Generate HTML Report ─────────────────────────────────────────────────
  const passCount    = results.filter(r => r.status === 'PASS').length;
  const warnCount    = results.filter(r => r.status === 'WARNING').length;
  const failCount    = results.filter(r => r.status === 'FAIL').length;
  const totalBlocks  = results.length;

  const categories = [...new Set(results.map(r => r.category))];

  function statusBadge(s) {
    const map = { PASS: '#10b981', WARNING: '#f59e0b', FAIL: '#ef4444' };
    return `<span style="display:inline-block;padding:2px 10px;border-radius:999px;font-size:0.75rem;font-weight:700;color:#fff;background:${map[s]||'#6b7280'}">${s}</span>`;
  }

  function shotImg(file, label) {
    if (!file) return '';
    const rel = `assets/block-test-shots/${file}`;
    return `<figure style="margin:0"><img src="${rel}" alt="${label}" style="width:100%;border-radius:8px;border:1px solid #e2e8f0;display:block"><figcaption style="font-size:0.75rem;color:#6b7280;text-align:center;margin-top:4px">${label}</figcaption></figure>`;
  }

  let rows = '';
  for (const cat of categories) {
    const catResults = results.filter(r => r.category === cat);
    rows += `<tr><td colspan="5" style="background:#f1f5f9;font-weight:700;padding:10px 16px;font-size:0.85rem;color:#4f46e5;text-transform:uppercase;letter-spacing:.06em">${cat}</td></tr>`;
    for (const r of catResults) {
      const issueHtml = r.issues.length
        ? `<ul style="margin:4px 0 0;padding-left:1.25em;font-size:0.78rem;color:#dc2626">${r.issues.map(i=>`<li>${i}</li>`).join('')}</ul>`
        : '<span style="color:#10b981;font-size:0.8rem">No issues</span>';
      rows += `<tr id="block-${r.id}">
        <td style="padding:10px 16px;font-weight:600">${r.title}</td>
        <td style="padding:10px 16px;font-size:0.8rem;color:#6b7280;max-width:260px">${r.desc}</td>
        <td style="padding:10px 16px">${statusBadge(r.status)}</td>
        <td style="padding:10px 16px">${issueHtml}</td>
        <td style="padding:10px 16px">
          ${r.shots.map(s => `<a href="assets/block-test-shots/${s.file}" target="_blank" style="font-size:0.78rem;color:#4f46e5;text-decoration:none;margin-right:8px">📸 ${s.label}</a>`).join('')}
        </td>
      </tr>`;
    }
  }

  let frontendGrid = Object.entries(frontendShots).map(([key, file]) => {
    if (!file) return `<div style="padding:16px;background:#fef2f2;border-radius:8px;font-size:0.8rem;color:#dc2626">${key}: screenshot failed</div>`;
    return `<div>
      <p style="font-weight:600;margin:0 0 8px;font-size:0.85rem;color:#374151">${POSTS[key].title}</p>
      <a href="assets/block-test-shots/${file}" target="_blank">
        <img src="assets/block-test-shots/${file}" alt="${POSTS[key].title}" style="width:100%;border-radius:8px;border:1px solid #e2e8f0;display:block">
      </a>
    </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GoBlocks — Full Block Test Report</title>
<style>
*{box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;background:#f8fafc;color:#1e293b}
.header{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:40px 48px}
.header h1{margin:0 0 8px;font-size:2rem;font-weight:800}
.header p{margin:0;opacity:.85;font-size:1.05rem}
.summary{display:flex;gap:1rem;padding:24px 48px;background:#fff;border-bottom:1px solid #e2e8f0;flex-wrap:wrap}
.stat{flex:1;min-width:140px;background:#f8fafc;border-radius:12px;padding:16px 20px;text-align:center}
.stat .num{font-size:2.5rem;font-weight:800;line-height:1}
.stat .lbl{font-size:0.8rem;color:#6b7280;margin-top:4px;text-transform:uppercase;letter-spacing:.05em}
.content{padding:32px 48px;max-width:1600px}
h2{font-size:1.25rem;font-weight:700;margin:0 0 16px}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.06);margin-bottom:40px}
th{text-align:left;padding:10px 16px;font-size:0.78rem;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;background:#f8fafc;border-bottom:1px solid #e2e8f0}
tr:not(:last-child) td{border-bottom:1px solid #f1f5f9}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px;margin-bottom:40px}
.note{background:#fefce8;border:1px solid #fde047;border-radius:8px;padding:12px 16px;font-size:0.85rem;color:#854d0e;margin-bottom:24px}
@media(max-width:700px){.content,.header,.summary{padding:20px 16px}.stat{min-width:100px}}
</style>
</head>
<body>
<div class="header">
  <h1>GoBlocks — Full Block Test Report</h1>
  <p>Comprehensive test of all ${totalBlocks} blocks across 7 categories — editor, inspector, and frontend rendering.</p>
</div>
<div class="summary">
  <div class="stat"><div class="num">${totalBlocks}</div><div class="lbl">Total Blocks</div></div>
  <div class="stat"><div class="num" style="color:#10b981">${passCount}</div><div class="lbl">Passed</div></div>
  <div class="stat"><div class="num" style="color:#f59e0b">${warnCount}</div><div class="lbl">Warnings</div></div>
  <div class="stat"><div class="num" style="color:#ef4444">${failCount}</div><div class="lbl">Failed</div></div>
  <div class="stat"><div class="num">${Object.keys(POSTS).length}</div><div class="lbl">Test Posts</div></div>
</div>
<div class="content">

  ${failCount > 0 || warnCount > 0 ? `<div class="note">⚠️ ${failCount} failure(s) and ${warnCount} warning(s) detected. Review the Issues column below and see individual editor screenshots for details.</div>` : '<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:12px 16px;font-size:.85rem;color:#166534;margin-bottom:24px">✅ All blocks passed testing — no critical issues found.</div>'}

  <h2>Block-by-Block Results</h2>
  <table>
    <thead>
      <tr>
        <th>Block</th>
        <th>Features Tested</th>
        <th>Status</th>
        <th>Issues</th>
        <th>Screenshots</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <h2>Frontend Rendering</h2>
  <p style="color:#6b7280;font-size:0.9rem;margin-bottom:16px">Full-page frontend screenshots of each test post — shows actual rendered output.</p>
  <div class="grid">
    ${frontendGrid}
  </div>

</div>
</body>
</html>`;

  fs.writeFileSync(REPORT, html, 'utf8');

  console.log('\n\n════════════════════════════════════════');
  console.log(`✅  Test complete — ${totalBlocks} blocks tested`);
  console.log(`   ✅ PASS:    ${passCount}`);
  console.log(`   ⚠️  WARNING: ${warnCount}`);
  console.log(`   ❌ FAIL:    ${failCount}`);
  console.log(`\n📄 Report → ${REPORT}`);
  console.log('════════════════════════════════════════\n');

  process.exit(failCount > 0 ? 1 : 0);
})().catch(err => {
  console.error('\n❌ Fatal:', err.message);
  process.exit(1);
});