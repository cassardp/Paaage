# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Paaage is a minimalist, drag-and-drop homepage builder that turns your browser's new tab into a personalized command center. Users can place widget blocks (notes, bookmarks, weather, stocks, RSS, todo, clock, etc.) on a free-form grid across multiple desktops.

Deployed at https://paaage.vercel.app

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # TypeScript check + Vite production build
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

## Architecture

**React 19 + TypeScript + Vite + Tailwind CSS 4**. No external UI library, minimal runtime dependencies.

### File Structure

- `src/App.tsx` — Root component, state orchestration, keyboard shortcuts, cross-desktop drag handling
- `src/components/` — All UI components (29 files)
  - `DraggableGrid.tsx` — Main grid engine (pointer events, drag/resize, selection rectangle, long-press)
  - `BlockContent.tsx` — Block type router
  - `BlockWrapper.tsx` — Visual block wrapper (shadows, borders)
  - Block types: `SearchBlock`, `WeatherBlock`, `NoteBlock`, `StationBlock`, `StockBlock`, `TodoBlock`, `ClockBlock`, `RssBlock`, `LinksBlock`, `BookmarkBlock`, `SettingsBlock`, `TextBlock`
  - `Toolbar.tsx` — Top toolbar
  - `SlashMenu.tsx` — "/" command menu for quick block insertion
  - `DesktopCarousel.tsx` / `DesktopNavigator.tsx` — Multi-desktop navigation
- `src/hooks/` — Custom hooks
  - `useConfig.ts` — Main config CRUD, undo history (20 items), desktop management
  - `useCloudStorage.ts` — Val.town API sync with 300ms debounce
  - `useKeyboardShortcuts.ts` — Shift+L (lock), Shift+M (mask), Shift+U (undo), etc.
  - `useDataCache.ts` — Generic data fetching with TTL cache
- `src/contexts/` — React contexts for cross-desktop drag and multi-selection
- `src/types/config.ts` — TypeScript interfaces for Config, Block (12 variants), Desktop, Settings
- `src/lib/` — Utilities (default config, JSON import/export, ID generation)

### Key Patterns

- **Block System**: Discriminated union type (`Block`) with 12 variants. Each block has `id`, `layout` (x, y, w, h on 16px grid), and type-specific fields.
- **Grid**: Custom grid engine (no library) with 16px cell size. Drag, resize, and lasso selection via pointer events.
- **State**: Config object managed by `useConfig` hook. Cloud sync via Val.town serverless API. Undo support.
- **Multi-Desktop**: Multiple desktops with independent block layouts, navigable via carousel.
- **Persistence**: Cloud sync via `VITE_SYNC_API_URL` (Val.town). Sync ID stored in localStorage. Config export/import as JSON.

### Environment Variables

Copy `.env.example` to `.env` and set:
- `VITE_SYNC_API_URL` — Val.town API endpoint for cloud sync

## Conventions

- TypeScript strict mode enabled
- Tailwind CSS for all styling (no CSS modules)
- Comments and some UI text in French
- Communicate with the developer in French
- Lucide React for icons
- Desktop-only UI (no mobile layout)
