# Simple Pixel

A pixel art editor for classrooms — one shared codebase, two platforms.

```
simplepixel/
├── shared/
│   └── editor.html       ← THE ONLY FILE YOU EDIT
├── build.js              ← assembles platform outputs
├── electron/
│   ├── main.js           ← Electron window / menus / IPC
│   ├── preload.js        ← Electron API bridge
│   ├── package.json      ← Electron + electron-builder config
│   ├── build/icons/      ← App icon
│   └── src/index.html    ← GENERATED — do not edit
└── pwa/
    ├── manifest.json     ← PWA identity
    ├── sw.js             ← Service worker (offline)
    ├── icons/            ← PWA icons
    └── index.html        ← GENERATED — do not edit
```

## Workflow

**Edit** `shared/editor.html` — this is the single source of truth for all
UI, CSS, and editor logic.

**Build both platforms:**
```bash
node build.js
```

**Build one platform:**
```bash
node build.js electron
node build.js pwa
```

## Running Electron

```bash
cd electron
npm install       # first time only
npm start
```

Or from the root:
```bash
npm start         # builds + launches Electron
```

## Distributing

```bash
cd electron
npm run dist:mac    # → dist/Simple Pixel.dmg
npm run dist:win    # → dist/Simple Pixel Setup.exe
npm run dist:linux  # → dist/Simple Pixel.AppImage
```

## Deploying PWA (iPad)

Push the `pwa/` folder to GitHub Pages. See `pwa/README.md`.

## Updating the app

1. Edit `shared/editor.html`
2. Run `node build.js`
3. Test with `npm start`
4. For PWA: push `pwa/` to GitHub, bump `CACHE_VERSION` in `pwa/sw.js`
