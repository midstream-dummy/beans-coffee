# Beans Coffee — a tiny demo shop

A three-page Node app (no build step) with two Playwright tests, used to walk
Midstream's new-user setup end to end.

- `server.js` — the whole app: shop front, add-to-cart, cart page
- `tests/cart.spec.ts` — two tests, each marking a scene with `midstreamScene()`
- `midstream.json` — how Midstream installs, starts and re-runs a test

## Run it

```bash
npm ci
npm start           # http://localhost:3000
npx playwright test
```
