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

The repository includes a `Dockerfile` for Coolify (or any Docker host). The image builds the static site and serves it with nginx.

In Coolify:

1. Create a new resource from this GitHub repository.
2. Choose **Dockerfile** as the build method.
3. Expose port `80`.
4. Point your domain to the resource.
