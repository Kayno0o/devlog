# SvelteKit to kay port: benchmark data

A real site ported from SvelteKit to kay: a home page and content pages (the partner page below).

## Conditions (apply to everything below unless a row says otherwise)
- **SvelteKit:** commit `c860ae5`, served by `bun build/index.ts` through the site's own Bun adapter. Pages are gzip only; static assets are precompressed br.
- **kay:** kay 1.24.4, commit `018dc38`, the shipped config: `inlineStyles: true`, the home page prerendered with its contact form as a deferred server island (`server="defer"`), and `site` read from `SITE_URL` at runtime. The partner, legal and 404 pages are rendered per request.
- **Machine:** one desktop, Ryzen 5 7600 (12 threads), Linux, Bun 1.4.3 canary. Everything runs over loopback, so absolute figures are optimistic and only the ratios carry over.
- **Date:** 10 Oct 2026, every section in one sitting (sitting 7), both versions interleaved. Figures from different sittings should not be compared, since paints drift 50 ms or more and memory a few MiB.

## Web Vitals (browser)
Tool: the repo's `tests-e2e/perf.e2e.ts` (Playwright, Chromium), throttled through CDP with Lighthouse presets: slow 4G and 4x CPU for phones (Pixel 7), cable for desktop (1600x900). Cache disabled, page scrolled to the end. 3 rounds alternating between versions; each figure is the median of the 3, in ms.

| Page, device | Metric | SvelteKit | kay |
|---|---|---|---|
| Partner page, phone | First paint | 752 | 404 |
| Partner page, phone | Largest paint | 1,204 | 860 |
| Partner page, small phone (360 px) | First paint | 756 | 420 |
| Partner page, small phone | Largest paint | 1,212 | 828 |
| Partner page, desktop | First paint | 188 | 204 |
| Home page, phone | First paint = largest paint | 916 | 568 |
| Home page, small phone | First paint = largest paint | 944 | 648 |
| Home page, laptop | First paint | 268 | 268 |
| Home page, laptop | Largest paint | 384 | 276 |
| Home page, desktop | First paint | 304 | 232 |
| Home page, desktop | Largest paint | 372 | 284 |

- Layout shift is at most 0.011 on kay (the partner page on phones: its list moves up 28 px about 800 ms in, cause not traced) and 0.0005 on SvelteKit. Both are well under the 0.1 "good" threshold.
- TTFB is not reported, since CDP throttling leaves Navigation Timing's `responseStart` unthrottled.
- The partner page on desktop and laptop is where kay is behind, by 12 to 16 ms.
- **Partner page largest paint:** the logo it paints last arrives after kay's runtime script, which weighs 14.5 KB on the wire (see the client build below). On a slow 4G phone that puts the largest paint at 860 ms, against 736 ms on kay 1.17.4 in sitting 6, while SvelteKit's stayed at 1,204 ms in both sittings.
- **Honest note:** the phone paints need `inlineStyles`, which is opt-in. On kay 1.14.0 (sitting 2), with the stylesheet linked as kay does by default, kay's phone first paint was 85 to 140 ms behind SvelteKit, because its stylesheet downloads alongside the fonts, scripts and logos. Inlining costs about 2 KB more per page and no stylesheet caching between pages.

## Page weight (what a phone downloads, Chromium transfer sizes)

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Home page, whole page after scrolling | 706 | 557 | KB |
| Home page, first view before scrolling | 262 | 195 | KB |
| Home page requests | 65 (70 on desktop) | 29, the deferred contact form included | requests |
| Partner page, whole | 138 | 99 | KB |
| Partner page requests | 27 | 8 | requests |

- Most of the home page saving is images: kay serves AVIF q50 by `Accept`, at the width drawn.
- The home page downloads 7 scripts from kay (22.9 KB on the wire) and fetches the contact form island once (2.1 KB).

## Client build, brotli sizes, not gzip

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Client JavaScript, all files, brotli | 70.1 (19 files) | 45.1 (33 files) | KB |
| Client JavaScript a page loads, brotli | | 15.0 (partner page, 3 files) | KB |
| Client CSS, brotli | 13.0 | 13.9 | KB |
| Font files | 231 (9 woff2) | 90 (3 woff2) | KB |
| Image files | 3.06 | 2.71 | MB |

SvelteKit's client JavaScript was not measured again: `c860ae5` has not changed since sitting 1.

- **kay's client JavaScript grew in kay 1.18.0:** kay 1.17.4 built 16.6 KB in 8 files (sitting 6). From 1.18.0, kay builds each of the home page's sections and the contact form as islands with shared chunks, which the pages never load as they render static, and its runtime script, loaded by every page with an island, went from 9.5 to 13.3 KB brotli (13.6 KB on 1.24.4). Measured by building `018dc38` against each release from 1.17.4 to 1.25.0: 1.17.7 matches 1.17.4, 1.18.0 brings the whole jump, later releases add 0.3 KB.

**HTML per request, as each server sends it to a browser** (not the same encoding):

| Page | SvelteKit | kay | Unit |
|---|---|---|---|
| Home page | 16.9 gzip, rendered per request | 28.5 br, prerendered | KB |
| Partner page | 4.1 gzip | 20.7 gzip | KB |

- kay's HTML carries the 13.9 KB stylesheet inlined, so it is not fetched separately.
- Built without a site, as here, the home page is rendered again at boot once `SITE_URL` is known. For about the first 2 s after boot it goes out as a quickly compressed 34.2 KB br copy, then as the 28.5 KB one, recompressed in the background at the build's levels.
- Inlined pages rendered per request go out as gzip: kay compresses them around a stylesheet deflated once at start.

## Server
Tool: oha 1.16 in Docker on the host network, `accept-encoding: gzip, deflate, br, zstd`. Latency is the p50 over 1,000 requests on one connection. Throughput is 10 s at 64 connections, after 300 warmup requests. CPU and RSS come from `/proc`. Two rounds alternating both servers; figures are the range over the rounds, or a single value where they agree.

| Endpoint | Metric | SvelteKit | kay | Unit |
|---|---|---|---|---|
| Home page | Requests per second | 781 to 798 | 31,872 to 31,935 | req/s |
| Home page | CPU per request | 1.54 to 1.60 | 0.030 | ms |
| Home page | TTFB p50, 1 connection | 1.21 to 1.22 | 0.07 | ms |
| Home page, uncompressed | CPU per request | 0.98 | 0.15 | ms |
| Contact form island (`/?kay_island=0`) | Requests per second | | 9,610 to 10,287 | req/s |
| Contact form island | CPU per request, body sent | | 0.19 to 0.20 ms, 1.1 KB br | |
| Partner page | Requests per second | 4,120 to 4,206 | 4,054 to 4,101 | req/s |
| Legal notice | Requests per second | 4,969 to 5,256 | 4,638 to 4,643 | req/s |
| 404 page | Requests per second | 5,237 to 5,291 | 4,657 to 4,667 | req/s |
| Short pages (partner, legal, 404) | CPU per request | 0.21 to 0.27 | 0.30 to 0.35 | ms |
| Hero image, WebP | Requests per second | 40,751 to 41,819 | 44,075 to 44,241 | req/s |
| Hero image, AVIF | Requests per second | 45,638 to 46,350 | 46,237 to 46,937 | req/s |
| Health check | Requests per second | 65,374 to 65,668 | 76,498 to 76,740 | req/s |
| Cold start to first 200 | Median of 15 spawns | 22.0 to 22.4 | 27.2 to 27.6 | ms |
| RSS after start | | 40 | 60 to 61 | MiB |
| RSS peak, home page load | | 133 to 135 | 86 to 87 | MiB |

- **Home page:** kay serves it from memory, as any prerendered page, so it serves at about 40 times SvelteKit's rate for about a 50th of its CPU per request. Only the contact form is rendered per visitor, fetched by the browser about a screen before it scrolls into view: page and form together cost about 0.23 ms of CPU against SvelteKit's 1.54 to 1.60 ms.
- **Short pages** are still rendered per request and carry the inlined stylesheet: they serve at 0.9 to 1.0 times SvelteKit's rate, for 1.3 to 1.4 times its CPU per request.
- **Health check:** kay's answers on `/_kay/health`, SvelteKit's on `/healthz`.
- On images, SvelteKit serves static files, while kay serves resized variants through an image route.

## Build and deploy
Tool: hyperfine. Cold runs cleared caches (`.svelte-kit` and `node_modules/.cache`, or `.kay`): 3 runs. Warm runs kept the caches: 1 warmup and 5 runs. Figures are medians: SvelteKit's first cold run took 6.0 s against 3.6 s for the next two, which puts its mean at 4.40 s.

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Build, cold caches (`vite build` / `kay build --compile`) | 3.62 | 2.48 | s |
| Build, warm caches | 1.64 | 0.83 | s |
| Server code, Bun runtime left out | 14.5 (`build/` + production `node_modules`) | 9.6 (executable minus an empty program compiled the same way, 91.0 MB) | MB |
| Docker image | 229 (oven/bun:canary) | 185 (debian slim + one executable) | MB |
| Docker image, gzipped (`docker save \| gzip -1`) | 112 | 87 | MB |

- kay's build includes prerendering the home page.
- The kay executable with the Bun runtime is 100.6 MB. SvelteKit's server code was not measured again.

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

Counted at kay 1.24.4's commit (`018dc38`).

## Earlier sittings
Kept for what the shipped config no longer shows; compare them within their own sitting only.
- **Linked styles, server (sitting 4, kay 1.16.6, `cd24483`, every page rendered per request):** linked short pages served at 1.8 to 2.2 times SvelteKit's rate (8.3k to 9.2k req/s), about twice the inlined rate, as inlined pages splice the stylesheet on the main thread while linked ones compress on the thread pool. The home page rendered per request served at 2.0 times SvelteKit inlined (1,487 req/s) and 2.4 times linked (1,772).
- **Server island modes (sitting 5, kay 1.17.1, uncommitted, babelraid issue #12):** with the contact form marked `server` instead of `server="defer"`, the page is prerendered and the form rendered per request and spliced in, sent as gzip with `Cache-Control: private, no-store`: 4.0k to 5.0k req/s, 5 to 8 times SvelteKit, at 0.37 ms of CPU. With no mark, the whole page rendered per request served at 1.3k to 1.4k req/s.
- **Earlier releases, inlined short pages:** kay 1.16.0 served them at 1.8k to 2.2k req/s for 1.1 to 1.3 ms of CPU each, kay 1.16.3 at 2.1k to 2.2k req/s for 0.49 to 0.54 ms, kay 1.16.5 at 4.0k to 4.6k req/s for 0.31 to 0.35 ms, each in its own sitting.
- **kay 1.17.4 (sitting 6, `92090dd`):** before kay 1.18.0 grew the runtime script, the partner page weighed 94 KB in 7 requests and painted its largest element at 736 ms on a phone, against SvelteKit's 1,204 ms in both sittings.

## Left out or to treat with care
- Absolute server numbers: loopback on one desktop. Quote the ratios.
- Comparisons of paint figures across sittings, and older kay versions' figures (1.10.x to 1.12.0).
- The SvelteKit desktop home page whole-page weight moved between sittings (655 KB in one, 432 KB in another, lazy images loading differently). Only the phone weights are stable.
- Memory: kay holds 1.5 times SvelteKit's RSS at rest; its peak under home page load is lower, since that page is served from memory. The bytecode accounts for about 3 MiB of the resting gap; the rest was not traced.
- Cold start: SvelteKit's moved from 20.9 to 31 ms across sittings 4 to 7, so read the 5 ms gap as noise.
