# Two sites, Astro against kay

Measured with kay's sites bench (`bun run bench:sites` in kayjs, the sites given by a local config), the sites left unnamed.

- AMD Ryzen 5 7600 6-Core Processor, 12 threads
- Bun 1.4.2, Chromium 151.0.7922.34 headless, nginx/1.30.5
- cattery: Astro at fd11fb0, kay 1.24.4 at 5eafb2b
- painter: Astro at 6b8c6e5, kay 1.24.4 at 4c92660
- run on 2026-10-10, both sides in one sitting. Both sites serve their contact form as a deferred server island, so every page they list is prerendered but the cattery's home page. The Astro commits pin a lint package since pruned from the registry, so the bench installs them without it; it plays no part in their build.

cattery and painter as they last ran on Astro, then on kay, each built and served as it deploys: Astro's standalone server under Bun, kay's one executable, both behind an nginx set up as production's (HTTP/2 over TLS, brotli and gzip at level 6). kay is the version each site pins, not this checkout.

## What a page downloads

Average over every page: text as brotli at quality 11 sends it, images as served at each viewport (desktop 1280 px at 1x, phone 390 px at 3x), and the fonts the stylesheets can load for Latin text.

|  | cattery astro | cattery kay | painter astro | painter kay |
| --- | --- | --- | --- | --- |
| HTML | 4.7 KB | 5.1 KB | 6.4 KB | 6.9 KB |
| CSS | 35.2 KB | 5.3 KB | 9.3 KB | 6.8 KB |
| JS | 5.2 KB | 12.3 KB | 0.4 KB | 12.4 KB |
| JS files | 1.0 | 4.0 | 0.0 | 5.0 |
| images, desktop | 142.5 KB | 55.2 KB | 160.8 KB | 36.4 KB |
| images, phone | 142.5 KB | 114.5 KB | 185.3 KB | 105.2 KB |
| fonts | 109.5 KB | 109.5 KB | 35.2 KB | 106.6 KB |

Inline `<script>` bodies count as JS, weighed as what they add to the page's brotli: Astro inlines the painter's scripts in its pages.

## In a browser

Every page loaded cold, 5 times in a fresh context, medians averaged over the pages, with Lighthouse's throttling: a phone on slow 4G with a 4x slower CPU, and a desktop on cable. Total blocking time counts long tasks from the first paint on.

|  | cattery astro | cattery kay | painter astro | painter kay |
| --- | --- | --- | --- | --- |
| mobile first paint (ms) | 1518 | 1378 | 1305 | 1387 |
| mobile largest paint (ms) | 2755 | 1779 | 1309 | 1389 |
| mobile blocking time (ms) | 0.0 | 0.0 | 0.0 | 0.0 |
| mobile layout shift | 0.006 | 0.006 | 0.002 | 0.018 |
| mobile load (ms) | 3085 | 2722 | 2416 | 2759 |
| mobile transferred | 255.8 KB | 199.8 KB | 126.1 KB | 169.0 KB |
| mobile requests | 10.1 | 13.0 | 6.3 | 15.1 |
| desktop first paint (ms) | 180 | 170 | 164 | 185 |
| desktop largest paint (ms) | 362 | 268 | 208 | 247 |
| desktop blocking time (ms) | 0.0 | 0.0 | 0.0 | 0.0 |
| desktop layout shift | 0.007 | 0.001 | 0.001 | 0.001 |
| desktop load (ms) | 356 | 260 | 297 | 352 |
| desktop transferred | 266.6 KB | 140.5 KB | 207.6 KB | 229.1 KB |
| desktop requests | 11.1 | 12.7 | 7.6 | 16.4 |

## Server

Cold start is from spawning the server to its first 200 on the home page, median of 7. Under load, 32 clients request one URL through nginx for 5 s over keepalive HTTP/1.1, accepting brotli; CPU is per request, of the site's server and of nginx, which compresses what the server sent uncompressed. The client is Bun's fetch, which tops out near 40,000 requests a second.

|  | cattery astro | cattery kay | painter astro | painter kay |
| --- | --- | --- | --- | --- |
| cold start | 130 ms | 33.0 ms | 55.1 ms | 24.1 ms |
| memory once started | 115 MB | 69 MB | 66 MB | 62 MB |
| memory after load (peak) | 231 MB (282 MB) | 138 MB (150 MB) | 133 MB (143 MB) | 95 MB (107 MB) |

|  | URL | req/s | p50 (ms) | p99 (ms) | server CPU (µs/req) | nginx CPU (µs/req) |
| --- | --- | --- | --- | --- | --- | --- |
| cattery astro | `/` | 1883 | 13.7 | 34.7 | 610 | 1539 |
| cattery astro | a content page | 10938 | 1.7 | 10.5 | 98 | 479 |
| cattery astro | `/_astro/index.CA4QUJZR.css` | 2703 | 7.1 | 51.8 | 185 | 2771 |
| cattery kay | `/` | 2688 | 7.7 | 29.8 | 395 | 1704 |
| cattery kay | a content page | 33047 | 0.9 | 2.5 | 27 | 22 |
| cattery kay | `/_kay/_layout-sjxtq4vb.css` | 50134 | 0.6 | 1.9 | 15 | 22 |
| painter astro | `/` | 4089 | 4.3 | 33.0 | 179 | 1314 |
| painter astro | a content page | 10058 | 1.7 | 11.4 | 97 | 548 |
| painter astro | `/_astro/default.fuv9R-in.css` | 6664 | 2.5 | 19.8 | 113 | 889 |
| painter kay | `/` | 37341 | 0.7 | 2.2 | 25 | 23 |
| painter kay | a content page | 35088 | 0.8 | 2.3 | 26 | 23 |
| painter kay | `/_kay/_layout-j8sny4hd.css` | 53339 | 0.5 | 1.7 | 15 | 21 |

## Build and code

Clean builds, median of 3. `kay build` runs `kay check` first, which `astro build` has no equivalent of. Since kay serves AVIF, a clean build encodes every image's AVIF and WebP variants (122 of each on the cattery), which is where its extra time and memory go. Lines are cloc's code lines of `src` and the config files.

|  | command | wall (s) | CPU (s) | peak memory |
| --- | --- | --- | --- | --- |
| cattery astro | `astro build` | 2.25 | 5.7 | 1074 MB |
| cattery kay | `kay build` | 11.36 | 50.4 | 1848 MB |
| cattery kay | `kay build --no-check` | 13.93 | 53.1 | 1960 MB |
| painter astro | `astro build` | 2.13 | 7.0 | 1133 MB |
| painter kay | `kay build` | 7.64 | 32.7 | 1183 MB |
| painter kay | `kay build --no-check` | 8.36 | 34.5 | 1168 MB |

|  | cattery astro | cattery kay | painter astro | painter kay |
| --- | --- | --- | --- | --- |
| lines of code | 1892 | 1286 | 1935 | 1223 |
| lines of tests | 0 | 366 | 0 | 180 |
| deployed | 231 MB (dist and production node_modules) | 109 MB (one executable) | 301 MB (dist and production node_modules) | 98 MB (one executable) |
