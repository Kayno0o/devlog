# SvelteKit to kay port: benchmark data

A real site ported from SvelteKit to kay: a home page and content pages (the partner page below).

## Conditions (apply to everything below unless a row says otherwise)
- **SvelteKit:** commit `c860ae5`, served by `bun build/index.ts` through the site's own Bun adapter. Pages are gzip only; static assets are precompressed br.
- **kay:** kay 1.30.0, commit `ed1ec8f`, the shipped config: `inlineStyles: true`, the home page prerendered with its contact form as a deferred server island (`server="defer"`), and `site` read from `SITE_URL` at runtime. The partner, legal and 404 pages are rendered per request.
- **Bun:** 1.4.4 canary (`1.4.4-canary.1+6c1eb067e`) for both versions, the kay executable's embedded runtime included (checked with `BUN_BE_BUN=1 ./server --revision`). kay is built by calling its CLI with that Bun: the site's `package.json` scripts put npm's `bun` 1.4.2 first on the path, installed as the Tailwind plugin's peer, so kay's builds and executable in sittings before 8 ran on Bun 1.4.2.
- **Machine:** one desktop, Ryzen 5 7600 (12 threads), Linux. Everything runs over loopback, so absolute figures are optimistic and only the ratios carry over.
- **Date:** 11 Oct 2026, every section in one sitting (sitting 9), both versions interleaved. Figures from different sittings should not be compared, since paints drift 50 ms or more and memory a few MiB.

## Web Vitals (browser)
Tool: the repo's `tests-e2e/perf.e2e.ts` (Playwright, Chromium), throttled through CDP with Lighthouse presets: slow 4G and 4x CPU for phones (Pixel 7), cable for desktop (1600x900). Cache disabled, page scrolled to the end. 3 rounds alternating between versions; each figure is the median of the 3, in ms.

| Page, device | Metric | SvelteKit | kay |
|---|---|---|---|
| Partner page, phone | First paint | 752 | 400 |
| Partner page, phone | Largest paint | 1,192 | 844 |
| Partner page, small phone (360 px) | First paint | 752 | 408 |
| Partner page, small phone | Largest paint | 1,200 | 852 |
| Partner page, laptop | First paint | 184 | 208 |
| Partner page, desktop | First paint | 188 | 216 |
| Home page, phone | First paint = largest paint | 884 | 532 |
| Home page, small phone | First paint = largest paint | 916 | 604 |
| Home page, laptop | First paint | 248 | 248 |
| Home page, laptop | Largest paint | 352 | 276 |
| Home page, desktop | First paint | 264 | 224 |
| Home page, desktop | Largest paint | 360 | 292 |

- Layout shift is at most 0.011 on kay (the partner page on phones: its list moves up 28 px about 800 ms in, cause not traced) and 0.0005 on SvelteKit. Both are well under the 0.1 "good" threshold.
- TTFB is not reported, since CDP throttling leaves Navigation Timing's `responseStart` unthrottled.
- The partner page on desktop and laptop is where kay is behind, by 24 to 28 ms.
- **Partner page largest paint:** the logo it paints last arrives after kay's runtime script, 14.6 KB brotli (see the client build below). On kay 1.17.4, before that script grew, it painted at 736 ms (sitting 6).
- **Honest note:** the phone paints need `inlineStyles`, which is opt-in. On kay 1.14.0 (sitting 2), with the stylesheet linked as kay does by default, kay's phone first paint was 85 to 140 ms behind SvelteKit, because its stylesheet downloads alongside the fonts, scripts and logos. Inlining costs about 2 KB more per page and no stylesheet caching between pages.

## Page weight (what a phone downloads, Chromium transfer sizes)

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Home page, whole page after scrolling | 706 | 558 | KB |
| Home page, first view before scrolling | 262 | 196 | KB |
| Home page requests | 65 (70 on desktop) | 29, the deferred contact form included | requests |
| Partner page, whole | 138 | 100 | KB |
| Partner page requests | 27 | 8 | requests |

- Most of the home page saving is images: kay serves AVIF q50 by `Accept`, at the width drawn.

## Client build, brotli sizes, not gzip

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Client JavaScript, all files, brotli | 70.1 (19 files) | 46.2 (33 files) | KB |
| Client JavaScript a page loads, brotli | | 16.0 (partner page, 3 files) | KB |
| Client CSS, brotli | 13.0 | 13.9 | KB |
| Font files | 231 (9 woff2) | 90 (3 woff2) | KB |
| Image files | 3.06 | 2.71 | MB |

SvelteKit's client JavaScript was not measured again: `c860ae5` has not changed since sitting 1.

- **kay's client JavaScript grew in kay 1.18.0:** kay 1.17.4 built 16.6 KB in 8 files (sitting 6). From 1.18.0, kay builds each of the home page's sections and the contact form as islands with shared chunks, which the pages never load as they render static, and its runtime script, loaded by every page with an island, went from 9.5 to 13.3 KB brotli. It was 14.4 KB on 1.28.0 and is 14.6 KB on 1.30.0.

**HTML per request, as each server sends it to a browser** (not the same encoding):

| Page | SvelteKit | kay | Unit |
|---|---|---|---|
| Home page | 16.9 gzip, rendered per request | 28.5 br, prerendered | KB |
| Partner page | 4.1 gzip | 20.7 gzip | KB |

- kay's HTML carries the 13.9 KB stylesheet inlined, so it is not fetched separately.
- Built without a site, as here, the home page is rendered again at boot once `SITE_URL` is known. For about the first 2 s after boot it goes out as a quickly compressed 34.2 KB br copy, then as the 28.5 KB one, recompressed in the background at the build's levels. The 28.5 KB was measured in sitting 7 on kay 1.24.4; the 34.2 KB copy again here.
- Inlined pages rendered per request go out as gzip: kay compresses them around a stylesheet deflated once at start.

## Server
Tool: oha 1.16 in Docker on the host network, `accept-encoding: gzip, deflate, br, zstd`. Latency is the p50 over 1,000 requests on one connection. Throughput is 10 s at 64 connections, after 300 warmup requests. CPU and RSS come from `/proc`. Two rounds alternating both servers; figures are the range over the rounds, or a single value where they agree. A first pair of rounds overlapped another project's test suite on the same machine and was discarded.

| Endpoint | Metric | SvelteKit | kay | Unit |
|---|---|---|---|---|
| Home page | Requests per second | 665 to 772 | 37,538 to 37,671 | req/s |
| Home page | CPU per request | 1.62 to 1.82 | 0.027 to 0.028 | ms |
| Home page | TTFB p50, 1 connection | 1.24 to 1.61 | 0.05 to 0.06 | ms |
| Home page, uncompressed | CPU per request | 1.02 | 0.11 | ms |
| Contact form island (`/?kay_island=0`) | Requests per second | | 8,723 to 8,968 | req/s |
| Contact form island | CPU per request, body sent | | 0.20 ms, 1.1 KB br | |
| Partner page | Requests per second | 3,787 to 4,202 | 4,069 to 4,124 | req/s |
| Legal notice | Requests per second | 4,504 to 5,022 | 4,626 to 4,696 | req/s |
| 404 page | Requests per second | 4,879 to 5,134 | 4,578 to 4,700 | req/s |
| Short pages (partner, legal, 404) | CPU per request | 0.22 to 0.29 | 0.26 to 0.30 | ms |
| Hero image, WebP | Requests per second | 40,754 to 41,587 | 57,115 to 57,595 | req/s |
| Hero image, AVIF | Requests per second | 43,444 to 45,323 | 57,853 to 59,371 | req/s |
| Health check | Requests per second | 60,517 to 62,266 | 72,866 to 73,066 | req/s |
| Cold start to first 200 | Median of 15 spawns | 21.2 to 22.8 | 24.7 to 25.9 | ms |
| RSS after start | | 39 | 51 | MiB |
| RSS peak, home page load | | 132 to 133 | 80 | MiB |

- **Home page:** kay serves it from memory, as any prerendered page, so it serves at about 49 to 57 times SvelteKit's rate for about a 60th of its CPU per request. Only the contact form is rendered per visitor, fetched by the browser about a screen before it scrolls into view: page and form together cost about 0.23 ms of CPU against SvelteKit's 1.62 to 1.82 ms.
- **Short pages** are still rendered per request and carry the inlined stylesheet: they serve at 0.89 to 1.09 times SvelteKit's rate, for 1.0 to 1.2 times its CPU per request.
- **Health check:** kay's answers on `/_kay/health`, SvelteKit's on `/healthz`.
- On images, SvelteKit serves static files, while kay serves resized variants through an image route, here at 1.3 to 1.4 times SvelteKit's rate.

## Build and deploy
Tool: hyperfine. Cold runs cleared caches (`.svelte-kit` and `node_modules/.cache`, or `.kay`): 3 runs. Warm runs kept the caches: 1 warmup and 5 runs. Figures are medians.

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Build, cold caches (`vite build` / `kay build --compile`) | 3.79 | 2.87 | s |
| Build, warm caches | 1.53 | 1.08 | s |
| Server code, Bun runtime left out | 14.5 (`build/` + production `node_modules`) | 19.1 (executable minus an empty program compiled the same way, 91.1 MB) | MB |
| Docker image | 229 (oven/bun:canary) | 185 (debian slim + one executable) | MB |
| Docker image, gzipped (`docker save \| gzip -1`) | 112 | 87 | MB |

- kay's build includes prerendering the home page.
- **Bun 1.4.4 builds kay more slowly (sitting 8):** the same tree built warm in 0.85 s on Bun 1.4.2 and 1.09 s on 1.4.4, about 28% slower; kay 1.24.4 took 0.83 s on 1.4.2 (sitting 7).
- **kay's server code:** the client build (3.2 MB), `public/` (4.0 MB), the prerendered page (0.3 MB) and the AVIF encoder's WebAssembly (3.5 MB), the rest about 8 MB of code and bytecode. The kay executable with the Bun runtime is 110.2 MB. SvelteKit's server code was not measured again.
- **Correction:** sittings 6 and 7 gave kay's server code as 8.9 and 9.6 MB. Those subtracted an empty program compiled on Bun 1.4.3 (91.0 MB) from an executable carrying Bun 1.4.2, whose empty program weighs 81.3 MB. Like for like, sitting 7's was 19.3 MB.

## Lines of code
Tool: cloc 2.10 on `git archive` of each commit, without `static/`, `public/` and `bun.lock`. `.kay` files were counted with C-style comments, which is how they're written. Comments and blank lines are excluded.

| Area | SvelteKit | kay | Unit |
|---|---|---|---|
| Application (src/, plus SvelteKit's adapter/) | 2,087 | 1,540 | lines |
| Components (.svelte / .kay) | 1,032 (22 files) | 887 (25 files) | lines |
| TypeScript and JavaScript | 616 | 249 | lines |
| CSS | 410 | 404 | lines |
| Tests | 714 | 842 | lines |
| Config and tooling | 236 | 166 | lines |
| Total | 3,037 | 2,548 | lines |

Counted at kay 1.30.0's commit (`ed1ec8f`). The contact form now names its fields with `field="..."` (kay 1.30.0), which writes `required`, `minlength`, `maxlength` and `type="email"` from the action's schema instead of the template repeating them, at the same line count.

## Earlier sittings
Kept for what the shipped config no longer shows; compare them within their own sitting only.
- **Linked styles, server (sitting 4, kay 1.16.6, `cd24483`, every page rendered per request):** linked short pages served at 1.8 to 2.2 times SvelteKit's rate (8.3k to 9.2k req/s), about twice the inlined rate, as inlined pages splice the stylesheet on the main thread while linked ones compress on the thread pool. The home page rendered per request served at 2.0 times SvelteKit inlined (1,487 req/s) and 2.4 times linked (1,772).
- **Server island modes (sitting 5, kay 1.17.1, uncommitted):** with the contact form marked `server` instead of `server="defer"`, the page is prerendered and the form rendered per request and spliced in, sent as gzip with `Cache-Control: private, no-store`: 4.0k to 5.0k req/s, 5 to 8 times SvelteKit, at 0.37 ms of CPU. With no mark, the whole page rendered per request served at 1.3k to 1.4k req/s.
- **Earlier releases, inlined short pages:** kay 1.16.0 served them at 1.8k to 2.2k req/s for 1.1 to 1.3 ms of CPU each, kay 1.16.3 at 2.1k to 2.2k req/s for 0.49 to 0.54 ms, kay 1.16.5 at 4.0k to 4.6k req/s for 0.31 to 0.35 ms, each in its own sitting.
- **kay 1.17.4 (sitting 6, `92090dd`):** before kay 1.18.0 grew the runtime script, the partner page weighed 94 KB in 7 requests and painted its largest element at 736 ms on a phone, against SvelteKit's 1,204 ms.
- **kay 1.24.4 on Bun 1.4.2 (sitting 7, `018dc38`):** home page 31.9k req/s at 0.030 ms of CPU, RSS 60 MiB at rest, cold build 2.48 s and warm 0.83 s.
- **kay 1.28.0 (sitting 8, `53b3fd4`, Bun `1.4.4-canary.1+71d0d4399`):** every figure within noise of sitting 9's; the runtime script was 14.4 KB brotli and the partner page's JavaScript 15.8 KB.

## Left out or to treat with care
- Absolute server numbers: loopback on one desktop. Quote the ratios.
- Comparisons of paint figures across sittings, and older kay versions' figures (1.10.x to 1.12.0).
- The SvelteKit desktop home page whole-page weight moved between sittings (655 KB in one, 432 KB in another, lazy images loading differently). Only the phone weights are stable.
- Memory: kay holds 1.3 times SvelteKit's RSS at rest; its peak under home page load is lower, since that page is served from memory. The bytecode accounts for about 3 MiB of the resting gap; the rest was not traced.
- Cold start: SvelteKit's moved from 20.5 to 31 ms across sittings 4 to 9, so read the 3 ms gap as noise.
- The Docker images compile and install inside Docker with the image's own Bun, which was not checked, so they only compare sizes.
