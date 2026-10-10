# SvelteKit to kay port: benchmark data

A real site ported from SvelteKit to kay: a home page and content pages (the partner page below).

## Conditions (apply to everything below unless a row says otherwise)
- **SvelteKit:** commit `c860ae5`, served by `bun build/index.ts` through the site's own Bun adapter. Pages are gzip only; static assets are precompressed br.
- **kay:** kay 1.17.4, commit `92090dd`, the shipped config: `inlineStyles: true`, the home page prerendered with its contact form as a deferred server island (`server="defer"`), and `site` read from `SITE_URL` at runtime. The partner, legal and 404 pages are rendered per request.
- **Machine:** one desktop, Ryzen 5 7600 (12 threads), Linux, Bun 1.4.3 canary. Everything runs over loopback, so absolute figures are optimistic and only the ratios carry over.
- **Date:** 10 Oct 2026, every section in one sitting (sitting 6), both versions interleaved. Figures from different sittings should not be compared, since paints drift 50 ms or more and memory a few MiB.

## Web Vitals (browser)
Tool: the repo's `tests-e2e/perf.e2e.ts` (Playwright, Chromium), throttled through CDP with Lighthouse presets: slow 4G and 4x CPU for phones (Pixel 7), cable for desktop (1600x900). Cache disabled, page scrolled to the end. 3 rounds alternating between versions; the first round ran right after the Docker builds and was slower for both, so each figure is the median of the 3, in ms.

| Page, device | Metric | SvelteKit | kay |
|---|---|---|---|
| Partner page, phone | First paint | 752 | 424 |
| Partner page, phone | Largest paint | 1,204 | 736 |
| Partner page, small phone (360 px) | First paint | 760 | 512 |
| Partner page, small phone | Largest paint | 1,204 | 788 |
| Partner page, desktop | First paint | 200 | 220 |
| Home page, phone | First paint = largest paint | 888 | 588 |
| Home page, small phone | First paint = largest paint | 1,012 | 868 |
| Home page, laptop | First paint | 348 | 256 |
| Home page, laptop | Largest paint | 444 | 276 |
| Home page, desktop | First paint | 336 | 276 |
| Home page, desktop | Largest paint | 436 | 304 |

- Layout shift is at most 0.002 on both versions.
- TTFB is not reported, since CDP throttling leaves Navigation Timing's `responseStart` unthrottled.
- The partner page's desktop first paint is the one row where kay is behind, by 20 ms.
- **Honest note:** the phone paints need `inlineStyles`, which is opt-in. On kay 1.14.0 (sitting 2), with the stylesheet linked as kay does by default, kay's phone first paint was 85 to 140 ms behind SvelteKit, because its stylesheet downloads alongside the fonts, scripts and logos. Inlining costs about 2 KB more per page and no stylesheet caching between pages.

## Page weight (what a phone downloads, Chromium transfer sizes)

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Home page, whole page after scrolling | 706 | 552 | KB |
| Home page, first view before scrolling | 262 | 189 | KB |
| Home page requests | 65 (70 on desktop) | 26, the deferred contact form included | requests |
| Partner page, whole | 138 | 94 | KB |
| Partner page requests | 27 | 7 | requests |

- Most of the home page saving is images: kay serves AVIF q50 by `Accept`, at the width drawn.

## Client build, brotli sizes, not gzip

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Client JavaScript, all files, brotli | 70.1 (19 files) | 16.6 (8 files) | KB |
| Client CSS, brotli | 13.0 | 13.9 | KB |
| Font files | 231 (9 woff2) | 90 (3 woff2) | KB |
| Image files | 3.06 | 2.71 | MB |

SvelteKit's client JavaScript was not measured again: `c860ae5` has not changed since sitting 1.

**HTML per request, as each server sends it to a browser** (not the same encoding):

| Page | SvelteKit | kay | Unit |
|---|---|---|---|
| Home page | 16.9 gzip, rendered per request | 34.1 br, prerendered | KB |
| Partner page | 4.1 gzip | 20.6 gzip | KB |

- kay's HTML carries the 13.9 KB stylesheet inlined, so it is not fetched separately.
- A home page built with the site set serves 28.4 KB br. Built without it, as here, the page is rendered again at boot once `SITE_URL` is known, and kay 1.17.4 compressed that render at request-path levels (brotli 4) instead of the build's. That is a regression, fixed in kay 1.17.6, which compresses it again at the build's levels, so every request after the first gets the build's bytes.
- Inlined pages rendered per request go out as gzip: kay compresses them around a stylesheet deflated once at start.

## Server
Tool: oha 1.16 in Docker on the host network, `accept-encoding: gzip, deflate, br, zstd`. Latency is the p50 over 1,000 requests on one connection. Throughput is 10 s at 64 connections, after 300 warmup requests. CPU and RSS come from `/proc`. Two rounds alternating both servers; figures are the range over the rounds, or a single value where they agree.

| Endpoint | Metric | SvelteKit | kay | Unit |
|---|---|---|---|---|
| Home page | Requests per second | 753 to 767 | over 14k (14,332 to 30,201) | req/s |
| Home page | CPU per request | 1.63 | 0.044 | ms |
| Home page | TTFB p50, 1 connection | 1.26 | 0.07 | ms |
| Home page, uncompressed | CPU per request | 1.05 | 0.15 | ms |
| Contact form island (`/?kay_island=0`) | Requests per second | | 8,990 to 9,867 | req/s |
| Contact form island | CPU per request, body sent | | 0.21 ms, 1.1 KB br | |
| Partner page | Requests per second | 3,249 to 4,034 | 3,679 to 3,923 | req/s |
| Legal notice | Requests per second | 3,938 to 5,029 | 4,402 to 4,509 | req/s |
| 404 page | Requests per second | 4,035 to 5,044 | 3,944 to 4,618 | req/s |
| Short pages (partner, legal, 404) | CPU per request | 0.24 to 0.30 | 0.32 to 0.37 | ms |
| Hero image, WebP | Requests per second | 39,956 to 40,708 | 39,731 to 43,252 | req/s |
| Hero image, AVIF | Requests per second | 40,293 to 45,705 | 42,733 to 45,473 | req/s |
| Health check | Requests per second | 51,968 to 60,803 | 69,484 to 74,641 | req/s |
| Cold start to first 200 | Median of 15 spawns | 20.9 | 25.8 | ms |
| RSS after start | | 36 | 61 | MiB |
| RSS peak, home page load | | 134 | 85 | MiB |

- **Home page:** kay serves it from memory, as any prerendered page, so it serves at over 18 times SvelteKit's rate for about a 37th of its CPU per request. The spread between rounds comes from oha needing about as much CPU as the server at that rate, so quote it as over 14k. Only the contact form is rendered per visitor, fetched by the browser about a screen before it scrolls into view: page and form together cost about 0.25 ms of CPU against SvelteKit's 1.63 ms.
- **Short pages** are still rendered per request and carry the inlined stylesheet: they serve at about SvelteKit's rate, for 1.2 to 1.3 times its CPU per request.
- **Health check:** kay's answers on `/_kay/health`, SvelteKit's on `/healthz`.
- On images, SvelteKit serves static files, while kay serves resized variants through an image route.

## Build and deploy
Tool: hyperfine. Cold runs cleared caches (`.svelte-kit` and `node_modules/.cache`, or `.kay`): 3 runs. Warm runs kept the caches: 1 warmup and 5 runs.

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Build, cold caches (`vite build` / `kay build --compile`) | 3.68 | 2.38 | s |
| Build, warm caches | 1.66 | 0.78 | s |
| Server code, Bun runtime left out | 14.5 (`build/` + production `node_modules`) | 8.9 (executable minus an empty program compiled the same way, 91.0 MB) | MB |
| Docker image | 228 (oven/bun:canary) | 184 (debian slim + one executable) | MB |
| Docker image, gzipped (`docker save \| gzip -1`) | 112 | 86 | MB |

- kay's build now includes prerendering the home page.
- The kay executable with the Bun runtime is 99.9 MB. SvelteKit's server code was not measured again.

## Lines of code
Tool: cloc 2.10 on `git archive` of each commit, without `static/`, `public/` and `bun.lock`. `.kay` files were counted with C-style comments, which is how they're written. Comments and blank lines are excluded.

| Area | SvelteKit | kay | Unit |
|---|---|---|---|
| Application (src/, plus SvelteKit's adapter/) | 2,087 | 1,604 | lines |
| Components (.svelte / .kay) | 1,032 (22 files) | 883 (24 files) | lines |
| TypeScript and JavaScript | 616 | 317 | lines |
| CSS | 410 | 404 | lines |
| Tests | 714 | 822 | lines |
| Config and tooling | 236 | 164 | lines |
| Total | 3,037 | 2,590 | lines |

Counted at kay 1.12.0's commit (`03a118f`), not counted again since.

## Earlier sittings
Kept for what the shipped config no longer shows; compare them within their own sitting only.
- **Linked styles, server (sitting 4, kay 1.16.6, `cd24483`, every page rendered per request):** linked short pages served at 1.8 to 2.2 times SvelteKit's rate (8.3k to 9.2k req/s), about twice the inlined rate, as inlined pages splice the stylesheet on the main thread while linked ones compress on the thread pool. The home page rendered per request served at 2.0 times SvelteKit inlined (1,487 req/s) and 2.4 times linked (1,772).
- **Server island modes (sitting 5, kay 1.17.1, uncommitted, babelraid issue #12):** with the contact form marked `server` instead of `server="defer"`, the page is prerendered and the form rendered per request and spliced in, sent as gzip with `Cache-Control: private, no-store`: 4.0k to 5.0k req/s, 5 to 8 times SvelteKit, at 0.37 ms of CPU. With no mark, the whole page rendered per request served at 1.3k to 1.4k req/s.
- **Earlier releases, inlined short pages:** kay 1.16.0 served them at 1.8k to 2.2k req/s for 1.1 to 1.3 ms of CPU each, kay 1.16.3 at 2.1k to 2.2k req/s for 0.49 to 0.54 ms, kay 1.16.5 at 4.0k to 4.6k req/s for 0.31 to 0.35 ms, each in its own sitting.

## Left out or to treat with care
- Absolute server numbers: loopback on one desktop. Quote the ratios.
- Comparisons of paint figures across sittings, and older kay versions' figures (1.10.x to 1.12.0).
- The SvelteKit desktop home page whole-page weight moved between sittings (655 KB in one, 432 KB in another, lazy images loading differently). Only the phone weights are stable.
- Memory: kay holds 1.7 times SvelteKit's RSS at rest; its peak under home page load is lower, since that page is served from memory. The bytecode accounts for about 3 MiB of the resting gap; the rest was not traced.
- Cold start: SvelteKit's moved from 20.9 to 31 ms across sittings 4 to 6, so read the 5 ms gap as noise.
