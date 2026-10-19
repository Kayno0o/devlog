# The voting app, Elysia and Solid 2 against kay

Measured with kay's sites bench (`bun run bench:sites` in kayjs, the site given by a local config), the site left unnamed: the voting app, a private two-person site that rates profile cards, signed in with Discord.

- AMD Ryzen 5 7600 6-Core Processor, 12 threads
- Bun 1.4.3, Chromium 151.0.7922.34 headless, nginx/1.30.5
- Elysia + Solid 2 at 749b3ea: an Elysia API, Solid 2 islands over a hand-rolled server rendering tier, JWT sessions
- kay 1.57.0 at cfee8b8, signed in through kayjs-auth
- run on 2026-10-19, both sides in one sitting

The voting app as it last ran on Elysia and Solid 2, then on kay, each built and served as it deploys: the Elysia server under Bun, kay's one executable, both behind an nginx set up for production (HTTP/2 over TLS, brotli and gzip at level 6). kay is the version the site pins, not this checkout. Each side reads its own Postgres, seeded alike: 2 people, 84 subjects with 12 generated WebP images, 60 of them judged by both, one round under way and one finished. Every page but the sign-in page is measured signed in. There is no dev server phase, since the bench only runs Astro's dev server.

## What a page downloads

Average over every page: text as brotli at quality 11 sends it, images as served at each viewport (desktop 1280 px at 1x, phone 390 px at 3x), and the fonts the stylesheets can load for Latin text.

|  | Elysia + Solid | kay |
| --- | --- | --- |
| HTML | 1.7 KB | 10.8 KB |
| CSS | 8.2 KB | 0.0 KB |
| JS | 38.4 KB | 31.9 KB |
| JS files | 5.5 | 19.8 |
| images, desktop | 652.4 KB | 654.0 KB |
| images, phone | 652.4 KB | 654.0 KB |
| fonts | 39.9 KB | 39.9 KB |

kay renders the whole page on the server and inlines each page's styles, hence more HTML and no stylesheet. It also sends more JS files, 19.8 against 5.5 per page, but fewer bytes.

## In a browser

Every page loaded cold, 5 times in a fresh context, medians averaged over the pages, with Lighthouse's throttling: a phone on slow 4G with a 4x slower CPU, and a desktop on cable. Total blocking time counts long tasks from the first paint on.

|  | Elysia + Solid | kay |
| --- | --- | --- |
| mobile first paint (ms) | 1919 | 671 |
| mobile largest paint (ms) | 4016 | 1830 |
| mobile blocking time (ms) | 4.3 | 0.0 |
| mobile layout shift | 0.019 | 0.119 |
| mobile load (ms) | 5549 | 2436 |
| mobile transferred | 752.6 KB | 205.8 KB |
| mobile requests | 26.2 | 27.3 |
| desktop first paint (ms) | 286 | 80.0 |
| desktop largest paint (ms) | 531 | 405 |
| desktop blocking time (ms) | 0.0 | 0.0 |
| desktop layout shift | 0.017 | 0.007 |
| desktop load (ms) | 709 | 480 |
| desktop transferred | 753.4 KB | 444.2 KB |
| desktop requests | 27.8 | 32.5 |

Mobile layout shift is worse on kay, 0.019 to 0.119. kay paints the whole page from the server's HTML, so when the web fonts arrive they reflow text already on screen. kay's metric-matched fallback, which should make that swap invisible, is Arial through `local()`, and it never loads on a machine without Arial, as this bench machine and likely Android: kaynooo/kayjs#1208. The old side drew those sections only after hydration, by which time the fonts had arrived. Preloading the fonts was tried and dropped: first paint came about 110 ms later and the shift stayed. Desktop shift improved, 0.017 to 0.007, once the port reserved the card image's box.

## Server

Cold start is from spawning the server to its first 200 on the home page, median of 7. Under load, 32 clients request one URL through nginx for 5 s over keepalive HTTP/1.1, accepting brotli; CPU is per request, of the site's server and of nginx, which compresses what the server sent uncompressed. The client is Bun's fetch, which tops out near 40,000 requests a second. Memory is proportional (PSS), counting once the pages processes share; its peak is resident (RSS).

|  | Elysia + Solid | kay |
| --- | --- | --- |
| cold start | 297 ms | 41.5 ms |
| memory once started | 121 MB | 71 MB |
| memory after load (peak) | 196 MB (223 MB) | 120 MB (182 MB) |

|  | URL | req/s | p50 (ms) | p99 (ms) | server CPU (µs/req) | nginx CPU (µs/req) |
| --- | --- | --- | --- | --- | --- | --- |
| Elysia + Solid | the home page | 1330 | 24.0 | 32.4 | 874 | 427 |
| Elysia + Solid | a round's page | 1685 | 18.6 | 30.1 | 696 | 374 |
| Elysia + Solid | its stylesheet | 8297 | 2.1 | 17.8 | 26 | 1026 |
| kay | the home page | 5208 | 5.8 | 10.2 | 219 | 52 |
| kay | a round's page | 5139 | 5.9 | 10.0 | 199 | 51 |

## Build and code

Clean builds, median of 3. `kay build` runs `kay check` first, which the old build has no equivalent of, hence its slower wall time. Lines are cloc's code lines of the sources and the config files.

|  | command | wall (s) | CPU (s) | peak memory |
| --- | --- | --- | --- | --- |
| Elysia + Solid | `bun run build` | 0.38 | 0.9 | 213 MB |
| kay | `kay build` | 0.81 | 1.6 | 249 MB |
| kay | `kay build --no-check` | 0.74 | 1.5 | 227 MB |

|  | Elysia + Solid | kay |
| --- | --- | --- |
| lines of code | 3759 | 2243 |
| lines of tests | 4487 | 2569 |
| deployed | 289 MB (what it ships and production node_modules) | 104 MB (one executable) |

## What the port filed against kay

kaynooo/kayjs#1200 to #1208:

- #1200: `sessionCookie` mints a cookie an https site never reads. Until the port minted its session cookie over https, the first run of this bench measured the sign-in page on the kay side instead of the signed-in pages, so a bench should check that every page it measures answers 200 rather than redirecting to sign-in: #1201.
- #1202: `attempt` and `ConfirmDelete` read the refusal of an API call.
- #1203: `segmented` takes numeric option values.
- #1204 and #1205: the docs do not say how to type an action prop, nor how to draw an icon chosen by a value.
- #1206: a link to a configured redirect passes the link check.
- #1207: a test can override a `defineEnv` value.
- #1208: the metric-matched font fallback does not load without Arial, behind the mobile layout shift above.
