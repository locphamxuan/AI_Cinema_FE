# AI Cinema — Frontend

Next.js back office of AI Cinema for Admin, Reviewer, Creator and Staff accounts. Viewers (Member/Guest) use the
mobile app; the studio works on Studio Web.

## Getting started

Requires Node.js 20.19+ and the backend (`AI-_Cinema_BE`) running on port 3001 — the quickest
way is `docker compose up -d --build` in the backend repo (see its README).

```bash
npm ci
cp .env.example .env.local   # /api is proxied to BACKEND_URL (default http://localhost:3001)
npm run dev                  # http://localhost:3000
```

Sign in as an Admin, Reviewer, Creator or Staff account to reach `/admin`, `/reviewer`, `/creator` or `/staff`.

## Docker

`Dockerfile` builds the app with `output: "standalone"` and serves it with `node server.js` — no npm,
no devDependencies. `docker-compose.yml` runs that image and points it at the backend on the host
(`host.docker.internal:3001`, plus `host-gateway` so Linux works too).

```bash
docker compose up -d --build   # http://localhost:3000
docker compose down
```

Start `AI_Cinema_BE` first (`docker compose up -d --build` there publishes port 3001). Without the
backend the pages load, but `/api/*` answers 500. To use the backend's Docker network instead, set
`DOCKER_BACKEND_URL=http://api:3001` and attach the service to `ai-cinema_default`.

`BACKEND_URL` (the `/api` rewrite in `next.config.ts`) and every `NEXT_PUBLIC_*` value are inlined by
`next build`, so they are build args, not runtime env: after changing them, rebuild the image — a
restart keeps the old values. Without compose:

```bash
docker build --build-arg BACKEND_URL=http://host.docker.internal:3001 -t ai-cinema-web .
docker run --rm -p 3000:3000 --add-host=host.docker.internal:host-gateway ai-cinema-web
```

## Tests

```bash
npm test          # unit and component tests (API mocked)
npm run test:cov  # the same with v8 coverage, as CI runs it
npm run lint      # includes max 300 lines per file
npx tsc --noEmit
npm run build
```

## Code layout

```
src/
  app/                 Next.js routes (pages only; logic lives below)
  components/          shared UI: auth guard, layout, ui (Button, Modal…), data, charts, shadcn primitives
  features/production/ MF-1 projects shared by the roles: list, project and episode pages, role sidebars, lib
                       (capabilities matching the backend's project rules, labels, routes)
  features/admin/      Admin screens and executive portal; features/reviewer/, staff/, studio/, billing-admin/,
                       notifications/, account/ for the other areas
  hooks/, lib/         shared hooks (useResource, useAction, useCan) and helpers (permissions, format…)
  services/            API clients (apiClient + one service per backend area)
  store/               app-wide Zustand stores
  types/, constants/   shared types and API route constants
  tests/               Vitest unit/component tests, fixtures and support harnesses
```
