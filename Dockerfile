# Build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage — keeps the frontend toolchain so admin Save can rebuild dist/
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/package.json ./
COPY --from=build /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/data ./data
COPY --from=build /app/data ./data-seed
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/server ./server
COPY --from=build /app/src ./src
COPY --from=build /app/public ./public
COPY --from=build /app/index.html ./index.html
COPY --from=build /app/vite.config.ts ./vite.config.ts
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/tsconfig.app.json ./tsconfig.app.json
COPY --from=build /app/tsconfig.node.json ./tsconfig.node.json

# Persist CV JSON across restarts: in Coolify, mount a volume at /app/data
EXPOSE 3000

CMD ["node", "server/index.js"]
