/**
 * generate-assets.mjs
 *
 * Generates WP.org plugin assets using Playwright (already installed):
 *   assets/icon-128x128.png
 *   assets/icon-256x256.png
 *   assets/banner-772x250.png
 *   assets/banner-1544x500.png
 *
 * Usage: node bin/generate-assets.mjs
 */

import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname( fileURLToPath( import.meta.url ) );
const ROOT = resolve( __dirname, '..' );

const svgIcon = readFileSync( resolve( ROOT, 'assets/icon.svg' ), 'utf8' );

// ── Icon HTML ─────────────────────────────────────────────────────────────────

function iconHtml( size ) {
	return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${size}px; height: ${size}px; overflow: hidden; background: #0f172a; }
  svg { width: ${size}px; height: ${size}px; display: block; }
</style>
</head>
<body>${ svgIcon.replace( /width="128" height="128"/, `width="${size}" height="${size}"` ) }</body>
</html>`;
}

// ── Banner HTML ───────────────────────────────────────────────────────────────

function bannerHtml( w, h ) {
	const scale = w / 772;
	const logoSize = Math.round( 56 * scale );
	const titleSize = Math.round( 42 * scale );
	const taglineSize = Math.round( 17 * scale );
	const badgeSize = Math.round( 12 * scale );
	const pad = Math.round( 64 * scale );
	const iconSvg = svgIcon
		.replace( /width="128" height="128"/, `width="${logoSize}" height="${logoSize}"` )
		.replace( /viewBox="0 0 128 128"/, `viewBox="0 0 128 128"` );

	return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${w}px; height: ${h}px; overflow: hidden;
    background: #0f172a;
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  .banner {
    position: relative;
    width: ${w}px; height: ${h}px;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%);
    display: flex;
    align-items: center;
    padding: 0 ${pad}px;
    overflow: hidden;
  }
  /* Decorative grid dots */
  .banner::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(99,102,241,0.15) 1px, transparent 1px);
    background-size: ${Math.round(32*scale)}px ${Math.round(32*scale)}px;
    opacity: 0.6;
  }
  /* Right glow blob */
  .banner::after {
    content: '';
    position: absolute;
    right: ${Math.round(-60*scale)}px;
    top: 50%;
    transform: translateY(-50%);
    width: ${Math.round(500*scale)}px;
    height: ${Math.round(500*scale)}px;
    background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 65%);
    border-radius: 50%;
  }
  .content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: ${Math.round(32*scale)}px;
    width: 100%;
  }
  .logo-wrap { flex-shrink: 0; }
  .logo-wrap svg {
    width: ${logoSize}px; height: ${logoSize}px; display: block;
    filter: drop-shadow(0 0 ${Math.round(20*scale)}px rgba(99,102,241,0.6));
  }
  .text { flex: 1; }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: ${Math.round(5*scale)}px;
    background: rgba(99,102,241,0.2);
    border: 1px solid rgba(99,102,241,0.4);
    border-radius: ${Math.round(100*scale)}px;
    padding: ${Math.round(4*scale)}px ${Math.round(12*scale)}px;
    font-size: ${badgeSize}px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a5b4fc;
    margin-bottom: ${Math.round(14*scale)}px;
  }
  .badge-dot {
    width: ${Math.round(6*scale)}px; height: ${Math.round(6*scale)}px;
    border-radius: 50%; background: #6366f1;
  }
  h1 {
    font-size: ${titleSize}px;
    font-weight: 800;
    color: #fff;
    line-height: 1.1;
    letter-spacing: -0.03em;
    margin-bottom: ${Math.round(12*scale)}px;
  }
  h1 span { color: #818cf8; }
  p {
    font-size: ${taglineSize}px;
    color: rgba(255,255,255,0.6);
    line-height: 1.5;
    max-width: ${Math.round(460*scale)}px;
  }
  .features {
    display: flex;
    gap: ${Math.round(20*scale)}px;
    margin-top: ${Math.round(20*scale)}px;
  }
  .feature {
    display: flex;
    align-items: center;
    gap: ${Math.round(6*scale)}px;
    font-size: ${Math.round(13*scale)}px;
    color: rgba(255,255,255,0.5);
    font-weight: 500;
  }
  .feature-dot {
    width: ${Math.round(5*scale)}px; height: ${Math.round(5*scale)}px;
    border-radius: 50%; background: #6366f1; flex-shrink: 0;
  }
  /* Decorative right side blocks visual */
  .blocks-visual {
    position: absolute;
    right: ${pad}px;
    top: 50%;
    transform: translateY(-50%);
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${Math.round(8*scale)}px;
    opacity: 0.55;
  }
  .block-card {
    width: ${Math.round(80*scale)}px; height: ${Math.round(56*scale)}px;
    border-radius: ${Math.round(8*scale)}px;
    border: 1px solid rgba(99,102,241,0.3);
    background: rgba(99,102,241,0.08);
    backdrop-filter: blur(4px);
  }
  .block-card:nth-child(1) { background: rgba(99,102,241,0.18); }
  .block-card:nth-child(3) { background: rgba(139,92,246,0.12); }
</style>
</head>
<body>
<div class="banner">
  <div class="content">
    <div class="logo-wrap">${iconSvg}</div>
    <div class="text">
      <div class="badge"><div class="badge-dot"></div>WordPress Block Plugin</div>
      <h1>Go<span>Blocks</span></h1>
      <p>A world-class block library with responsive controls, dynamic content, and a premium design system.</p>
      <div class="features">
        <div class="feature"><div class="feature-dot"></div>18 Blocks</div>
        <div class="feature"><div class="feature-dot"></div>6 Breakpoints</div>
        <div class="feature"><div class="feature-dot"></div>15 Patterns</div>
        <div class="feature"><div class="feature-dot"></div>Zero JS overhead</div>
      </div>
    </div>
  </div>
  <div class="blocks-visual">
    <div class="block-card"></div>
    <div class="block-card"></div>
    <div class="block-card"></div>
    <div class="block-card"></div>
  </div>
</div>
</body>
</html>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

( async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage();

	const tasks = [
		{ name: 'icon-128x128.png',   w: 128,  h: 128,  html: iconHtml( 128 ) },
		{ name: 'icon-256x256.png',   w: 256,  h: 256,  html: iconHtml( 256 ) },
		{ name: 'banner-772x250.png', w: 772,  h: 250,  html: bannerHtml( 772, 250 ) },
		{ name: 'banner-1544x500.png',w: 1544, h: 500,  html: bannerHtml( 1544, 500 ) },
	];

	for ( const task of tasks ) {
		await page.setViewportSize( { width: task.w, height: task.h } );
		await page.setContent( task.html, { waitUntil: 'domcontentloaded' } );
		const outPath = resolve( ROOT, 'assets', task.name );
		await page.screenshot( {
			path: outPath,
			clip: { x: 0, y: 0, width: task.w, height: task.h },
			type: 'png',
		} );
		console.log( `✓ ${task.name}  (${task.w}×${task.h})` );
	}

	await browser.close();
	console.log( '\nAll assets generated in assets/' );
} )();
