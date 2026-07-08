# 🌌 Nyxi Chrome Extension

Nyxi is a premium, minimalist, and high-performance Chrome extension that transforms your browser's default "New Tab" page into a sleek, glassmorphic workspace dashboard. It focuses on visual excellence, rapid startup times, and customizability.

![Nyxi Logo](public/favicon.jpg)

---

## ✨ Features

- **📺 Premium Dynamic Wallpapers**: Includes Serene Lake, Cyber Rain, and Luxury Waves. Custom uploaded image and video loops are stored as raw binary data in IndexedDB for maximum speed and zero memory bloat.
- **📂 IndexedDB Binary File Storage**: Allows custom wallpaper uploads **up to 500MB** (supporting 1080p looping videos) with instant, zero-overhead loading.
- **🧭 Left Sidebar Pill Dock**: A floating vertical nav-dock housing your user profile, search toggle, grid shortcuts, dashboard settings, and quick help guide.
- **⏰ Floating Glass Date & Time Box**: An elegant clock card that floats in the top-right corner and tints to match your active accent theme.
- **⚡ Mutually Exclusive Panels**: Sidebar buttons synchronize automatically. Opening the Settings drawer automatically fades out search/links widget to prevent overlapping on narrow screens.
- **🔗 Grid Quick Links & Bookmarks**: Access your custom shortcuts and native Google Chrome bookmarks bar in a clean, non-overlapping grid layout.
- **🎨 Interactive Customizer (Settings)**: Fine-tune theme variables like:
  - Wallpaper catalogs (Default presets and custom uploads)
  - Accent Color Gradients (dynamic shifting)
  - Glassmorphic UI Opacity, Backdrop Blur, and Brightness filters
  - 12h/24h clock toggle
  - Particle trails / Interactive ripples (disabled by default)

---

## 🛠️ Tech Stack

1. **Frontend Core**: React 18 with TypeScript.
2. **Bundler**: Vite 8 with HMR (Hot Module Replacement) and Oxlint compiler rules.
3. **Styling**: Modular Vanilla CSS (`src/index.css`) for high performance, exact design specs, and smooth micro-animations.
4. **Icons**: Lucide React.
5. **Storage**: Chrome Local Storage (for metadata) and IndexedDB (for large wallpaper blobs).

---

## 📂 Project Structure

```text
├── public/                     # Static assets
│   ├── favicon.jpg             # Compass Star "N" Favicon (JPG)
│   ├── default_wallpapers/     # Built-in background loops
│   └── icons/                  # Chrome extension app launch icons
├── src/
│   ├── components/             # React UI Components
│   │   ├── settings/           # Settings sub-components (Wallpaper tabs, data reset)
│   │   ├── ui/                 # UI atoms (custom buttons, WebGL metal button)
│   │   ├── ClockWidget.tsx     # Top-right clock layout
│   │   ├── CursorTrail.tsx     # Dynamic mouse canvas effects
│   │   ├── LinksWidget.tsx     # Bookmarks and quick links grids
│   │   ├── SearchWidget.tsx    # Left-panel search bar
│   │   └── WallpaperRenderer.tsx # Renders background layers (images, loops, canvas)
│   ├── context/                # Global React context providers
│   │   ├── SettingsContext.tsx # Style preferences & sync
│   │   └── WallpaperContext.tsx# Wallpaper engine, IndexedDB bindings, and dynamic urls
│   ├── utils/
│   │   ├── storage.ts          # Chrome storage wrapper
│   │   └── wallpaperDB.ts      # IndexedDB binary file manager (Up to 500MB)
│   ├── App.tsx                 # Main layout structure and dock handlers
│   ├── index.css               # Global glassmorphism theme stylesheet
│   └── main.tsx                # Mount point
├── manifest.json               # Chrome Extension configuration
├── vite.config.ts              # Vite configuration
└── package.json                # Project dependencies
```

---

## 🚀 Getting Started

### 1. Local Preview & Development
To preview the dashboard locally in your browser:
```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 2. Loading as a Chrome Extension
To package and load the dashboard directly into Google Chrome:
```bash
# Compile and build the production bundle
npm run build
```
This compiles the application and generates the output files in the `dist` directory.

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (toggle switch in the top-right corner).
3. Click **Load unpacked** (button in the top-left corner).
4. Select the **`dist`** folder located inside your `Nyxi Chrome Extension` project directory.
5. Open a new tab to see your premium Nyxi dashboard live!

---

## 📝 Performance Notes
* Built with zero heavy UI libraries to keep CPU overhead at `<1%`.
* Wallpaper videos use `playsInline` and `muted` loops, optimized for 60fps render loops.
* Unused canvas mouse animations are tree-shaken and disabled by default.
