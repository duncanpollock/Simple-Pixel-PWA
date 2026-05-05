#!/usr/bin/env node
/**
 * build.js — assembles platform-specific index.html files from shared/editor.html
 *
 * Usage:
 *   node build.js          — builds both platforms
 *   node build.js electron — builds Electron only
 *   node build.js pwa      — builds PWA only
 */

const fs   = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'shared', 'editor.html');

if (!fs.existsSync(SRC)) {
  console.error('shared/editor.html not found');
  process.exit(1);
}

const template = fs.readFileSync(SRC, 'utf8');

// ─── Platform definitions ─────────────────────────────────────────────────────

const PLATFORMS = {

  electron: {
    out: path.join(__dirname, 'electron', 'src', 'index.html'),
    head: `
  <meta name="viewport" content="width=device-width, initial-scale=1.0">`,
    scripts: ``,  // Electron injects its API via preload.js — nothing needed here
  },

  pwa: {
    out: path.join(__dirname, 'pwa', 'index.html'),
    head: `
  <!-- PWA / iOS meta -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="Simple Pixel">
  <meta name="theme-color" content="#111116">
  <link rel="manifest" href="manifest.json">
  <link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">`,
    scripts: `
<script>
  // Register service worker for offline support
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js')
        .then(function (reg) { console.log('SW registered:', reg.scope); })
        .catch(function (err) { console.warn('SW failed:', err); });
    });
  }
</script>`,
  },
};

// ─── Build ────────────────────────────────────────────────────────────────────

const target = process.argv[2]; // 'electron' | 'pwa' | undefined (both)
const toBuild = target ? [target] : Object.keys(PLATFORMS);

for (const name of toBuild) {
  const platform = PLATFORMS[name];
  if (!platform) {
    console.error(`Unknown platform: ${name}. Use 'electron' or 'pwa'.`);
    process.exit(1);
  }

  let html = template
    .replace('<!-- @@PLATFORM_HEAD@@ -->',    platform.head)
    .replace('<!-- @@PLATFORM_SCRIPTS@@ -->', platform.scripts);

  fs.mkdirSync(path.dirname(platform.out), { recursive: true });
  fs.writeFileSync(platform.out, html);
  console.log(`✅  ${name.padEnd(10)} → ${platform.out}`);
}

console.log('\nDone. Edit shared/editor.html and re-run node build.js to update both.');
