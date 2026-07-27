# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Paaage is a minimalist drag-and-drop homepage builder: widget blocks (notes, bookmarks, weather, stocks, RSS, todo, clock...) placed on a free-form grid across multiple desktops. Deployed at https://paaage.app.

## Commands

```bash
npm run dev       # Vite dev server with HMR
npm run build     # TypeScript check + production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

Requires `.env` (copy `.env.example`) with `VITE_SYNC_API_URL`, the Val.town endpoint for cloud sync.

## Architecture

React 19 + TypeScript + Vite + Tailwind CSS 4. No UI library, minimal runtime dependencies (Lucide for icons).

- **Blocks**: a discriminated union type (`Block` in `src/types/config.ts`), one component per variant routed through `BlockContent.tsx`. Each block has an `id` and a `layout` (x, y, w, h) on a 16px grid (`CELL_SIZE` in `src/lib/defaultConfig.ts`).
- **Grid**: custom engine, no library (`DraggableGrid.tsx`). Drag, resize and lasso selection via pointer events.
- **State**: one `Config` object owned by the `useConfig` hook (CRUD, undo history, desktop management). Multiple desktops with independent layouts.
- **Sync**: `useCloudStorage` pushes the config to the Val.town API; the sync ID lives in localStorage. Config export/import as JSON.

## Conventions

- TypeScript strict mode, Tailwind for all styling
- Comments and some UI text in French; communicate with the developer in French
- Desktop-only UI (no mobile layout)
