# FinTrack — Web UI

This folder contains a minimal web frontend for FinTrack (Vite + React + TypeScript). It is intended as a lightweight browser preview of the app and as a starting point for a web client.

## Quick Start

Prerequisites: Node.js 18+ and npm (or yarn).

```bash
cd web
npm install
npm run dev
# open http://localhost:5173
```

## Scripts

- `npm run dev` — start dev server (hot reload)
- `npm run build` — build production bundle (dist/)
- `npm run preview` — locally preview production build

## Project Structure

- `index.html` — app shell
- `src/main.tsx` — React entry
- `src/App.tsx` — main UI + navigation
- `src/components` — UI components (e.g., `TransactionCard`)
- `src/pages` — static pages (Privacy, Terms)
- `src/styles.css` — basic styling

## Replace sample data

By default the app uses sample transactions in `src/App.tsx`. To connect real data:

1. Replace the `sample` array with API data or wire a fetch to your backend.
2. Implement a small adapter that converts parsed transactions into the `Transaction` type used by the UI.

## Building for production

```bash
cd web
npm run build
npm run preview
```

The production files appear in `web/dist` after `npm run build`.

## Notes

- The privacy policy and terms pages are included in `src/pages` and use content from the repository markdown files.
- This web UI is intentionally small — if you want routing, authentication, or a backend API, I can add those.

## Contact

For questions or to connect this web UI to the mobile parsing logic, contact: [Your Contact Email]
