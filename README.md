# CV

Personal CV website built with React, TypeScript, and Vite. The editable source of truth is [`data/cv.json`](data/cv.json). `src/data/cv.ts` is generated from that file and should not be edited by hand.

## Customize

Edit [`data/cv.json`](data/cv.json), then regenerate and run:

```bash
npm run generate-cv
npm run dev
```

The admin editor at `/admin` writes the same JSON file.

## Run locally

```bash
npm install
npm run dev
```

To run the Express server (public site + admin) locally:

```bash
npm run build
npm start
```

In development, if `ADMIN_PASSWORD` is unset the login password is `cv-admin`. If `SESSION_SECRET` is unset, the server creates an ephemeral secret (sessions reset on restart). These defaults are **not** allowed in production.

## Build

```bash
npm run build
```

Output is written to `dist/`.

## Deploy

The repository includes a `Dockerfile` for Coolify (or any Docker host). The image builds the static site and runs the Express backend, which serves the CV at `/` and the admin editor at `/admin`. The container listens on **port 3000**.

In Coolify:

1. Create a new resource from this GitHub repository.
2. Choose **Dockerfile** as the build method.
3. Set the exposed / mapped port to **3000** (not 80).
4. Add environment variables:
   - `ADMIN_PASSWORD` — a strong password (required; the server will not start without it).
   - `SESSION_SECRET` — a long random string used to sign admin session cookies (required).
5. Add a persistent volume mounted at `/app/data` so CV edits survive restarts and redeploys. An empty volume is seeded from the image on first boot; after that, admin Save updates this directory and rebuilds the live site into `dist/`.
6. Optional: set the health check path to **`/health`** (returns `{ "ok": true }`).
7. Point your domain to the resource.
8. Visit `https://your-domain.com/admin` and log in with `ADMIN_PASSWORD`.
