# Frontend Setup

## Environment Variables

Create `frontend/.env` from `frontend/.env.example`.

- Local development:
	- `VITE_API_URL=http://127.0.0.1:8000`
- Production (Vercel):
	- `VITE_API_URL=https://scopio.in`

The client already normalizes backend URLs to avoid mixed-content issues and uses Axios with `withCredentials: true` for cookie-based flows.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
