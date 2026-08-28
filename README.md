# JOMS Frontend

Admin dashboard for the JOMS platform (React + TypeScript + Vite).

## Setup

```bash
npm install
cp .env.example .env   # if present; otherwise create .env with VITE_* API URLs
npm run dev
```

## Scripts

| Command                                | Description                    |
| -------------------------------------- | ------------------------------ |
| `npm run dev`                          | Vite dev server                |
| `npm run build`                        | Typecheck + production build   |
| `npm run typecheck`                    | `tsc -b` only                  |
| `npm run test`                         | Vitest                         |
| `npm run env:local` / `env:production` | Switch API base URLs in `.env` |

## Env

Set service base URLs (`VITE_AUTH_API_BASE_URL`, etc.) and optional keys such as `VITE_GOOGLE_MAPS_API_KEY` in `.env`. Do not commit secrets.
