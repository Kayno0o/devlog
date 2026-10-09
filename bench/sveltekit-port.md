# SvelteKit to kay port: benchmark data

A real site ported from SvelteKit to kay: a home page and content pages (the partner page below).

## Conditions (apply to everything below unless a row says otherwise)
- **SvelteKit:** commit `c860ae5`, served by `bun build/index.ts` through the site's own Bun adapter. Pages are gzip only; static assets are precompressed br.
- **kay:** the site on kay 1.13.0 (commit `c7e6417`) for build, server and size. Browser figures also on kay 1.14.0 with `inlineStyles: true` (commit `21d681f`, what the site ships now).
- **Machine:** one desktop, Ryzen 5 7600 (12 threads), Linux, Bun 1.4.3 canary. Everything runs over loopback, so absolute figures are optimistic and only the ratios carry over.
- **Date:** 9 Oct 2026. Both versions were measured in the same sitting, interleaved; figures from different sittings should not be compared, since paints drift 50 ms or more and memory a few MiB.

## Web Vitals (browser)
Tool: the repo's `tests-e2e/perf.e2e.ts` (Playwright, Chromium), throttled through CDP with Lighthouse presets: slow 4G and 4x CPU for phones (Pixel 7), cable for desktop (1600x900). Cache disabled, page scrolled to the end. 3 runs per version, in rounds alternating between versions, averaged.

**Sitting 2, kay 1.14.0** (`perf6/`: SvelteKit, kay with `inlineStyles`, kay without, interleaved), in ms:

| Page, device | Metric | SvelteKit | kay 1.14.0 inlined | kay 1.14.0 linked |
|---|---|---|---|---|
| Partner page, phone | First paint | 757 | 407 | 863 |
| Partner page, phone | Largest paint | 1,201 | 723 | 867 |
| Partner page, small phone (360 px) | First paint | 753 | 427 | 844 |
| Partner page, small phone | Largest paint | 1,213 | 729 | 865 |
| Partner page, desktop | First paint | 204 | 208 | 239 |
| Home page, phone | First paint = largest paint | 935 | 565 | 1,076 |
| Home page, small phone | First paint = largest paint | 999 | 659 | 1,023 |
| Home page, desktop | First paint | 304 | 240 | 301 |
| Home page, desktop | Largest paint | 369 | 253 | 305 |

- Layout shift stays below 0.001 on both versions.
- TTFB is not reported, since CDP throttling leaves Navigation Timing's `responseStart` unthrottled.
- **Honest note:** without `inlineStyles` (kay's default), kay's phone first paint is 85 to 140 ms behind SvelteKit, because its stylesheet downloads alongside the fonts, scripts and logos. The option is opt-in, and it costs about 2 KB more per page plus no stylesheet caching between pages.

## Page weight (what a phone downloads, Chromium transfer sizes, sitting 1, kay 1.13.0)

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Home page, whole page after scrolling | 706 | 547 | KB |
| Home page, first view before scrolling | 262 | 185 | KB |
| Home page requests | 65 (70 on desktop) | 25 | requests |
| Partner page, whole | 138 | 92 | KB |
| Partner page requests | 27 | 8 | requests |

- With `inlineStyles` (1.14.0), the home page is 549 KB and the partner page 94 KB.
- Most of the home page saving is images: kay serves AVIF q50 by `Accept`, at the width drawn.

## Client build (sitting 1, kay 1.13.0), brotli sizes, not gzip

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Client JavaScript, all files, brotli | 70.1 (19 files) | 16.1 (7 files) | KB |
| Client CSS, brotli | 13.0 | 13.9 | KB |
| Font files | 231 (9 woff2) | 90 (3 woff2) | KB |
| Image files | 3.06 | 2.71 | MB |

**HTML per request, as each server sends it to a browser** (SvelteKit gzip, kay br; not the same encoding):

| Page | SvelteKit | kay 1.13.0 (linked styles) | kay 1.14.0 with `inlineStyles` | Unit |
|---|---|---|---|---|
| Home page | 16.9 gzip | 17.5 br | 34.1 br (34.7 gzip) | KB |
| Partner page | 4.1 gzip | 4.3 br | 21.0 br (20.6 gzip) | KB |

With `inlineStyles`, the HTML carries the 13.9 KB stylesheet, so it is no longer fetched separately.

## Server (sitting 1, kay 1.13.0 with linked styles)
Tool: oha 1.16 in Docker on the host network, `accept-encoding: gzip, deflate, br, zstd`. Latency is the p50 over 1,000 requests on one connection. Throughput is 10 s at 64 connections, after 300 warmup requests. CPU and RSS come from `/proc`. Every page is rendered per request on both, with no prerendering.

| Endpoint | Metric | SvelteKit | kay | Unit |
|---|---|---|---|---|
| Home page | Requests per second | 778 | 1,241 | req/s |
| Home page | CPU per request | 1.60 | 1.49 | ms |
| Home page | TTFB p50, 1 connection | 1.25 | 1.35 | ms |
| Home page, uncompressed | CPU per request | 1.03 | 0.58 | ms |
| Partner page | Requests per second | 4,231 | 8,591 | req/s |
| Legal notice | Requests per second | 5,202 | 10,235 | req/s |
| 404 page | Requests per second | 5,266 | 9,939 | req/s |
| Short pages (partner, legal, 404) | CPU per request | 0.21 to 0.26 | 0.23 to 0.29 | ms |
| Hero image, WebP | Requests per second | 42,227 | 44,793 | req/s |
| Hero image, AVIF | Requests per second | 45,919 | 46,738 | req/s |
| Health check | Requests per second | 62,597 | 77,701 | req/s |
| Cold start to first 200 | Median of 15 spawns | 23 | 24 | ms |
| RSS after start | | 37 | 59 | MiB |
| RSS peak over the load run | | 130 | 198 | MiB |

- **Stale for the shipped config:** rendered-page throughput and CPU were measured with linked stylesheets. With `inlineStyles`, each page response is 2 to 5 times larger compressed, so per-request compression cost rises. Not measured.
- Short pages cost kay 9 to 11% more CPU per request (brotli against SvelteKit's gzip), though they serve about twice the req/s.
- On images, SvelteKit serves static files, while kay serves resized variants through an image route.

## Build and deploy (sitting 1, kay 1.13.0)
Tool: hyperfine. Cold runs cleared caches (`.svelte-kit` and `node_modules/.cache`, or `.kay`): 3 runs. Warm runs kept the caches: 1 warmup and 5 runs.

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Build, cold caches (`vite build` / `kay build --compile`) | 3.57 | 2.22 | s |
| Build, warm caches | 1.52 | 0.65 | s |
| Server code, Bun runtime left out | 14.5 (`build/` + production `node_modules`) | 8.5 (executable minus an empty program compiled the same way, 91.0 MB) | MB |
| Docker image | 228 (oven/bun:canary) | 184 (debian slim + one executable) | MB |
| Docker image, gzipped (`docker save \| gzip -1`) | 112 | 86 | MB |

- Kay's 8.5 MB holds 3.0 MB of client build, 4.0 MB of `public/`, and 1.5 MB of code and bytecode.
- The kay executable with the Bun runtime is 99.5 MB.

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

Counted at kay 1.12.0's commit (`03a118f`); nothing counted has changed since.

## Left out or to treat with care
- Absolute server numbers: loopback on one desktop. Quote the ratios.
- Comparisons of paint figures across sittings, and older kay versions' figures (1.10.x to 1.12.0).
- The SvelteKit desktop home page whole-page weight moved between sittings (655 KB in one, 432 KB in another, lazy images loading differently). Only the phone weights are stable.
- Memory: kay holds about 1.6 times SvelteKit's RSS at rest and 1.5 times at peak. The bytecode accounts for about 3 MiB; the rest was not traced.
