# icrs-fe

Interactive web interface for GOCC reporting. Built with AlpineJS and Bootstrap 5, providing responsive, accessible design following GCG UI/UX guidelines.

Clean, CDN-based Alpine.js frontend. No bundler/webpack — just static HTML +
ES modules, fronted by a thin Express BFF (Backend for Frontend) that proxies
to your microservices, structured so it stays clean as you add pages and
connect to more services.

## Contents

- [Getting started](#getting-started)
- [Architecture](#architecture)
- [How the BFF works](#how-the-bff-works)
- [Project structure](#project-structure)
- [How the app boots](#how-the-app-boots)
- [Styling conventions](#styling-conventions)
- [Adding a new page](#adding-a-new-page)
- [Adding a new component](#adding-a-new-component)
- [Adding a new microservice](#adding-a-new-microservice)
- [Calling a third-party API](#calling-a-third-party-api)
- [Mock microservices (local dev)](#mock-microservices-local-dev)
- [Environment configuration](#environment-configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Browser support](#browser-support)
- [Known limitations](#known-limitations)

## Getting started

### Prerequisites

- **Node.js** (any recent LTS) — runs the BFF, the mock backend, and the test
  runner. The frontend itself still isn't bundled or compiled by Node, so no
  framework CLI is required.

### Setup

1. **Clone the repo and move into it:**
   ```
   git clone <repo-url>
   cd icrs-fe
   ```
2. **Install dependencies:**
   ```
   npm install
   ```
3. **Start the BFF (serves the frontend + proxies `/api/*`):**
   ```
   npm run dev
   ```
   This serves `index.html`/`pages/**`/`src/**`/`styles/**`/`public/**` as-is
   and runs on **http://localhost:1001**.
4. **(Optional, second terminal) Start the mock API**, so the Users/Orders
   demo pages have data to show instead of an error state:
   ```
   npm run mock
   ```
5. **Open the app:** go to `http://localhost:1001` in your browser.

Without step 4 running, the app still loads fine — the Users and Orders
pages will still work — they'll just show their error state, since the
BFF has nothing to proxy `/api/users` / `/api/orders` to. That's intentional:
the service layer is meant to degrade visibly, not crash.

## Architecture

```
Browser  →  BFF (bff/server.js, one origin)  →  microservices
            ├─ serves the static frontend
            └─ proxies /api/<resource>/* to the service that owns it
```

The browser never calls a microservice directly and never knows its host or
port — every service client in `src/services/` talks to same-origin `/api`
(see `src/config/env.js`). `bff/server.js` looks at the first path segment
after `/api` (e.g. `users`, `orders`) to decide which upstream to forward to
(`bff/config.js`). This is why there's no CORS configuration anywhere in this
repo: frontend and API are one origin as far as the browser is concerned.

`mock-api/server.js` plays the role of "real microservices" for local dev —
it's what the BFF proxies to until you point `bff/config.js` at actual
services.

## How the BFF works

`bff/server.js` is intentionally small — a routing table plus a pass-through
`fetch`, no retries, caching, or aggregation. It handles two kinds of routes,
checked in this order:

1. **`express.json()`** parses incoming request bodies so they can be
   re-serialized when forwarding non-GET requests.
2. **Explicit routes first** — e.g. `app.get('/api/status/github', ...)`,
   used for anything that doesn't fit the generic `/api/<resource>` shape,
   most commonly third-party APIs (see
   [Calling a third-party API](#calling-a-third-party-api)). Registered
   before the generic proxy, so Express matches these first.
3. **`app.use('/api', handler)`** — the generic proxy, catches everything
   else under `/api/*` *before* static file serving ever sees it.
5. **Pick the upstream** — `req.originalUrl.split('/')[2]` pulls the resource
   name out of the path. `/api/users/42` → `['', 'api', 'users', '42']` →
   index `2` is `'users'`. That name is looked up in the `upstreams` map from
   `bff/config.js`. This is the *only* routing rule: whatever comes right
   after `/api/` decides where the request goes.
6. **Unknown resource → `502` immediately.** If nothing's registered for that
   name, the BFF doesn't fall through to static serving — it fails fast with
   a JSON error body, the same shape `ApiClient` already knows how to turn
   into a caught `ApiError`.
7. **Forward the request** — re-issues `req.originalUrl` against the
   upstream's origin (`/api/users` → `http://localhost:1002/api/users`),
   forwarding the method, `Content-Type`, and the `Authorization` header
   as-is if the browser sent one. Body is attached only for non-GET/HEAD
   requests.
8. **Mirror the response back** — status code and body (JSON or text) are
   sent to the browser unchanged. No transformation happens in either
   direction.
9. **Upstream unreachable → `502`.** If the `fetch` to the upstream throws
   (service down, DNS failure, etc.), that becomes a `502` too, so a
   misconfigured resource and a downed service look identical to the
   frontend.
10. **Everything that isn't `/api/*`** falls through to
    `express.static(rootDir)`, which serves `index.html`, `pages/`, `src/`,
    `styles/`, `public/` straight off disk.

Because step 5 is the entire routing decision for a generic microservice,
adding a new proxied service
is a one-line change to `bff/config.js` — see
[Adding a new microservice](#adding-a-new-microservice).

## Project structure

```
index.html              home page, links to every sample page
public/
  favicon.svg            shared favicon, referenced by every page
bff/
  server.js               Express: serves the frontend, proxies /api/*, and has one
                             dedicated route for the third-party GitHub status API
  config.js                 resource name -> upstream service URL, external API URLs,
                             and the BFF's own port
mock-api/
  server.js               zero-dependency stand-in for the real users/orders services
  fixtures.js              sample data returned by the mock server
pages/
  dashboard/
    index.html            counter demo — no service dependency
    index.css               page-specific layout/overrides
  users/
    index.html            userList demo — backed by userService
    index.css               page-specific layout/overrides
  orders/
    index.html            orderList demo — backed by orderService
    index.css               page-specific layout/overrides
  status/
    index.html            githubStatus demo — a third-party API via the BFF
    index.css               page-specific layout/overrides
src/
  config/env.js          service base URLs + shared config
  core/app.js             single place that registers stores/components on Alpine
  services/
    apiClient.js          base HTTP client (timeout, auth header, error normalization)
    userService.js        example microservice client (users)
    orderService.js        example microservice client (orders)
    statusService.js       client for the BFF's /api/status/github route
  stores/
    authStore.js           $store.auth — token/user, shared by all services
    uiStore.js              $store.ui — loading flag, toasts
  components/
    counter/
      counter.js              trivial Alpine.data example
      counter.css              styles used only by this component
    userList/
      userList.js              example service-backed component (loading/error/data)
      userList.css              styles used only by this component
    orderList/
      orderList.js              same pattern, backed by orderService
      orderList.css              styles used only by this component
    githubStatus/
      githubStatus.js            same pattern, backed by a third-party API via the BFF
      githubStatus.css            styles used only by this component
  utils/eventBus.js       pub/sub for cross-component messaging
styles/
  main.css                shared base: reset, tokens, .app/.card/.nav, buttons
  home.css                page-specific styles for index.html only
tests/smoke.test.mjs      Playwright smoke tests
```

## How the app boots

Every page loads two script tags, in this order:

```html
<script type="module" src="../../src/core/app.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.9/dist/cdn.min.js"></script>
```

`app.js` is a module (deferred by default) that adds a listener for the
`alpine:init` event and registers every store/component. The Alpine CDN
script loads after it, parses the DOM, and fires `alpine:init` right before
it starts binding `x-data` attributes. Because registration happens in one
file that every page shares, a component or store only needs to be wired up
once — any page can immediately use `x-data="componentName"` or
`$store.name`.

## Styling conventions

Styles are layered three ways, and every page's `<head>` links them in this
order:

1. `styles/main.css` — shared base (reset, CSS variables/tokens,
   `.app`/`.card`/`.nav`, buttons, error/muted text). Every page links this.
2. `src/components/<name>/<name>.css` — owned by one component, e.g.
   `counter.css` lives next to `counter.js`. Any page using
   `x-data="counter"` links that stylesheet directly. If a page uses three
   components, it links three component stylesheets.
3. `pages/<name>/index.css` — page-specific layout/overrides that aren't
   owned by any single component. Starts empty for a new page; fill it in
   once the page needs layout beyond what its components already provide.

This keeps styling co-located with what it styles instead of one growing
global stylesheet — a component's CSS moves/deletes with the component, and
a page's CSS moves/deletes with the page.

> **Note:** this is the CSS convention inherited from the original
> boilerplate. icrs-fe's actual stack calls for **Bootstrap 5 (SASS)** plus a
> self-owned component library built on top of it — that Sass build step
> hasn't been added yet. Once it is, this section should be updated to
> reflect the real styling approach.

## Adding a new page

1. Create `pages/<name>/index.html` — copy the `<nav>` block from an existing
   page and update the `aria-current="page"` link.
2. Create `pages/<name>/index.css` for that page's own layout/overrides.
3. Link, in order: `../../styles/main.css`, the stylesheet of every component
   the page uses (e.g. `../../src/components/counter/counter.css`), then
   `./index.css`.
4. Add favicon + meta tags (copy the block from an existing page, update
   `title`/`description`/`og:title`/`og:description`).
5. Point the script tags at `../../src/core/app.js` and the Alpine CDN build
   (same as the other pages).
6. Add a nav link to it from the other pages and from `index.html`.

## Adding a new component

1. Create `src/components/<name>/<name>.js` exporting an `Alpine.data()`
   factory (see `counter.js` for a plain example, `userList.js` for one
   backed by a service).
2. Add `src/components/<name>/<name>.css` for anything styled specifically
   for that component.
3. Register it in `src/core/app.js`: `Alpine.data('<name>', <name>)`.
4. In any page that uses it, add
   `<link rel="stylesheet" href="path/to/src/components/<name>/<name>.css" />`.

## Adding a new microservice

1. Add an upstream entry in `bff/config.js` under `upstreams`:
   ```js
   export const upstreams = {
     users: process.env.USERS_SERVICE_URL || 'http://localhost:1002',
     orders: process.env.ORDERS_SERVICE_URL || 'http://localhost:1003',
     <name>: process.env.<NAME>_SERVICE_URL || 'http://localhost:<port>',
   };
   ```
   The BFF forwards `GET/POST/... /api/<name>/*` to `${upstreams.<name>}/api/<name>/*`
   — the resource name in the URL is what selects the upstream.
2. Create `src/services/<name>Service.js`:
   ```js
   import { ApiClient } from './apiClient.js';
   import { config } from '../config/env.js';
   import { authStore } from '../stores/authStore.js';

   const client = new ApiClient(config.services.<name> ?? '/api', { getToken: () => authStore.token });

   export const <name>Service = {
     list: () => client.get('/<name>'),
   };
   ```
   (`config.services.<name>` doesn't need to be new — every service base URL is
   the same same-origin `/api`; add an entry to `src/config/env.js` only if
   you want it named explicitly.)
3. Use it from an `Alpine.data()` component (see `userList.js`), then register
   the component in `src/core/app.js`.
4. (Optional, for local dev) Add a route + fixture to `mock-api/` so the new
   service has something to talk to without a real backend — see below.

Every service shares the same `ApiClient` (timeout, JSON handling, auth
header, error shape), so behavior stays consistent across services. The BFF
is the only thing that knows real service hosts/ports; the browser only ever
sees `/api/*`.

## Calling a third-party API

`pages/status/` is a worked example of calling an external API — GitHub's
status via `https://isitdownstatus.com/api/v1/status/github` — the same way
you'd call any third-party service that isn't one of your own microservices:

1. **`bff/config.js`** — add the real URL to `externalApis`:
   ```js
   export const externalApis = {
     githubStatus: 'https://isitdownstatus.com/api/v1/status/github',
   };
   ```
2. **`bff/server.js`** — add a dedicated route *above* the generic `/api`
   proxy (Express matches routes in registration order, so this must come
   first):
   ```js
   app.get('/api/status/github', async (req, res) => {
     try {
       const upstreamRes = await fetch(externalApis.githubStatus);
       res.status(upstreamRes.status).json(await upstreamRes.json());
     } catch {
       res.status(502).json({ message: 'GitHub status service unreachable' });
     }
   });
   ```
   A dedicated route, not the generic proxy, because the third-party API's
   path doesn't follow the `/api/<resource>` convention — and because the
   real URL should stay server-side, never visible in the browser's network
   tab.
3. **`src/services/statusService.js`** — a normal `ApiClient`-based service,
   same as any other, calling the BFF's own `/api/status/github` path (not
   the real URL — the browser never sees that):
   ```js
   const client = new ApiClient(config.services.status);
   export const statusService = { githubStatus: () => client.get('/status/github') };
   ```
4. **`src/components/githubStatus/githubStatus.js`** — same loading/error/data
   pattern as `userList.js`/`orderList.js`. From the component's point of
   view, a third-party API and one of your own microservices look identical.

This is also the place to add an API key, if the third-party API needs one:
put it in an env var read by `bff/config.js` (never in `src/`, which ships to
the browser), and attach it to the `fetch` in step 2.

## Mock microservices (local dev)

`mock-api/server.js` is a dependency-free Node script that stands in for the
real `users` and `orders` microservices — it's the default upstream target in
`bff/config.js`. It listens on `1002` and `1003`, returns the fixtures in
`mock-api/fixtures.js`, and (unlike the BFF-fronted browser traffic) sends its
own permissive CORS headers, useful if you ever want to hit it directly while
debugging.

```
npm run mock
```

The browser never talks to it directly in normal use — the BFF does, on your
behalf. To add a mock route for a new service, add a
`serveJson(port, { '/api/path': data })` call in `mock-api/server.js` and
point `bff/config.js`'s matching upstream entry at that port. This is a dev
convenience only — production traffic should have the BFF pointed at your
real microservices via `USERS_SERVICE_URL`/`ORDERS_SERVICE_URL`/etc.

## Environment configuration

Two separate things are configurable, and they live in different places on
purpose — one is browser-facing, one is server-only:

- **`src/config/env.js`** (ships to the browser): service base URLs (all
  same-origin `/api` by default) and `requestTimeoutMs`. Never put real
  upstream hosts or secrets here — anything in `src/` is publicly readable.
- **`bff/config.js`** (server-only): the real upstream URL for each
  microservice, read from `USERS_SERVICE_URL` / `ORDERS_SERVICE_URL` (falling
  back to the local mock ports), and the BFF's own `PORT`. This is where
  per-environment differences actually live — set those env vars when you
  deploy instead of editing the file, or edit it directly for a small number
  of static environments.

## Testing

```
npm install
npx playwright install chromium   # first time only
npm test
```

`tests/smoke.test.mjs` starts the BFF (`bff/server.js`) and drives every page
in a real Chromium instance via Playwright:
- the home page links to all three sample pages,
- Alpine initializes and the counter component updates on click,
- the Users and Orders pages surface a visible error (not a crash) when the
  BFF has no upstream to reach (mock not running — a 502 from the proxy),
- once `mock-api/server.js` is started mid-suite, the Users and Orders pages
  render real fixture data end-to-end through the BFF proxy.

Both the error path and the happy path are covered in the same run — the mock
backend is spawned partway through the suite, after the error-path
assertions.

## Deployment

Unlike a purely static site, this now needs one Node process running:
`bff/server.js` both serves the frontend (`index.html`, `pages/**`, `src/**`,
`styles/**`, `public/**`) and proxies `/api/*` — there's no separate static
host plus separate API host to coordinate.

- **Any Node host** (Render, Fly.io, a container, a VM, Elastic Beanstalk,
  etc.): deploy the whole repo, run `node bff/server.js`, set
  `PORT`/`USERS_SERVICE_URL`/`ORDERS_SERVICE_URL` (etc.) for that
  environment. No build step required.
- **No CORS configuration needed**: because the BFF serves the frontend and
  proxies the API from the same origin, the browser never makes a
  cross-origin request. CORS only matters between the BFF and your real
  microservices if they enforce it server-side (most internal service-to-service
  traffic doesn't need to).
- **Static-only deploys are not compatible as-is**: if you deploy just the
  static assets to something like Netlify/S3 without the BFF, `/api/*` calls
  will 404. Either deploy `bff/server.js` alongside (e.g. as a serverless
  function or small Node service) or point `src/config/env.js` back at
  absolute microservice URLs and re-add CORS on those services.
- **Caching**: since there's no bundler producing hashed filenames, set short
  cache lifetimes (or `Cache-Control: no-cache` with ETags) on
  `.html`/`.js`/`.css` responses so deploys are picked up promptly.

## Browser support

Relies on native ES modules (`<script type="module">`), `fetch`,
`AbortController`, and Alpine.js 3.x — i.e. any evergreen browser (Chrome,
Firefox, Safari, Edge). No transpilation happens, so it won't work on
browsers that don't support ES modules (e.g. IE11).

## Known limitations

- No `x-cloak` handling yet — pages using `x-show` (loading/error states,
  toasts) can briefly flash before Alpine finishes initializing on a slow
  connection.
- `authStore.login()`/`logout()` exist but nothing in the sample pages calls
  them — there's no login UI or route-guarding example yet, and the BFF
  doesn't currently do anything with auth beyond forwarding the
  `Authorization` header as-is.
- The BFF proxy is intentionally simple: no retries, no response caching, no
  request aggregation across services. Add those in `bff/server.js` as
  actual needs arise.
- No linter/formatter config, so style consistency across files is manual.
- No Bootstrap 5 / Sass build yet — see the note in
  [Styling conventions](#styling-conventions).
