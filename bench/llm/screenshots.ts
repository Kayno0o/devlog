// Screenshots the books page kay's agent built, from its passing run of median cost, as books.jpg and books-dark.jpg for the post.
// The site's own styles are swapped for screenshot.css in the devlog's colors: every agent builds the same page, so one shot stands for all four.
// bun bench/llm/screenshots.ts <label>, once no benchmark is running, since it serves the graded build
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { chromium } from 'playwright-core'
import { freePort, startSite } from './lib/site'
import { benchDir } from './lib/workspace'

interface Result {
  framework: string
  run: number
  metrics: { costUsd?: number }
  grade: { passed: boolean }
  workspace: string
}

const label = process.argv[2]

if (label === undefined) {
  throw new Error('usage: bun bench/llm/screenshots.ts <label>')
}

const resultsDir = join(benchDir, 'results', label)
const outDir = join(benchDir, '../../public/llm-bench')
const colorToken = /--color-[\w-]+:[^;]+;/g
const tokens = (await Bun.file(join(benchDir, '../../src/app.css')).text()).match(colorToken) ?? []
const stylesheet = `:root { ${tokens.join(' ')} }\n${await Bun.file(join(benchDir, 'screenshot.css')).text()}`
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

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
const site = await startSite(join(shown.workspace, 'site'), freePort(4900))

try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 640 } })

  await page.goto(`${site.url}/books`, { waitUntil: 'networkidle' })
  await page.$$eval('link[rel="stylesheet"], style', (nodes) => {
    for (const node of nodes) {
      node.remove()
    }
  })
  await page.addStyleTag({ content: stylesheet })

  for (const [scheme, suffix] of [['light', ''], ['dark', '-dark']] as const) {
    await page.emulateMedia({ colorScheme: scheme })
    await page.screenshot({ path: join(outDir, `books${suffix}.jpg`), type: 'jpeg', quality: 80 })
  }

  console.log(`books.jpg: kay-${shown.run}, $${(shown.metrics.costUsd ?? 0).toFixed(2)}`)
}
finally {
  await site.stop()
  await browser.close()
}
