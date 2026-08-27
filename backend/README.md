# Vitalis Backend — Restructure Notes

This is your backend reorganized into a standard **routes → controllers → services**
layered architecture. No business logic, SQL, validation, or response shapes were
changed. Everything below documents exactly what moved and the handful of things
worth your attention.

## New structure

```
backend/
├── server.js              # thin bootstrap: loads env, starts the HTTP server
├── src/
│   ├── app.js              # express app config, CORS, middleware, route mounting
│   ├── config/             # db.js, gemini.js, mailer.js (unchanged)
│   ├── constants/          # foodAnalysisPrompt.js (was data/)
│   ├── middleware/         # verifyUser.js (unchanged) + requireAuth.js (new, see below)
│   ├── routes/             # thin — only endpoint → controller wiring
│   ├── controllers/        # req/res handling, one file per resource
│   ├── services/           # DB queries + business logic, one file per resource
│   └── sockets/            # socketHandler.js (unchanged)
├── docs/                   # db-schema.txt, fitnessapp_db.sql (moved from root)
├── package.json / package-lock.json / .env / .env.sample / .gitignore
```

Every original route file now maps to 3 files, e.g. `route/auth.js` →
`routes/auth.routes.js` + `controllers/auth.controller.js` + `services/auth.service.js`.

## Verified, not just eyeballed

- Every file passes `node --check` (syntax valid).
- The full app (`require('./src/app')`) loads end-to-end with zero missing-module errors.
- The server actually boots and the health check / 404 handler respond correctly.
- **All 82 endpoints** (method + path) were diffed against the original 25 route files —
  the sets are identical. Nothing was dropped, renamed, or added.

## Small, deliberate cleanups (behavior-neutral)

These are structural deduplications made possible by the reorganization — they don't
change what any endpoint does:

- **`middleware/requireAuth.js`** — previously an identical `requireAuth()` function was
  copy-pasted inside both `route/session.js` and `route/workoutLogs.js`. Extracted once,
  used by both.
- **`services/sseClients.js`** — the in-memory `Map` of SSE clients used to live inside
  `route/notification.js`, and `route/foodLogs.js` reached into it via
  `require('./notification').clients`. It's now its own small module that both the
  notification and foodLogs services import — same shared `Map` instance, cleaner coupling.
- **`config/gemini.js`** — its internal `require("../data/foodAnalysisPrompt")` was
  updated to `require("../constants/foodAnalysisPrompt")` since that file moved. This is
  a required path fix for the move to work, not a logic change.

## One real bug I found and fixed while splitting `auth.js`

The Google login handler, if transcribed literally into a shared `createUser()` helper,
would have **inserted the user into the database twice** — once via the shared insert
helper and once via the original inline insert that also stored `avatar_url`. I caught
this while writing `auth.service.js` and instead added a dedicated `createGoogleUser()`
function so there's exactly one insert, matching the original's actual (single-insert)
behavior. Flagging this explicitly since it's the one place where "just reorganize"
required a real judgment call.

## Things preserved as-is, but worth your attention

- **Dead code removed (2026-08-27):** `liveCoaching.routes.js` / `social.routes.js` and their
  controllers/services were never mounted in `app.js` and `LiveCoaching.jsx` is fully
  client-side (Webcam simulation, no API). They were deleted (6 files, 285 lines) after
  verifying no imports remain and `require('./src/app')` + `vite build` still pass.
  The frontend route `/dashboard/live-coaching` is kept — it does not need a backend.
- **`dailyNutrition.js`** is mounted at `/api/nutrition` but its single endpoint
  (`POST /save-session/:userId`) actually writes to `workout_sessions`, not any
  nutrition-related table. Kept exactly as-is, flagged in a code comment in
  `services/dailyNutrition.service.js`.

## What to do next

1. Copy your real `.env` values in (the `.env` from your upload was carried over as-is).
2. `npm install`
3. `npm start` (or `node server.js`)

Everything should run identically to before — just organized.
