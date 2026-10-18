# Two sites, Astro against kay

Measured with kay's sites bench (`bun run bench:sites` in kayjs, the sites given by a local config), the sites left unnamed.

- AMD Ryzen 5 7600 6-Core Processor, 12 threads
- Bun 1.4.3, Chromium 151.0.7922.34 headless, nginx/1.30.5
- cattery: Astro at fd11fb0, kay 1.54.2 at ea1eac3
- painter: Astro at 6b8c6e5, kay 1.54.2 at 029c318
- run on 2026-10-18, both sides in one sitting. Both sites serve their contact form as a deferred server island, so every page they list is prerendered but the cattery's home page. The Astro commits pin a lint package since pruned from the registry, so the bench installs them without it; it plays no part in their build.

cattery and painter as they last ran on Astro, then on kay, each built and served as it deploys: Astro's standalone server under Bun, kay's one executable, both behind an nginx set up for production (HTTP/2 over TLS, brotli and gzip at level 6). kay is the version each site pins, not this checkout.

## What a page downloads

Average over every page: text as brotli at quality 11 sends it, images as served at each viewport (desktop 1280 px at 1x, phone 390 px at 3x), and the fonts the stylesheets can load for Latin text.

|  | cattery astro | cattery kay | painter astro | painter kay |
| --- | --- | --- | --- | --- |
| HTML | 4.7 KB | 10.4 KB | 6.4 KB | 13.9 KB |
| CSS | 35.2 KB | 0.0 KB | 9.3 KB | 0.0 KB |
| JS | 5.2 KB | 12.3 KB | 0.4 KB | 12.5 KB |
| JS files | 1.0 | 4.0 | 0.0 | 6.0 |
| images, desktop | 142.5 KB | 52.2 KB | 160.8 KB | 36.5 KB |
| images, phone | 142.5 KB | 113.9 KB | 185.3 KB | 105.5 KB |
| fonts | 109.5 KB | 109.5 KB | 35.2 KB | 106.6 KB |

Inline `<script>` bodies count as JS, weighed as what they add to the page's brotli: Astro inlines the painter's scripts in its pages. Inline styles count as HTML: kay inlines each page's styles and links no stylesheet, hence its 0.0 KB of CSS.

## In a browser

Every page loaded cold, 5 times in a fresh context, medians averaged over the pages, with Lighthouse's throttling: a phone on slow 4G with a 4x slower CPU, and a desktop on cable. Total blocking time counts long tasks from the first paint on.

|  | cattery astro | cattery kay | painter astro | painter kay |
| --- | --- | --- | --- | --- |
| mobile first paint (ms) | 1508 | 660 | 1301 | 687 |
| mobile largest paint (ms) | 2452 | 1690 | 1306 | 838 |
| mobile blocking time (ms) | 0.0 | 0.0 | 0.0 | 0.0 |
| mobile layout shift | 0.053 | 0.040 | 0.002 | 0.002 |
| mobile load (ms) | 2928 | 2088 | 2188 | 1965 |
| mobile transferred | 242.5 KB | 182.9 KB | 87.4 KB | 147.4 KB |
| mobile requests | 11.8 | 13.7 | 5.7 | 16.6 |
| desktop first paint (ms) | 175 | 90.2 | 167 | 111 |
| desktop largest paint (ms) | 347 | 221 | 217 | 187 |
| desktop blocking time (ms) | 0.0 | 0.0 | 0.0 | 0.0 |
| desktop layout shift | 0.028 | 0.019 | 0.001 | 0.001 |
| desktop load (ms) | 347 | 207 | 222 | 221 |
| desktop transferred | 268.6 KB | 138.6 KB | 103.8 KB | 156.2 KB |
| desktop requests | 13.1 | 13.7 | 6.7 | 17.6 |

## Server

Cold start is from spawning the server to its first 200 on the home page, median of 7. Under load, 32 clients request one URL through nginx for 5 s over keepalive HTTP/1.1, accepting brotli; CPU is per request, of the site's server and of nginx, which compresses what the server sent uncompressed. The client is Bun's fetch, which tops out near 40,000 requests a second. Memory is proportional (PSS), counting once the pages processes share; its peak is resident (RSS).

|  | cattery astro | cattery kay | painter astro | painter kay |
| --- | --- | --- | --- | --- |
| cold start | 105 ms | 33.4 ms | 50.2 ms | 25.5 ms |
| memory once started | 105 MB | 62 MB | 44 MB | 53 MB |
| memory after load (peak) | 210 MB (304 MB) | 118 MB (165 MB) | 89 MB (131 MB) | 77 MB (89 MB) |

|  | URL | req/s | p50 (ms) | p99 (ms) | server CPU (µs/req) | nginx CPU (µs/req) |
| --- | --- | --- | --- | --- | --- | --- |
| cattery astro | `/` | 2113 | 12.1 | 28.6 | 554 | 1440 |
| cattery astro | a content page | 12829 | 1.6 | 8.8 | 89 | 468 |
| cattery astro | `/_astro/index.CA4QUJZR.css` | 3164 | 6.2 | 47.3 | 171 | 2626 |
| cattery kay | `/` | 2022 | 15.2 | 30.5 | 613 | 36 |
| cattery kay | a content page | 36921 | 0.8 | 2.0 | 24 | 23 |
| painter astro | `/` | 5365 | 2.9 | 26.1 | 148 | 1183 |
| painter astro | a content page | 11049 | 1.5 | 10.6 | 90 | 539 |
| painter astro | `/_astro/default.fuv9R-in.css` | 7488 | 2.1 | 17.4 | 107 | 874 |
| painter kay | `/` | 37378 | 0.7 | 2.1 | 25 | 24 |
| painter kay | a content page | 37009 | 0.8 | 2.1 | 24 | 24 |

## Build and code

Clean builds, median of 3. `kay build` runs `kay check` first, which `astro build` has no equivalent of. Since kay serves AVIF, a clean build encodes every image's AVIF and WebP variants, which is where its extra time and memory go. Lines are cloc's code lines of `src` and the config files.

|  | command | wall (s) | CPU (s) | peak memory |
| --- | --- | --- | --- | --- |
| cattery astro | `astro build` | 2.22 | 5.1 | 986 MB |
| cattery kay | `kay build` | 6.85 | 35.5 | 2016 MB |
| cattery kay | `kay build --no-check` | 7.28 | 33.7 | 1913 MB |
| painter astro | `astro build` | 2.00 | 7.4 | 853 MB |
| painter kay | `kay build` | 3.72 | 21.2 | 1065 MB |
| painter kay | `kay build --no-check` | 3.45 | 18.1 | 1016 MB |

|  | cattery astro | cattery kay | painter astro | painter kay |
| --- | --- | --- | --- | --- |
| lines of code | 1892 | 1270 | 1935 | 1214 |
| lines of tests | 0 | 366 | 0 | 184 |
| deployed | 231 MB (dist and production node_modules) | 121 MB (one executable) | 301 MB (dist and production node_modules) | 110 MB (one executable) |
