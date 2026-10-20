<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes: APIs, conventions and file structure may
all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation
notices.
<!-- END:nextjs-agent-rules -->

# Rules for coding agents

Every agent working in this repository (Codex, Gemini, Claude, or any other)
follows these rules. Read the whole file before you change code. `GEMINI.md`
and `CLAUDE.md` point here; this file is the only copy of the rules.

## How work flows here

- **Implementers** (Codex, Gemini) build the UI and open pull requests.
- **The reviewer** (Claude) reviews every pull request. Fixes for review
  findings land as new commits on the same branch.
- **The reviewer** also merges the pull requests it approves into
  `development`.
- **Isaac** owns the product and is the only person who merges into `main`.

## Read the spec first

The product spec lives at `../findmetalk-api/findmetalk-docs/findMeTalk_SPEC.md`
on the owner's machine only. Read it before any task, especially sections 3
(principles), 7 (user flow), 9 (how the cloud looks and feels) and 11
(safety). Follow its section 0:

- **`OPEN` means undecided. Stop and ask the owner.** Never pick a default.
- `PROPOSED` means build behind an abstraction so it can be swapped.
- `DECIDED` means build it; do not re-argue it.
- Name requirement IDs (`FR-CLOUD-3`, `SAFE-2`, `REC-2`) in branch names,
  commits, pull requests and test names.
- Safety (spec section 11) overrides convenience, speed and visual ideas.

## Private docs never reach GitHub

This repository is **public**. The spec, ADRs and notes are never committed,
quoted at length in a pull request, or copied into code comments. CI fails if
a `findmetalk-docs/` folder or a `*_SPEC.md` file is tracked.

## Branches, commits and pull requests

- `development` is the integration branch; `main` is the release branch.
- Start every task on a new branch from `origin/development`, named
  `<type>/<id>-<short-name>`, e.g. `feat/fr-cloud-3-list-view`. Open the pull
  request into `development`.
- **Never push to `development` or `main`. Never merge a pull request.**
  The reviewer merges approved pull requests into `development`; Isaac
  merges `development` into `main`.
- Never reuse a branch that was already merged.
- **One change per pull request.**
- Commit as `theijhay <olawaleisaacjohn@gmail.com>`. **No AI attribution
  anywhere**: no `Co-Authored-By`, no "Generated with ...", no agent or model
  name, in commits, pull requests, comments or code. After opening a pull
  request, read its body back and remove any footer that appeared.

## Pull requests are public

This repository is public and read by people outside the project:

- The body follows the template and states **what was done**: summary,
  changes, screenshots for UI changes, testing. Straightforward, no padding.
- **No questions, open items, notes to the owner, or TODO lists** in the
  pull request body, and **no comments** on your own pull request.
- Questions, risks and decisions that need Isaac go to him directly in your
  session, before you open the pull request.
- Nothing about accounts, billing, credentials or internal tooling.

## Before every push: `make ci`

`make ci` runs every gate: the contract check, TypeScript, ESLint, the tests,
a production build, the iOS 15 bundle check, `npm audit` and gitleaks. **A
pull request is only opened or pushed after `make ci` passes.** If anything
fails, do not push. Never weaken a gate to get green: no `@ts-ignore`,
`eslint-disable` or skipped test without a comment saying why.

## Where things go

- Pages and layouts in `src/app/`; route handlers in `src/app/api/`.
- A product surface is a folder under `src/features/<feature>/` with its own
  `api.ts`, `components/` and `schemas.ts`. Features: `auth`, `onboarding`,
  `profile`, `cloud`, `calls`, `circles`, `safety`, `help`, `settings`,
  `pwa`.
- Shared, product-agnostic UI primitives in `src/components/ui/`; app chrome
  in `src/components/layout/`.
- Design tokens (colours, radii, spacing, motion) live only in
  `src/app/globals.css`. Components use the tokens, never a raw hex.
- Constants in `src/config/`. The product name is `SITE.name` in
  `src/config/site.ts`; never write it anywhere else.

## The API contract (TR-8)

- **API types are generated, never written by hand.** `contract/` holds a
  copy of the API's `openapi.json` and `events.schema.json`; `src/types/api.gen.ts`
  and `src/types/events.gen.ts` are generated from it.
- When the API changes: `npm run contract:sync` reads the contract from
  findmetalk-api's `origin/development` in git (`../findmetalk-api`, or
  `API_REPO`), whatever branch that checkout is on. Commit both the copied
  contract and the regenerated types. `make ci` fails if they drift from the
  API's `development`. Never bypass the check with `API_CONTRACT_DIR=contract`.
- Every feature issue in `findmetalk-api` lists its endpoints, bodies and
  error codes. Build against those; if the contract does not have what the UI
  needs, ask Isaac. Never invent an endpoint.
- Call the API with the typed client in `src/lib/api/client.ts`.

## Security rules that are easy to break

- **Never expose a token to browser JavaScript.** No `NEXT_PUBLIC_` API URL,
  no token in a page, no `localStorage` or `sessionStorage` for credentials.
  The browser calls `/api/v1/*` on this app's own origin; the route handler
  in `src/app/api/v1/[...path]/route.ts` attaches the access token from an
  `HttpOnly` cookie. The WebSocket connects with a short-lived ticket, never
  the access token. LiveKit media tokens are the one exception: they are
  scoped to one call and expire in minutes.
- **Never loosen the proxy's path check** (`resolveTarget`). It parses the
  URL and verifies the result is still under `/api/v1/`; matching on `..`
  segments is bypassable with `..%2F`.
- The service worker never caches anything under `/api/` and never caches a
  personal page.

## Product rules that are easy to break (spec 3, 7, 9, 11)

- **Voice only.** No text chat, DMs or file sharing between users, ever.
- **End, Leave, Block and Report are always on screen** during calls and
  circles. **"I need help" is reachable from every screen.**
- **A visible "recorded for safety" indicator** is on screen for the whole of
  every recorded call or circle, whenever the API says `recorded: true`.
- Declining is silent. The caller never learns whether they were skipped;
  copy never says "rejected".
- No pressure numbers: no follower counts, popularity, leaderboards, read
  receipts, or "who talked most". The only count is the true number of open
  people.
- No bots, fake users or fake numbers, ever.
- "Open to talk" is off by default; the user turns it on.
- No hotline numbers in code. Copy touching crisis, health, recording consent
  or legal topics is listed in `messages/needs-review.json` with its
  requirement ID and left for the owner.
- Photos appear only on the profile card and incoming-call screen, never on
  orbs.

## Accessibility (spec 9.3, 9.6): checked on every UI change

- WCAG 2.2 AA: contrast, visible focus, keyboard navigation, screen reader
  labels on every control.
- Touch targets at least 44 by 44 px.
- `prefers-reduced-motion` and screen readers get the list view by default,
  and every animation has a reduced-motion version.
- Colour is never the only signal: pair it with an icon or text.

## Localization (spec 9.6)

- **Every user-facing string comes from `messages/`**, through next-intl.
  No hardcoded copy in components, including `aria-label`s.
- Add new keys to `messages/en.json` only. Other languages are filled by
  reviewed human translation, never machine translation for safety copy; a
  missing key falls back to English.
- API error `code`s map to keys under `errors.` in the messages.
- Layouts must survive strings 40% longer than English.

## Browser floor

Older Android phones and iPhones on iOS 15 must work (spec 9.1).
`.browserslistrc` sets the floor at Safari 15.4 and Chrome 111. Never use a
browser API newer than that without a fallback, and never bump Next, React or
the build target without running `make ci`, which checks the bundles for
syntax iOS 15 cannot parse.

## Style

- Match the surrounding code: naming, comment density, idiom.
- **No em dashes**, in copy, messages or comments. Use a comma, colon or full
  stop.
- Microcopy is warm, plain and short (spec 9.6).
- Scalable, not complicated: no abstraction that is not earned yet.
