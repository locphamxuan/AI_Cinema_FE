# syntax=docker/dockerfile:1

# AI Cinema — web back office (Next.js App Router) production image.
#
# Only the runtime build is containerised: tests, lint and typecheck stay in CI (.github/workflows/ci.yml).
#
# `next build` bakes values in, so they are --build-arg, not runtime env:
#   - BACKEND_URL feeds rewrites() in next.config.ts (the /api proxy destination);
#   - NEXT_PUBLIC_* are inlined into the browser bundle.
# Runtime env only carries PORT / HOSTNAME / NODE_ENV.
#
#   docker build --build-arg BACKEND_URL=http://host.docker.internal:3001 -t ai-cinema-web .
#   docker run --rm -p 3000:3000 ai-cinema-web
#
# Or `docker compose up -d --build` (see docker-compose.yml).

FROM node:24-bookworm-slim AS base
WORKDIR /app
# No telemetry when building or serving. next/font/google downloads the fonts during the build,
# so the builder stage needs network access (they are inlined into the CSS, not fetched at runtime).
ENV NEXT_TELEMETRY_DISABLED=1

# 1. Dependencies, including devDependencies: Tailwind, PostCSS and TypeScript only build the app.
FROM base AS deps
ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# 2. Production build. Standalone output (NEXT_OUTPUT) keeps only the traced files and server.js.
FROM base AS builder
ENV NODE_ENV=production \
    NEXT_OUTPUT=standalone

# Defaults mirror .env.example; override them for the environment being built.
ARG BACKEND_URL=http://localhost:3001
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=
ARG NEXT_PUBLIC_STUDIO_WEB_URL=http://localhost:3100/login
ENV BACKEND_URL=$BACKEND_URL \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    NEXT_PUBLIC_STUDIO_WEB_URL=$NEXT_PUBLIC_STUDIO_WEB_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Runtime: the standalone bundle only — no npm, no devDependencies, no source tree.
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# server.js serves .next/static itself; .next/cache is written by image optimisation.
# This app ships no public/ assets, so there is nothing to copy from there.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
RUN mkdir -p .next/cache && chown node:node .next/cache

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/login').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
