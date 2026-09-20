# Standalone BYO collab relay (Phase 8 Stage 7) — self-hosted, not run by
# DUDE. Build: `docker build -f relay/Dockerfile -t dude-collab-relay .`
# (from the repo root, so the build context includes collab-relay/).
# Run:   `docker run -p 8080:8080 dude-collab-relay`
# Ships ws:// (unencrypted) — put a TLS-terminating reverse proxy in front
# if exposing this beyond your own LAN.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY relay ./relay
COPY collab-relay ./collab-relay
RUN npx esbuild relay/index.ts --bundle --platform=node --format=cjs --outfile=dist/relay.js

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist/relay.js ./relay.js
ENV PORT=8080
EXPOSE 8080
CMD ["node", "relay.js"]
