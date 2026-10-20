# findmetalk-web

The FindMeTalk web app and installable PWA: the cloud, calls, circles and
settings. Next.js (App Router) with TypeScript, Tailwind CSS and next-intl,
talking to [findmetalk-api](https://github.com/theijhay/findmetalk-api).

Agents and contributors: read [AGENTS.md](AGENTS.md) first.

## Run it locally

Needs Node 22 (`.nvmrc`) and a running findmetalk-api (`make run` there).

```sh
npm ci
cp .env.example .env.local   # API_URL points at the local API
npm run dev                  # http://localhost:3000
```

## Checks

`make ci` runs every gate: API contract drift, TypeScript, ESLint, tests, a
production build, the iOS 15 bundle check, `npm audit` and gitleaks.

## How it talks to the API

The browser never calls the API or holds a session token. It calls
`/api/v1/*` on this app's own origin with the paths and bodies of the API
contract; `src/app/api/v1/[...path]/route.ts` attaches the access token from
an `HttpOnly` cookie and forwards. Sign-in and refresh run on the server and
keep tokens in cookies.

API types are generated from the API's published contract:

```sh
npm run contract:sync   # copy ../findmetalk-api/contract and regenerate src/types/*.gen.ts
```

## Layout

```
src/app/                pages, layouts, route handlers (src/app/api/)
src/features/<feature>/ one product surface: api.ts, components/, schemas.ts
src/components/ui/      shared UI primitives
src/lib/                API client, proxy, session
src/i18n/               locale selection and loading
src/config/             constants (the product name lives in site.ts)
src/types/*.gen.ts      generated from contract/, never edited
messages/               UI strings: en.json is the source, others are reviewed translations
public/sw.js            service worker (static assets and the offline page only)
```

## Languages

English, Nigerian Pidgin, Yoruba, Hausa, Igbo and French. The language comes
from the user's saved choice, then the browser's preferences. A string missing
from a translation falls back to English.
