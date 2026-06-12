# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Association Jeunes Actifs — a website for a French youth association. Content and UI are in French.

## Tech Stack

- **Next.js 16** with App Router (React 19, TypeScript 5)
- **Tailwind CSS v4** (experimental, via PostCSS plugin) — uses `@import "tailwindcss"` and `@theme inline` in `globals.css`
- **Geist** font family loaded through `next/font/google`
- No database, API routes, or auth yet

## Commands

```bash
npm run dev     # Start dev server (localhost:3000)
npm run build   # Production build
npm start       # Start production server
npm run lint    # ESLint (core-web-vitals + typescript)
```

## Architecture

Standard Next.js App Router layout:

- `app/layout.tsx` — root layout, loads fonts and sets metadata
- `app/page.tsx` — home page
- `app/globals.css` — Tailwind v4 config with CSS variable theming and dark mode support

Path alias: `@/*` maps to project root.

## Important Notes

- This is **Next.js 16**, which has breaking changes from earlier versions. Before using any Next.js API, check `node_modules/next/dist/docs/` for current documentation. Do not rely on training data for API signatures.
- Tailwind v4 uses `@theme inline` blocks and CSS variables instead of `tailwind.config.*`. Theme customization lives in `globals.css`.
- The `<html>` lang is currently `"en"` but should be `"fr"` for this French-language site.
