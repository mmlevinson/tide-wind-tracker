# Wind Tide Tracker

A Progressive Web App for recreational boaters, kayakers, paddle boarders, and beachcombers who need tide and wind conditions at their GPS location.

## Features

- **GPS location** — finds tide and wind data near you
- **Time slider** — scrub through the day to preview changing conditions
- **Tide chart** — positive tides in black, negative tides in red
- **Wind report** — speed and direction with configurable high-wind highlighting
- **Settings** — feet/meters, 12h/24h clock, wind units and thresholds (persisted locally as MongoDB-compatible JSON)
- **PWA** — install on phone or tablet for app-like access

## Project Structure

```text
/
├── public/
│   ├── manifest.webmanifest   # PWA manifest
│   ├── sw.js                  # Service worker
│   └── icons/                 # App icons
├── src/
│   ├── components/            # Themed UI components (splash, menubar, mobile menu)
│   ├── data/                  # Shared navigation config
│   ├── layouts/               # SiteLayout with shared chrome
│   ├── lib/                   # Themed* JS classes (settings, tide display, etc.)
│   ├── pages/                 # Routable Astro views
│   ├── scripts/               # Client-side init scripts
│   └── styles/
│       ├── global.css         # Pure.css import + overrides hook
│       └── biycoder-theme-overrides.css
└── package.json
```

## Pages

| Route | Page |
|-------|------|
| `/` | Home |
| `/tides-display` | Main tide & wind display |
| `/settings` | User preferences |
| `/about` | About the app |
| `/help` | Usage guide |
| `/faq` | Frequently asked questions |

## Commands

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `http://127.0.0.1:6658` |
| `npm run build` | Production build to `./dist/` |
| `npm run preview` | Preview production build |

## Styling

Uses **Pure.css** via `src/styles/global.css`. All theme customization goes in `src/styles/biycoder-theme-overrides.css` — never edit `node_modules/`.

Icons use **Google Material Symbols** loaded from Google Fonts.

## Data Storage

Local settings are stored as JSON documents with `_id` fields for seamless migration to MongoDB when remote sync is implemented. See `src/lib/ThemedJsonStore.js` and `src/lib/ThemedAppSettings.js`.
