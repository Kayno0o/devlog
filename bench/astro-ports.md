# Two sites, Astro against kay

Measured with kay's sites bench (`bun run bench:sites` in kayjs, the sites given by a local config), the sites left unnamed.

- AMD Ryzen 5 7600 6-Core Processor, 12 threads
- Bun 1.4.4, Chromium 151.0.7922.34 headless, nginx/1.30.5
- cattery: Astro at fd11fb0, kay 1.28.0 at fc40908
- painter: Astro at 6b8c6e5, kay 1.28.0 at 3c73384
- run on 2026-10-10, both sides in one sitting. Both sites serve their contact form as a deferred server island, so every page they list is prerendered but the cattery's home page. The Astro commits pin a lint package since pruned from the registry, so the bench installs them without it; it plays no part in their build.

cattery and painter as they last ran on Astro, then on kay, each built and served as it deploys: Astro's standalone server under Bun, kay's one executable, both behind an nginx set up as production's (HTTP/2 over TLS, brotli and gzip at level 6). kay is the version each site pins, not this checkout.

## What a page downloads

Average over every page: text as brotli at quality 11 sends it, images as served at each viewport (desktop 1280 px at 1x, phone 390 px at 3x), and the fonts the stylesheets can load for Latin text.

|  | cattery astro | cattery kay | painter astro | painter kay |
| --- | --- | --- | --- | --- |
| HTML | 4.7 KB | 5.1 KB | 6.4 KB | 6.9 KB |
| CSS | 35.2 KB | 5.3 KB | 9.3 KB | 6.8 KB |
| JS | 5.2 KB | 13.1 KB | 0.4 KB | 13.1 KB |
| JS files | 1.0 | 4.0 | 0.0 | 5.0 |
| images, desktop | 142.5 KB | 55.2 KB | 160.8 KB | 36.4 KB |
| images, phone | 142.5 KB | 114.5 KB | 185.3 KB | 105.2 KB |
| fonts | 109.5 KB | 109.5 KB | 35.2 KB | 106.6 KB |

Inline `<script>` bodies count as JS, weighed as what they add to the page's brotli: Astro inlines the painter's scripts in its pages.

## In a browser

Every page loaded cold, 5 times in a fresh context, medians averaged over the pages, with Lighthouse's throttling: a phone on slow 4G with a 4x slower CPU, and a desktop on cable. Total blocking time counts long tasks from the first paint on.

|  | cattery astro | cattery kay | painter astro | painter kay |
| --- | --- | --- | --- | --- |
| mobile first paint (ms) | 1498 | 1374 | 1302 | 1371 |
| mobile largest paint (ms) | 2734 | 1782 | 1306 | 1374 |
| mobile blocking time (ms) | 0.0 | 0.0 | 0.0 | 0.0 |
| mobile layout shift | 0.005 | 0.006 | 0.002 | 0.018 |
| mobile load (ms) | 3065 | 2716 | 2419 | 2736 |
| mobile transferred | 255.8 KB | 200.5 KB | 126.1 KB | 169.8 KB |
| mobile requests | 10.1 | 13.0 | 6.3 | 15.1 |
| desktop first paint (ms) | 172 | 167 | 163 | 182 |
| desktop largest paint (ms) | 350 | 268 | 212 | 247 |
| desktop blocking time (ms) | 0.0 | 0.0 | 0.0 | 0.0 |
| desktop layout shift | 0.007 | 0.001 | 0.001 | 0.001 |
| desktop load (ms) | 347 | 263 | 296 | 349 |
| desktop transferred | 266.6 KB | 141.3 KB | 207.6 KB | 229.9 KB |
| desktop requests | 11.1 | 12.7 | 7.6 | 16.4 |

## Server

Cold start is from spawning the server to its first 200 on the home page, median of 7. Under load, 32 clients request one URL through nginx for 5 s over keepalive HTTP/1.1, accepting brotli; CPU is per request, of the site's server and of nginx, which compresses what the server sent uncompressed. The client is Bun's fetch, which tops out near 40,000 requests a second.

|  | cattery astro | cattery kay | painter astro | painter kay |
| --- | --- | --- | --- | --- |
| cold start | 105 ms | 30.0 ms | 50.8 ms | 23.2 ms |
| memory once started | 138 MB | 68 MB | 74 MB | 62 MB |
| memory after load (peak) | 281 MB (296 MB) | 144 MB (153 MB) | 125 MB (145 MB) | 95 MB (106 MB) |

|  | URL | req/s | p50 (ms) | p99 (ms) | server CPU (µs/req) | nginx CPU (µs/req) |
| --- | --- | --- | --- | --- | --- | --- |
| cattery astro | `/` | 2166 | 11.5 | 26.3 | 539 | 1441 |
| cattery astro | a content page | 12648 | 1.5 | 9.3 | 91 | 465 |
| cattery astro | `/_astro/index.CA4QUJZR.css` | 3237 | 5.6 | 48.2 | 164 | 2582 |
| cattery kay | `/` | 2950 | 6.9 | 25.8 | 371 | 1575 |
| cattery kay | a content page | 39322 | 0.7 | 1.9 | 23 | 21 |
| cattery kay | `/_kay/_layout-sjxtq4vb.css` | 57867 | 0.5 | 1.4 | 14 | 19 |
| painter astro | `/` | 5633 | 3.3 | 25.4 | 147 | 1265 |
| painter astro | a content page | 11798 | 1.6 | 10.5 | 87 | 538 |
| painter astro | `/_astro/default.fuv9R-in.css` | 7932 | 2.3 | 17.4 | 104 | 871 |
| painter kay | `/` | 38090 | 0.7 | 2.0 | 25 | 22 |
| painter kay | a content page | 39805 | 0.7 | 1.9 | 23 | 21 |
| painter kay | `/_kay/_layout-j8sny4hd.css` | 57987 | 0.5 | 1.4 | 14 | 20 |

## Build and code

Clean builds, median of 3. `kay build` runs `kay check` first, which `astro build` has no equivalent of. Since kay serves AVIF, a clean build encodes every image's AVIF and WebP variants (122 of each on the cattery), which is where its extra time and memory go. Lines are cloc's code lines of `src` and the config files.

|  | command | wall (s) | CPU (s) | peak memory |
| --- | --- | --- | --- | --- |
| cattery astro | `astro build` | 1.94 | 5.0 | 1093 MB |
| cattery kay | `kay build` | 11.33 | 48.6 | 1938 MB |
| cattery kay | `kay build --no-check` | 11.20 | 46.8 | 1882 MB |
| painter astro | `astro build` | 1.62 | 6.5 | 1210 MB |
| painter kay | `kay build` | 7.09 | 32.5 | 1223 MB |
| painter kay | `kay build --no-check` | 6.98 | 29.9 | 1194 MB |

|  | cattery astro | cattery kay | painter astro | painter kay |
| --- | --- | --- | --- | --- |
| lines of code | 1892 | 1282 | 1935 | 1219 |
| lines of tests | 0 | 366 | 0 | 180 |
| deployed | 231 MB (dist and production node_modules) | 109 MB (one executable) | 301 MB (dist and production node_modules) | 98 MB (one executable) |
