---
title: "One site, built by a coding agent in every framework"
description: "How I measure what a web framework costs a coding agent: one spec, a hidden test suite, sandboxed headless runs, and what came out for kay, SvelteKit, SolidStart and Astro."
date: 2026-10-16
tags: [kay, benchmarks, llm]
draft: true
---

The [kay post](/posts/introducing-kay) gives this benchmark one section and four charts. This post is the rest: how a run works, what keeps it honest, and the measures that did not fit there.

The question is simple: when a coding agent builds a site, what does the framework cost it? Tokens, time, turns, docs read, check errors, lines of code. A framework an agent writes cheaply and correctly is one I can hand work to, and kay is meant to be one.

## The site

Every run builds Bookshelf, a small catalog of classic books, from one spec that only changes the framework's name:

- 8 books as Markdown files with a frontmatter, read as a content collection, each rendered on its own page.
- A books list with a tag filter that runs in the browser, and a favorite button whose state survives a reload in `localStorage`.
- A contact form checked on the server and in the browser, which also works with JavaScript turned off.
- A shared layout, an about page, and a real 404 with its status code.

Every text the tests look for is given word for word, so a run cannot fail on a typo of mine, only on its own. Styling is free and not graded.

## The hidden tests

A run is graded by a Playwright suite the agent never sees: 11 tests driving headless Chromium, run once per page or book where it applies. They check the layout and its current link, the top rated books in order, the list and its filter, every book page, favorites across a reload, the form with and without JavaScript, and the 404.

A suite is only as good as what it was proven against, so it also runs against a reference site built with Bun alone, no framework at all. If the reference fails, the suite is wrong, not the frameworks.

## The starters and their docs

Each run starts from the framework's own scaffolder, as minimal as it gets while still having a server for the form: `kay new --template blank --with server`, `sv create --template minimal` with the Node adapter, SolidStart 2's `basic`, `create-astro --template minimal` with the Node adapter. I only touch their scripts, so that `bun run check`, `bun run build` and `bun run start` mean the same thing everywhere. Each `check` stays the starter's own: kay's fails on warnings too, the others' on errors only.

The docs sit offline in the project, since the sandbox has no network. They differ in kind as much as in size: kay's are the `llms.txt` and topic files its package ships, 0.2 MB in 18 files. SvelteKit's and SolidStart's are the pages their `llms.txt` links, 3.4 and 0.8 MB. Astro dropped its `llms.txt`, so its docs are the Markdown source of its site, 3.0 MB in 424 files.

Docs matter more for kay than for anyone else: the model already knows the other three, while everything it knows about kay comes from those 18 files.

## Keeping the runs apart

Each run is one headless Claude Code session, `claude -p --safe-mode`: no project instructions, no hooks, no plugins, no MCP servers, and an empty config directory of its own. It runs under bubblewrap, which hides my workspace, my Claude config and transcripts, the other runs, the reference site and the test browsers, with a private `/tmp` and process list. So the agent cannot peek at the tests, copy a previous run, or check its work in a browser: `check`, the build and its own reasoning are all it has.

Once the agent stops, the grader runs `bun run check` and `bun run build`, starts the site with `bun run start` on a given port, and runs the suite against it. A run passes when all three pass.

Runs alternate between frameworks, in a rotated order, so a slow hour on the API lands on everyone alike. The report also lists what the grade does not catch: every framework's agents reached for `node` or `python` a few times despite the prompt asking for Bun only, and every SvelteKit run edited its `start` script, a grading input worth reading before trusting the result.

## Probe first

A full sitting is 5 runs per framework, so a mistake in the harness costs 20 runs. Each change starts with a probe instead: one run of one framework under a throwaway label, its results and transcript read, then the next framework. A probe costs about a dollar: $0.79 to $1.27 for the first round of all four, $0.83 to $1.71 for kay's.

<Stats items={[{"value":"20 of 20","label":"runs passing every check and test"},{"value":"$27.81","label":"the whole sitting, 20 runs at API prices"}]} />

## Results

Time, lines written, cost and docs read are charted in the [kay post](/posts/introducing-kay). Here are the rest, the median run of each framework with the lowest and highest beside it.

### What kay gains

<BarChart title="Thinking tokens" unit="K tokens" better="lower" digits={1} rows={[{"label":"kay","value":2.8,"range":[2.2,4.4]},{"label":"Astro","value":4.3,"range":[3.5,5.7]},{"label":"SvelteKit","value":8.5,"range":[8,13.4]},{"label":"SolidStart","value":11.5,"range":[9.7,15.6]}]} bench="llm" />

The model thinks least in kay: a third less than in Astro, three to four times less than in SvelteKit and SolidStart.

<Stats items={[{"value":"76 vs 0","label":"lines of tests written, kay against the others"}]} />

kay's agents wrote their own tests in every run, where no other framework's agent wrote one. Those lines are left out of every line count, so they cost kay in tokens and earn it nothing in the charts.

### What kay loses

<BarChart title="Turns" unit="turns" better="lower" digits={0} rows={[{"label":"Astro","value":24,"range":[21,31]},{"label":"kay","value":29,"range":[25,31]},{"label":"SvelteKit","value":40,"range":[30,51]},{"label":"SolidStart","value":53,"range":[45,74]}]} bench="llm" />

<BarChart title="Largest context of one call" unit="K tokens" better="lower" digits={1} rows={[{"label":"Astro","value":45,"range":[43.1,58.9]},{"label":"kay","value":61.7,"range":[58.7,70]},{"label":"SvelteKit","value":80.1,"range":[73.7,106.6]},{"label":"SolidStart","value":91.7,"range":[84.7,114.1]}]} bench="llm" />

Astro gets there in fewer turns with a smaller context. Learning kay from its docs costs reads, and every call after them carries them along: kay's context peaks about a third above Astro's, still well under SvelteKit's and SolidStart's.

<Note title="How it was measured">

Claude Opus 5.5 at high effort, Claude Code 2.1.289, kay 1.27.0, SvelteKit 3.0.1, SolidStart 2.0.6, Astro 7.3.8, all on Bun, 5 runs each, kay's a few hours after the others. Every figure is the median of the passing runs, and all 20 passed. Cost is at API prices, as Claude Code reports it, failed runs included. The spec, the prompt, the starters, the suite and every run are in [bench/llm](https://github.com/Kayno0o/devlog/blob/main/bench/llm/results/full-opus-1.27/results.md).

</Note>
