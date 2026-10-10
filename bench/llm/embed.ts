// Exports the site kay's agent built, from its passing run of median cost, as static files under public/llm-bench/bookshelf/, for the post to show in an iframe.
// A static export needs four changes to the agent's code, which the post lists: a base path, a prerender list for the book pages, a contact page saying its form is left out, since its action needs a server, and bookshelf.css for the devlog's colors.
// bun bench/llm/embed.ts <label>, once no benchmark is running, since it copies a graded workspace
import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { benchDir, run } from './lib/workspace'

interface Result {
  run: number
  metrics: { costUsd?: number }
  grade: { passed: boolean }
  workspace: string
}

const base = '/llm-bench/bookshelf'
const label = process.argv[2]

if (label === undefined) {
  throw new Error('usage: bun bench/llm/embed.ts <label>')
}

const resultsDir = join(benchDir, 'results', label)
const runs: Result[] = []

for await (const file of new Bun.Glob('kay-*.json').scan(resultsDir)) {
  const result = await Bun.file(join(resultsDir, file)).json() as Result

  if (result.grade.passed) {
    runs.push(result)
  }
}

const sorted = runs.toSorted((a, b) => (a.metrics.costUsd ?? 0) - (b.metrics.costUsd ?? 0))
// the lower middle on an even count, so the run shown is one that happened
const shown = sorted[Math.floor((sorted.length - 1) / 2)]

if (shown === undefined) {
  throw new Error(`no passing kay run in ${resultsDir}`)
}

const site = join(homedir(), '.cache', 'llm-bench', 'embed', 'site')
const outDir = join(benchDir, '../../public', base)

rmSync(site, { recursive: true, force: true })
const source = join(shown.workspace, 'site')
// the run's own build outputs and tests stay behind, not the dist folders of its packages; its tests would import the contact page
const builds = new Set([join(source, 'dist'), join(source, '.kay'), join(source, 'tests')])

cpSync(source, site, { recursive: true, filter: path => !builds.has(path) })

async function patch(path: string, edit: (text: string) => string): Promise<void> {
  const file = join(site, path)
  const before = await Bun.file(file).text()
  const after = edit(before)

  if (after === before) {
    throw new Error(`${path} did not take the patch`)
  }

  await Bun.write(file, after)
}

const contentDir = ['src/content/books', 'content/books'].find(dir => existsSync(join(site, dir)))

if (contentDir === undefined) {
  throw new Error('no books folder in the run')
}

const slugs = readdirSync(join(site, contentDir)).filter(name => name.endsWith('.md')).map(name => ({ slug: name.slice(0, -3) }))

await patch('kay.config.ts', text => text.replace('defineConfig({', () => `defineConfig({\n  base: '${base}',`))
await patch('src/routes/books/[slug].kay', text => text.replace('--- server\n', () => `--- server\nexport const prerender = ${JSON.stringify(slugs)}\n`))
// a stylesheet is imported from a component script, the fence with no `server`
await patch('src/routes/_layout.kay', text => text.startsWith('---\n') ? `---\nimport '../bookshelf.css'\n${text.slice(4)}` : `---\nimport '../bookshelf.css'\n---\n${text}`)
// the form's components import its action, so they go with it
for await (const path of new Bun.Glob('src/**/*.kay').scan(site)) {
  if ((await Bun.file(join(site, path)).text()).includes('routes/contact.kay')) {
    rmSync(join(site, path))
  }
}

await Bun.write(join(site, 'src/routes/contact.kay'), 'head\n  title Contact\nh1 Contact\np The contact form sends its message to a server, which this static copy has none of, so it is left out here.\n')

const colorToken = /--color-[\w-]+:[^;]+;/g
const tokens = (await Bun.file(join(benchDir, '../../src/app.css')).text()).match(colorToken) ?? []

await Bun.write(join(site, 'src/bookshelf.css'), `:root { ${tokens.join(' ')} }\n${await Bun.file(join(benchDir, 'bookshelf.css')).text()}`)

// kay's static export reads a collection's folder against the project root, not against content.config.ts as the server does (kayjs#182)
if (contentDir !== 'content/books') {
  cpSync(join(site, contentDir), join(site, 'content/books'), { recursive: true })
}

const build = await run(['bunx', 'kay', 'build', '--static'], site)

if (build.code !== 0) {
  throw new Error(`the static build failed:\n${build.output}`)
}

rmSync(outDir, { recursive: true, force: true })
cpSync(join(site, 'dist'), outDir, { recursive: true })
console.log(`${base}: kay-${shown.run}, $${(shown.metrics.costUsd ?? 0).toFixed(2)}`)
