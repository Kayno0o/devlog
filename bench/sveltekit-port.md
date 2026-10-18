# SvelteKit to kay port: benchmark data

A real site ported from SvelteKit to kay: a home page and content pages (the partner page below).

## Conditions (apply to everything below unless a row says otherwise)
- **SvelteKit:** commit `c860ae5`, served by `bun build/index.ts` through the site's own Bun adapter. Pages are gzip only; static assets are precompressed br.
- **kay:** kay 1.53.3, commit `ab1cde1`, the shipped config: `inlineStyles: true`, the home page prerendered with its contact form as a deferred server island (`server="defer"`), and `site` read from `SITE_URL` at runtime. The build keeps the partner and legal pages (kayjs#1037, #1047, #1048), so every page but the 404 is served from memory; the 404 is rendered per request.
- **Bun:** 1.4.3 stable (`1.4.3+c6da4a4d3`) for both versions, the kay executable's embedded runtime included (checked with `BUN_BE_BUN=1 ./server --revision`). Sitting 11 ran 1.4.4 canary. kay is built by calling its CLI with that Bun: the site's `package.json` scripts put npm's `bun` 1.4.2 first on the path, installed as the Tailwind plugin's peer, so kay's builds and executable in sittings before 8 ran on Bun 1.4.2.
- **Machine:** one desktop, Ryzen 5 7600 (12 threads), Linux. Everything runs over loopback, so absolute figures are optimistic and only the ratios carry over.
- **Date:** 18 Oct 2026, every section in one sitting (sitting 12), both versions interleaved. Figures from different sittings should not be compared, since paints drift 50 ms or more and memory a few MiB.
- **Background load:** the other projects on the machine held their tests, builds and benches for the whole sitting; load 1.2 at the start, 1.3 to 4.0 during. The machine had 14 GB in swap throughout, and an Ollama model loaded (about a minute of swapping) just before the run.

## Web Vitals (browser)
Tool: the repo's `tests-e2e/perf.e2e.ts` (Playwright, Chromium), throttled through CDP with Lighthouse presets: slow 4G and 4x CPU for phones (Pixel 7), cable for desktop (1600x900). Cache disabled, page scrolled to the end. 3 rounds alternating between versions; each figure is the median of the 3, in ms.

| Page, device | Metric | SvelteKit | kay |
|---|---|---|---|
| Partner page, phone | First paint | 748 | 364 |
| Partner page, phone | Largest paint | 1,200 | 800 |
| Partner page, small phone (360 px) | First paint | 760 | 376 |
| Partner page, small phone | Largest paint | 1,200 | 780 |
| Partner page, laptop | First paint | 196 | 192 |
| Partner page, desktop | First paint | 192 | 196 |
| Home page, phone | First paint = largest paint | 888 | 504 |
| Home page, small phone | First paint = largest paint | 920 | 556 |
| Home page, laptop | First paint | 264 | 224 |
| Home page, laptop | Largest paint | 348 | 272 |
| Home page, desktop | First paint | 272 | 220 |
| Home page, desktop | Largest paint | 356 | 276 |

- Layout shift is at most 0.0020 on kay (the home page on phones) and 0.0005 on SvelteKit. Both are well under the 0.1 "good" threshold. The partner page's 0.011 shift on kay in sitting 11 is gone (0.0000 on both).
- The partner page on desktop and laptop is level, within 4 ms either way, where sitting 11 had kay 12 to 16 ms behind.
- **Partner page largest paint:** in sitting 11, the logo it paints last arrived after kay's runtime script, 14.8 KB brotli, and painted at 852 ms on a phone. On kay 1.17.4, before that script grew, it painted at 736 ms (sitting 6).
- TTFB is not reported, since CDP throttling leaves Navigation Timing's `responseStart` unthrottled.
- **Honest note:** the phone paints need `inlineStyles`, which is opt-in. On kay 1.14.0 (sitting 2), with the stylesheet linked as kay does by default, kay's phone first paint was 85 to 140 ms behind SvelteKit, because its stylesheet downloads alongside the fonts, scripts and logos. Inlining costs about 2 KB more per page and no stylesheet caching between pages.

## Page weight (what a phone downloads, Chromium transfer sizes)

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Home page, whole page after scrolling | 706 | 547 | KB |
| Home page, first view before scrolling | 262 | 183 | KB |
| Home page requests | 65 (70 on desktop) | 30 | requests |
| Partner page, whole | 138 | 88 | KB |
| Partner page requests | 27 | 10 | requests |

- Most of the home page saving is images: kay serves AVIF q50 by `Accept`, at the width drawn.

## Client build, brotli sizes, not gzip

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Client JavaScript, all files, brotli | 70.1 (19 files) | 47.4 (23 files) | KB |
| Client JavaScript a page loads, brotli | | 14.4 (partner page, 4 files), 32.2 (home page, 8 files) | KB |
| Client CSS, brotli | 13.0 | 8.2 | KB |
| Font files | 231 (9 woff2) | 90 (3 woff2) | KB |
| Image files | 3.06 | 2.76 (1.97 WebP, 0.79 AVIF) | MB |

SvelteKit's client JavaScript was not measured again: `c860ae5` has not changed since sitting 1.

- **kay's client JavaScript:** 16.6 KB in 8 files on kay 1.17.4 (sitting 6), 46.1 KB in 33 on 1.31.0 (sitting 10), 35.9 KB in 15 on 1.37.6 (sitting 11) and 47.4 KB in 23 on 1.53.3. The drop on 1.37 likely came from kay 1.37.2 building no browser chunk for a static component whose imports reach no island, not bisected. The growth on 1.53.3, and the CSS shrinking from 13.9 to 8.2 KB, were not traced.
- **kay's runtime script**, loaded by every page with an island, went from 9.5 KB brotli on 1.17.4 to 13.3 on 1.18.0, 14.4 on 1.28.0, 14.6 on 1.30.0 and 1.31.0, and 14.8 on 1.37.6; it was not measured on 1.53.3.

**HTML per request, as each server sends it to a browser** (not the same encoding):

| Page | SvelteKit | kay | Unit |
|---|---|---|---|
| Home page | 16.9 gzip, rendered per request | 28.5 br, prerendered | KB |
| Partner page | 4.1 gzip | 14.1 br, kept by the build | KB |

- kay's HTML carries the stylesheet inlined, so it is not fetched separately.
- Built without a site, as here, the home page is rendered again at boot once `SITE_URL` is known. For about the first 2 s after boot it went out as a quickly compressed 34.3 KB br copy, then as the 28.5 KB one, recompressed in the background at the build's levels. The 28.5 KB was measured in sitting 7 on kay 1.24.4, the 34.3 KB copy in sitting 11.

## Server
Tool: oha 1.16 in Docker on the host network, `accept-encoding: gzip, deflate, br, zstd`. Latency is the p50 over 1,000 requests on one connection. Throughput is 10 s at 64 connections, after 300 warmup requests. CPU and RSS come from `/proc`. Two rounds alternating both servers; figures are the range over the rounds, or a single value where they agree.

| Endpoint | Metric | SvelteKit | kay | Unit |
|---|---|---|---|---|
| Home page | Requests per second | 779 to 781 | 40,040 to 40,741 | req/s |
| Home page | CPU per request | 1.59 to 1.60 | 0.024 | ms |
| Home page | TTFB p50, 1 connection | 1.22 to 1.23 | 0.06 | ms |
| Home page, uncompressed | CPU per request | 0.97 | 0.10 | ms |
| Contact form island (`/?kay_island=0`) | Requests per second | | 6,781 to 6,853 | req/s |
| Contact form island | CPU per request, body sent | | 0.16 ms, 1.3 KB zstd | |
| Partner page | Requests per second | 4,170 to 4,202 | 39,862 to 40,678 | req/s |
| Partner page | CPU per request | 0.27 | 0.023 | ms |
| Legal notice | Requests per second | 5,067 to 5,169 | 39,629 to 41,356 | req/s |
| 404 page | Requests per second | 5,038 to 5,153 | 7,009 to 7,069 | req/s |
| 404 page | CPU per request | 0.22 | 0.17 | ms |
| Hero image, WebP | Requests per second | 41,449 to 41,475 | 51,306 to 51,814 | req/s |
| Hero image, AVIF | Requests per second | 45,724 to 46,013 | 53,487 to 54,203 | req/s |
| Health check | Requests per second | 63,129 to 63,310 | 68,340 to 68,750 | req/s |
| Cold start to first 200 | Median of 15 spawns | 19.9 to 20.1 | 26.4 to 26.6 | ms |
| RSS after start | | 38 | 53 to 54 | MiB |
| RSS peak, home page load | | 131 to 133 | 85 | MiB |

- **Home page:** kay serves it from memory, as any prerendered page, so it serves at about 51 to 52 times SvelteKit's rate, for about a 66th of its CPU per request. Only the contact form is rendered per visitor, fetched by the browser about a screen before it scrolls into view: page and form together cost about 0.18 ms of CPU against SvelteKit's 1.6 ms.
- **Partner and legal pages:** kept by the build since kay 1.53.3, so served from memory like the home page, at 9.5 to 9.8 times SvelteKit's rate for the partner page and 7.7 to 8.2 for the legal notice, for about a twelfth of its CPU per request. In sitting 11, rendered per request, they were level with SvelteKit.
- **404 page:** still rendered per request, at 1.36 to 1.39 times SvelteKit's rate in the same round (0.89 to 0.95 in sitting 11).
- **Gzip only** (`accept-encoding: gzip`): kay serves the home page at 38,832 req/s and the partner page at 39,898, against SvelteKit's 782 and 4,081.
- **Contact form island:** sent as zstd now that oha offers it, 6.8k req/s at 0.16 ms of CPU, where sitting 11 measured 8.7k at 0.20 ms with 1.1 KB br.
- **Health check:** kay's answers on `/_kay/health`, SvelteKit's on `/healthz`.
- On images, SvelteKit serves static files, while kay serves resized variants through an image route, here at 1.24 to 1.25 times SvelteKit's rate for WebP and 1.17 to 1.18 for AVIF. Sitting 11 measured 1.06 to 1.13 and 1.05 to 1.07, and sitting 10, on a busier machine, 53.3k to 54.2k (WebP) and 58.9k to 60.0k req/s (AVIF), 1.3 to 1.5 times SvelteKit's (kayjs#301).

## Build and deploy
Tool: hyperfine. Cold runs cleared caches (`.svelte-kit` and `node_modules/.cache`, or `.kay`): 3 runs. Warm runs kept the caches: 1 warmup and 5 runs. Figures are medians.

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Build, cold caches (`vite build` / `kay build --compile`) | 4.19 (4.00 to 6.53) | 2.98 | s |
| Build, warm caches | 1.91 | 1.39 | s |
| Server code, Bun runtime left out | 14.5 (`build/` + production `node_modules`) | 21.8 (executable minus an empty program compiled the same way, 90.8 MB) | MB |
| Docker image | 246 (oven/bun) | 197 (debian slim + one executable) | MB |
| Docker image, gzipped (`docker save \| gzip -1`) | 122 | 96 | MB |

- kay's build includes prerendering the home page and keeping the partner and legal pages.
- **Warm builds are slower than in sitting 11** (1.74 s for SvelteKit, 1.13 for kay), by 10 and 23%; not traced, between Bun 1.4.3 stable against 1.4.4 canary and the swap-heavy machine.
- **Bun 1.4.4 builds kay more slowly (sitting 8):** the same tree built warm in 0.85 s on Bun 1.4.2 and 1.09 s on 1.4.4, about 28% slower; kay 1.24.4 took 0.83 s on 1.4.2 (sitting 7).
- **Docker images** grew on both sides since sitting 11 (229 and 186 MB), as the base images moved.
- **kay's server code:** the client build (2.9 MB in sitting 11, 3.2 on kay 1.31.0), `public/` (4.0 MB), the prerendered page (0.3 MB) and the AVIF encoder's WebAssembly (3.5 MB), the rest about 10 MB of code and bytecode; none of these was measured again in this sitting. The kay executable with the Bun runtime is 112.6 MB, 111.8 on kay 1.37.6. SvelteKit's server code was not measured again.
- **Correction:** sittings 6 and 7 gave kay's server code as 8.9 and 9.6 MB. Those subtracted an empty program compiled on Bun 1.4.3 (91.0 MB) from an executable carrying Bun 1.4.2, whose empty program weighs 81.3 MB. Like for like, sitting 7's was 19.3 MB.

## Lines of code
Tool: cloc 2.10 (`--force-lang=C,kay`) on `git archive` of each commit, without `static/`, `public/` and `bun.lock`. `.kay` files were counted with C-style comments, which is how they're written. Comments and blank lines are excluded.

| Area | SvelteKit | kay | Unit |
|---|---|---|---|
| Application (src/, plus SvelteKit's adapter/) | 2,087 | 1,500 | lines |
| Components (.svelte / .kay) | 1,032 (22 files) | 854 (25 files) | lines |
| TypeScript and JavaScript | 616 | 242 | lines |
| CSS | 410 | 404 | lines |
| Tests | 714 | 842 | lines |
| Config and tooling | 236 | 168 | lines |
| Total | 3,037 | 2,510 | lines |

Counted at kay 1.53.3's commit (`ab1cde1`). Since `06c8739` (kay 1.37.6, sitting 11) the kay side lost 3 component lines and 2 of config.
- **Correction:** sitting 10 gave kay's components as 883 lines, application 1,531, total 2,543. Those counted the 24 `//` comment lines in `.kay` files as code; with them excluded, as the tool line above says, `56e5d18` counts 859, 1,507 and 2,519.

## Dev server
`vite dev` (SvelteKit `c860ae5`) against `kay dev` (kay 1.53.3, commit `ab1cde1`), each run from a scratch copy of its commit on its own port, two rounds alternating the two. Browser: headless Chromium, 1280x800, unthrottled over loopback, the site's own CSP enforced. Figures are medians, with the range in brackets.

| Metric | SvelteKit | kay | Unit |
|---|---|---|---|
| Startup to first 200, caches cleared (`.svelte-kit` and `node_modules/.vite`, or `.kay`) | 1,017 (923 to 1,112) | 1,351 (1,330 to 1,373) | ms |
| Startup to first 200, warm (10 launches) | 513 (467 to 578) | 344 (336 to 350) | ms |
| Startup to the home page's first 200, warm | 1,497 (1,435 to 1,716) | 364 (359 to 372) | ms |
| First load of the home page, fresh server and browser (load event) | 1,681 (1,639 to 1,724) | 120 (119 to 121) | ms |
| Requests for it | 166 | 26 | requests |
| First load of the partner page (load event) | 735 (729 to 741) | 65 (64 to 67) | ms |
| Requests for it | 84 | 21 | requests |
| Template edit to screen (14 edits) | 33 (32 to 52) | 42 (40 to 122) | ms |
| Style edit to screen | 34 (32 to 43) | 67 (62 to 77) | ms |
| Server code edit to screen | never by itself; 87 (84 to 187) from a manual reload | 56 (53 to 64) | ms |
| Page state kept through the edit (template / style / server) | 14 / 14 / 0 of 14 | 14 / 14 / 14 of 14 | edits |
| Scroll position kept (template / style / server) | 12 / 14 / 14 of 14 | 13 / 14 / 14 of 14 | edits |
| Memory at rest, PSS (RSS) of the process tree | 397 (420), 1 process | 258 (383), 4 processes | MiB |
| Memory after 21 edits, PSS (RSS) | 479 (503) | 361 (490) | MiB |

- **Edits:** the partner page is open with a marker set on `window` and scrolled 300 px. One edit a kind in turn, 7 rounds, each timed from the file write to the moment the page shows it, checked after every DOM mutation and every task. The template edit changes a link's text, the style edit a rule appended to `app.css`, the server code edit a value the page's server code returns (a `--- server` fence in kay, `+page.server.ts` in SvelteKit), only in the copies.
- **SvelteKit's server code edits:** Vite reloads nothing when `+page.server.ts` changes, so after 10 s the page was reloaded by hand and the time from that reload is given; the marker is lost each time.
- **kay's edits:** the running server takes a page edit in instead of restarting, so template and server code edits reach the screen about 6 and 5 times sooner than on kay 1.37.3 (257 and 258 ms, when each edit restarted the server); style edits take 67 ms, from 96.
- **Startup:** kay's cold startup is slower than on kay 1.37.3 (1,040 ms) and its warm startup faster (555 ms).
- **SvelteKit's cold home page** varied from 2,051 to 9,904 ms over the two cold runs.
- **Memory:** kay runs `kay dev`, the server, the spare and the client builder it keeps as four processes, whose RSS counts shared pages several times, so PSS is the fair figure.
- **First load:** Vite serves each module on its own (166 requests for the home page); kay serves a bundled client (26).
- **Harness fix:** a first pass bypassed the CSP in the browser, under which kay up to 1.34.0 opened one more live-reload connection per edit and stalled after six (kayjs#275, fixed in 1.35.0). With the site's CSP, as a developer's browser has it, kay is unaffected; the figures above come from that.

## Earlier sittings
Kept for what the shipped config no longer shows; compare them within their own sitting only.
- **kay 1.37.6 on Bun 1.4.4 canary (sitting 11, `06c8739`):** the partner, legal and 404 pages rendered per request served at 0.89 to 1.02 times SvelteKit's rate (3.9k to 4.8k req/s) for 1.1 to 1.2 times its CPU per request (0.25 to 0.31 ms), the partner page sent as 20.7 KB gzip around a stylesheet deflated once at start; the home page at 35.7k to 35.9k req/s, 47 times SvelteKit, for 0.028 to 0.029 ms of CPU; client JavaScript 35.9 KB brotli in 15 files and CSS 13.9 KB; warm build 1.13 s.
- **kay dev on kay 1.37.3 (sitting 11, `d468a60`):** a page edit restarted the server (147 to 199 ms by kay's log, kept warm by a spare process), so template and server code edits reached the screen in 257 and 258 ms, style edits in 96 without a restart; startup 1,040 ms with cold caches and 555 warm, 251 MiB PSS at rest and 333 after 21 edits.
- **kay 1.31.0 (sitting 10, `56e5d18`, a job queue on the machine using about one core in bursts):** client JavaScript 46.1 KB brotli in 33 files, the hero image served at 53.3k to 54.2k req/s (WebP) and 58.9k to 60.0k (AVIF), 1.3 to 1.5 times SvelteKit's; the other figures within noise of sitting 11's.
- **kay dev on kay 1.32.0 (`d3c09e6`, earlier the same day):** startup to first 200 in 666 ms with cold caches and 382 warm, edits shown in about 360 ms each since a stylesheet edit restarted the server too, 167 MiB PSS at rest in 3 processes and 213 after 21 edits; SvelteKit measured 1,273 cold and 447 warm in that sitting.
- **Linked styles, server (sitting 4, kay 1.16.6, `cd24483`, every page rendered per request):** linked short pages served at 1.8 to 2.2 times SvelteKit's rate (8.3k to 9.2k req/s), about twice the inlined rate, as inlined pages splice the stylesheet on the main thread while linked ones compress on the thread pool. The home page rendered per request served at 2.0 times SvelteKit inlined (1,487 req/s) and 2.4 times linked (1,772).
- **Server island modes (sitting 5, kay 1.17.1, uncommitted):** with the contact form marked `server` instead of `server="defer"`, the page is prerendered and the form rendered per request and spliced in, sent as gzip with `Cache-Control: private, no-store`: 4.0k to 5.0k req/s, 5 to 8 times SvelteKit, at 0.37 ms of CPU. With no mark, the whole page rendered per request served at 1.3k to 1.4k req/s.
- **Earlier releases, inlined short pages:** kay 1.16.0 served them at 1.8k to 2.2k req/s for 1.1 to 1.3 ms of CPU each, kay 1.16.3 at 2.1k to 2.2k req/s for 0.49 to 0.54 ms, kay 1.16.5 at 4.0k to 4.6k req/s for 0.31 to 0.35 ms, each in its own sitting.
- **kay 1.17.4 (sitting 6, `92090dd`):** before kay 1.18.0 grew the runtime script, the partner page weighed 94 KB in 7 requests and painted its largest element at 736 ms on a phone, against SvelteKit's 1,204 ms.
- **kay 1.24.4 on Bun 1.4.2 (sitting 7, `018dc38`):** home page 31.9k req/s at 0.030 ms of CPU, RSS 60 MiB at rest, cold build 2.48 s and warm 0.83 s.
- **kay 1.28.0 (sitting 8, `53b3fd4`, Bun `1.4.4-canary.1+71d0d4399`):** every figure within noise of sitting 9's; the runtime script was 14.4 KB brotli and the partner page's JavaScript 15.8 KB.
- **kay 1.30.0 (sitting 9, `ed1ec8f`, quieter machine):** every figure within noise of sitting 10's; home page 37.5k to 37.7k req/s at 0.027 to 0.028 ms of CPU, short pages 0.89 to 1.09 times SvelteKit's rate.

## Left out or to treat with care
- Absolute server numbers: loopback on one desktop. Quote the ratios.
- Comparisons of paint figures across sittings, and older kay versions' figures (1.10.x to 1.12.0).
- The SvelteKit desktop home page whole-page weight moved between sittings (655 KB in one, 432 KB in another, lazy images loading differently). Only the phone weights are stable.
- Memory: kay holds 1.4 times SvelteKit's RSS at rest; its peak under home page load is lower, since that page is served from memory. The bytecode accounts for about 3 MiB of the resting gap; the rest was not traced.
- Cold start: SvelteKit's moved from 19.9 to 31 ms across sittings 4 to 12, more than the 6 to 7 ms gap here.
- The Docker images compile and install inside Docker with the image's own Bun, which was not checked, so they only compare sizes.
