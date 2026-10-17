# LLM benchmark

The same site built by a coding agent in kay, SvelteKit, SolidStart, Astro, Nuxt and Next.js, measuring what each framework costs the agent: tokens split into uncached input, cache writes, cache reads and output, time, turns, tool calls, docs read, check errors and code written.

- `spec.md`: the site, identical for every framework, with its books in `content/books/`.
- `prompt.md`: the prompt, identical apart from the framework's name.
- `starters/`: each framework's own starter as its scaffolder wrote it (`kay new --template blank --with server`, the bare preset plus the server the contact form needs, as minimal as the others, `sv create --template minimal` with `adapter-node`, `create-solid` SolidStart 2 `basic`, `create-astro --template minimal` with `@astrojs/node`, `create-nuxt --template minimal` with no modules, `create-next-app --empty` with the App Router and no Tailwind or linter), patched only to share the `check`, `build` and `start` scripts the spec names, plus the `vue-tsc` and TypeScript 6 that Nuxt's `nuxt typecheck` needs (`vue-tsc` fails on TypeScript 7). `bun bench/llm/docs.ts` fetches each one's official docs into its `docs/` (gitignored) and records the source and size in `starters/docs-sources.json`. The docs differ in kind as much as in size: kay's are its package's `llms.txt` pages, SvelteKit's, SolidStart's and Nuxt's the pages their `llms.txt` links, Next.js's the Markdown of the pages its `llms.txt` links (`<page>.md`, where the links point at HTML), Astro's the Markdown source of its site, since it dropped `llms.txt`. Next.js's starter also points the agent at the docs bundled in its package, `node_modules/next/dist/docs/`, through the `AGENTS.md` its scaffolder writes, and reads there count as docs reads. Each `check` is the starter's own, failing on errors only; kay's failed on warnings too until 1.46, whose scaffolder writes plain `kay check`.
- `acceptance/site.test.ts`: the hidden acceptance suite. With no `SITE_URL` it runs against `reference/`, a site built with Bun alone, which is how `bun run test` proves the suite. It needs Playwright's Chromium, and is skipped without it and without `SITE_URL`, as on CI.
- `run.ts`: one headless `claude -p --safe-mode` session per framework and run (no CLAUDE.md, hooks, plugins or MCP servers), in a fresh copy of the starter under `~/.cache/llm-bench/<label>/`, run on the Claude account `account use` made active, as fish's `claude` function does, with an empty `CLAUDE_CONFIG_DIR` of its own (the main account's login lent for the run), and under `bwrap` (bubblewrap, required) with `~/Workspace`, `~/.claude` (settings, plugins, mods, skills, transcripts), `~/.cache/claude-tmp`, the other runs and the Playwright browsers hidden, and a private `/tmp` and process list, so the agent cannot read the acceptance suite, the reference site, past transcripts or another run, nor test in the grader's browser; then graded: `bun run check`, `bun run build`, then the suite against `bun run start`. Runs are interleaved across frameworks, and a run already in `results/<label>/` is skipped, so a stopped benchmark resumes.
- `report.ts`: writes `results/<label>/results.md` and `summary.json` from the run files.
- `post.ts`: prints the Stats and BarChart lines of the post from `summary.json`.
- `embed.ts`: exports the site of kay's passing run of median cost as static files into `public/llm-bench/bookshelf/`, which the post shows in a frame, with the changes a static export needs: a base path, a `prerender` list for the book pages when the run has none, the contact form left out, and `bookshelf.css` in the devlog's colors; run it once no benchmark is running.

## Running it

```sh
bunx playwright-core install chromium
(cd bench/llm/starters/kay && bun install)
bun bench/llm/docs.ts
bun bench/llm/run.ts --frameworks kay --runs 1 --model claude-sonnet-5-5 --budget 5 --label smoke
bun bench/llm/run.ts --runs 5
```

`docs.ts` reads kay's docs from the kay starter's `node_modules`, hence its install first. Ctrl-C stops the benchmark and the running agent; running the same command again resumes it.

Options: `--frameworks` (comma separated), `--runs` (5), `--model` (claude-opus-5-5), `--effort` (high), `--budget` in USD per run (30), `--minutes` per run (90), `--label` (date and model), `--grade-only` to grade the workspaces again without running the agent, keeping what each run recorded.
