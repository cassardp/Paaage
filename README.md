# Paaage

**Your browser's new home.**

A minimalist, drag-and-drop homepage builder. Turn your new tab into a personalized command center.

[**Try it live**](https://paaage.vercel.app)

## Features

- **Drag & drop grid** — Place blocks anywhere on a free-form grid
- **12 block types** — Search, Notes, Bookmarks, Weather, Stocks, RSS, Todo, Clock, Radio, Links, Text, Settings
- **Multiple desktops** — Organize your blocks across separate pages
- **Cloud sync** — Sync your config across devices via a simple URL
- **Keyboard shortcuts** — `/` to insert, `Shift+L` to lock, `Shift+U` to undo
- **Dark/Light mode** — Automatic theme support
- **Import/Export** — Save and restore your config as JSON
- **No account required** — Everything stored locally, sync is optional

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 7** — Dev server and build
- **Tailwind CSS 4** — Styling
- **Val.town** — Serverless cloud sync
- **Lucide React** — Icons

## Getting Started

```bash
npm install
cp .env.example .env    # Configure your sync API URL
npm run dev             # Start dev server
```

## Commands

```bash
npm run dev       # Start dev server with HMR
npm run build     # TypeScript check + production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Insert block |
| `Shift + L` | Lock/unlock layout |
| `Shift + M` | Mask mode |
| `Shift + U` | Undo |
| `Shift + G` | Toggle grid lines |
| `Shift + T` | Toggle desktop titles |
| `Arrow keys` | Navigate desktops |

## Contributing

This is a personal project. The code is open-source for transparency and learning purposes, but I'm not accepting contributions at this time.

## License

[MIT](LICENSE)
