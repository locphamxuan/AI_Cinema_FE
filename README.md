# AI Cinema — Frontend

Next.js workspace for viewers and for MF-1 (Creator and Reviewer production workflow).

## Getting started

Requires Node.js 20.19+ and the backend (`AI-_Cinema_BE`) running on port 3001.

```bash
npm ci
cp .env.example .env.local   # /api is proxied to BACKEND_URL (default http://localhost:3001)
npm run dev                  # http://localhost:3000
```

Sign in as a Creator to reach `/creator`, or as a Reviewer to reach `/reviewer`.

## Tests

```bash
npm test          # unit and component tests (API mocked)
npm run lint
npm run build
```

`src/tests/integration/mf1Workflow.live.test.ts` walks the whole MF-1 flow through the
workspace store against a running backend. It is skipped unless `MF1_LIVE_API` is set:

```bash
MF1_LIVE_API=http://localhost:3001/api npx vitest run src/tests/integration/mf1Workflow.live.test.ts
```

It signs in as `creator01@aicinema.com` / `reviewer01@aicinema.com` with `Aicinema@123`
(override with `MF1_LIVE_CREATOR`, `MF1_LIVE_REVIEWER`, `MF1_LIVE_PASSWORD`) and creates a
new project each run, so point it at a local or test database.
