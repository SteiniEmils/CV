# CV

Personal CV website built with React, TypeScript, and Vite.

## Customize

Edit your details in [`src/data/cv.ts`](src/data/cv.ts).

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output is written to `dist/`.

## Deploy

The repository includes a `Dockerfile` for Coolify (or any Docker host). The image builds the static site and runs the Express backend, which serves the CV at `/` and the admin editor at `/admin`.

In Coolify:

1. Create a new resource from this GitHub repository.
2. Choose **Dockerfile** as the build method.
3. Keep the default exposed port (`80`).
4. Add an environment variable `ADMIN_PASSWORD` and set it to a strong password.
5. Point your domain to the resource.
6. Visit `https://your-domain.com/admin` and log in with the `ADMIN_PASSWORD`.
