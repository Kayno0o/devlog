# SvelteKit to kay port: benchmark data

A real site ported from SvelteKit to kay: a home page and content pages (the partner page below).

## Conditions (apply to everything below unless a row says otherwise)
- **SvelteKit:** commit `c860ae5`, served by `bun build/index.ts` through the site's own Bun adapter. Pages are gzip only; static assets are precompressed br.
- **kay:** the site on kay 1.13.0 (commit `c7e6417`) for build and size. Browser figures also on kay 1.14.0 with `inlineStyles: true` (commit `21d681f`, which the site has shipped since). Server figures on kay 1.16.6 (commit `cd24483`), inlined and linked.
- **Machine:** one desktop, Ryzen 5 7600 (12 threads), Linux, Bun 1.4.3 canary. Everything runs over loopback, so absolute figures are optimistic and only the ratios carry over.
- **Date:** 9 Oct 2026, and 10 Oct for the server. Both versions were measured in the same sitting, interleaved; figures from different sittings should not be compared, since paints drift 50 ms or more and memory a few MiB.

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

## Server (sitting 4, kay 1.16.6, inlined and linked styles)
Tool: oha 1.16 in Docker on the host network, `accept-encoding: gzip, deflate, br, zstd`. Latency is the p50 over 1,000 requests on one connection. Throughput is 10 s at 64 connections, after 300 warmup requests. CPU and RSS come from `/proc`. Every page is rendered per request on all three, with no prerendering. The same kay 1.16.6 build (commit `cd24483`) was compiled once with `inlineStyles: true` and once without. Two rounds alternating the three servers; each figure is the mean of both. Round 2 ran on a busier machine (SvelteKit's health check fell from 62k to 48k req/s), so compare within this table only.

| Endpoint | Metric | SvelteKit | kay inlined | kay linked | Unit |
|---|---|---|---|---|---|
| Home page | Body sent | 16.9 gzip | 34.8 gzip | 17.5 br | KB |
| Home page | Requests per second | 730 | 1,487 | 1,772 | req/s |
| Home page | CPU per request | 1.69 | 1.47 | 1.38 | ms |
| Home page | TTFB p50, 1 connection | 1.31 | 1.36 | 1.09 | ms |
| Partner page | Requests per second | 3,826 | 3,699 | 8,314 | req/s |
| Legal notice | Requests per second | 4,828 | 4,401 | 9,117 | req/s |
| 404 page | Requests per second | 5,088 | 4,456 | 9,156 | req/s |
| Short pages (partner, legal, 404) | Body sent | 2.7 to 4.1 gzip | 19.4 to 20.6 gzip | 3.1 to 4.3 br | KB |
| Short pages | CPU per request | 0.22 to 0.29 | 0.32 to 0.38 | 0.25 to 0.30 | ms |
| Short pages | TTFB p50, 1 connection | 0.21 to 0.28 | 0.20 to 0.23 | 0.24 to 0.31 | ms |
| Short pages | p50 under 64 connections | 12 to 16 | 14 to 17 | 6.7 to 7.5 | ms |
| Hero image, WebP | Requests per second | 39,204 | 39,871 | 40,890 | req/s |
| Hero image, AVIF | Requests per second | 41,699 | 44,142 | 41,235 | req/s |
| Health check | Requests per second | 55,098 | 70,823 | 63,448 | req/s |
| Cold start to first 200 | Median of 15 spawns, mean of both rounds | 22.8 | 27.0 | 24.4 | ms |
| RSS after start | | 36 | 58 | 57 | MiB |
| RSS peak over the load run | | 134 | 212 | 190 | MiB |

- **Home page:** kay serves it at 2.0 times SvelteKit's rate inlined and 2.4 times linked, for 13 to 18% less CPU per request. kay 1.16.6 streams a page of 15 KB or more once zlib's threads have compressed it, working around the slow post-await replies that Bun pull request [oven-sh/bun#41341](https://github.com/oven-sh/bun/pull/41341) fixes; on 1.16.5 the home page served 1,112 req/s inlined and 1,163 linked.
- **Inlined short pages** serve at 0.88 to 0.97 times SvelteKit's rate and about half the linked rate, at 1.3 to 1.5 times SvelteKit's CPU per request: each response carries the 13.9 KB stylesheet. Under load the inlined process tops out at about 137% CPU against about 240% linked, which reads as the stylesheet splice running on the main thread while linked pages compress on the thread pool. Not profiled.
- **Linked short pages** serve at 1.8 to 2.2 times SvelteKit's rate, at 1.05 to 1.15 times its CPU per request (brotli against SvelteKit's gzip).
- **Inlined bodies are gzip:** since kay 1.16.3, an inlined page is compressed around a stylesheet deflated once at start, so a brotli browser gets gzip.
- **Earlier releases, inlined:** kay 1.16.0 served short pages at 1.8k to 2.2k req/s for 1.1 to 1.3 ms of CPU each, kay 1.16.3 at 2.1k to 2.2k req/s for 0.49 to 0.54 ms, kay 1.16.5 at 4.0k to 4.6k req/s for 0.31 to 0.35 ms, each in its own sitting.
- The health check's kay figures differ by 7k req/s between two builds of the same code, so read that row as noise around 1.1 to 1.3 times SvelteKit.
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
- Memory: kay holds about 1.6 times SvelteKit's RSS at rest and 1.4 to 1.6 times at peak. The bytecode accounts for about 3 MiB; the rest was not traced.
