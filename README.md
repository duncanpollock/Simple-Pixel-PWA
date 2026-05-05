# Simple Pixel – PWA

A Progressive Web App version of Simple Pixel that installs directly from Safari
on iPad (and any browser on any device) with no App Store required.

## Deploying to GitHub Pages (free hosting)

1. Create a new **public** repository on GitHub — e.g. `simple-pixel`
2. Push this folder's contents to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Simple Pixel PWA"
   git remote add origin https://github.com/YOUR_USERNAME/simple-pixel.git
   git push -u origin main
   ```
3. Go to **Settings → Pages** in your repository
4. Under *Source*, select `main` branch and `/ (root)` folder → Save
5. GitHub will give you a URL like `https://your-username.github.io/simple-pixel/`

That's it. The app is now live and installable.

## Installing on iPad

1. Open the URL in **Safari** (must be Safari for iOS/iPadOS install)
2. Tap the **Share** button (box with arrow)
3. Tap **Add to Home Screen**
4. Tap **Add**

The app will appear on the home screen, launch fullscreen in landscape,
and work completely **offline** after the first visit.

## Updating the app

After making changes, push to GitHub. Students will get the update
automatically next time they open the app while connected to the internet.
To force an update, increment `CACHE_VERSION` in `sw.js`:
```js
const CACHE_VERSION = 'simplepixel-v2';  // bump this
```

## File structure

```
simplepixel-pwa/
├── index.html      ← entire app (HTML + CSS + JS)
├── manifest.json   ← PWA identity, icons, display mode
├── sw.js           ← service worker (offline caching)
└── icons/          ← app icons for all device sizes
    ├── apple-touch-icon.png   (180×180, iOS home screen)
    ├── icon-192.png           (Android / PWA standard)
    ├── icon-512.png           (splash screen / store listing)
    └── ...
```
