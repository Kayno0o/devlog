// Prints the Stats and BarChart lines of the post's "Built for LLMs too" section from one label's summary.json.
// bun bench/llm/post.ts <label>
import { join } from 'node:path'
import process from 'node:process'
import { benchDir } from './lib/workspace'

interface Spread {
  median: number
}

interface Summary {
  model: string
  requested: { effort: string }
  to: string
  frameworks: Record<string, { runs: number, passed: number, measures: Record<string, Spread> }>
}

const label = process.argv[2]

if (label === undefined) {
  throw new Error('usage: bun bench/llm/post.ts <label>')
}

const summary = await Bun.file(join(benchDir, 'results', label, 'summary.json')).json() as Summary
// claude-opus-5-5 reads Opus 5.5.
const modelId = /^claude-(\w+)-(\d+)-(\d+)$/
const names: Record<string, string> = { kay: 'kay', sveltekit: 'SvelteKit', solidstart: 'SolidStart', astro: 'Astro' }
const frameworks = Object.entries(summary.frameworks)
const median = (framework: string, key: string): number => summary.frameworks[framework]?.measures[key]?.median ?? 0
const runs = frameworks.reduce((sum, [, framework]) => sum + framework.runs, 0)
const passed = frameworks.reduce((sum, [, framework]) => sum + framework.passed, 0)
const model = summary.model.replace(modelId, (_, family: string, major: string, minor: string) => `${family[0]?.toUpperCase()}${family.slice(1)} ${major}.${minor}`)
const source = `LLM benchmark, ${model}, effort ${summary.requested.effort}, median of the passing runs, ${summary.to.slice(0, 10)}`

function chart(title: string, unit: string, key: string, digits: number, { scale = 1, lowerIsBetter = true } = {}): string {
  const rows = frameworks.map(([framework]) => ({ label: names[framework] ?? framework, value: Number((median(framework, key) / scale).toFixed(digits)) })).toSorted((a, b) => a.value - b.value)

  return `<BarChart title="${title}" unit="${unit}" ${lowerIsBetter ? 'better="lower" ' : ''}highlight="kay" digits={${digits}} rows={${JSON.stringify(rows)}} source="${source}" />`
}

const stats = [
  { value: `${passed} of ${runs}`, label: 'runs passing every check and test' },
  { value: `${median('kay', 'minutes').toFixed(1)} min`, label: 'kay, time to build the site' },
  { value: String(median('kay', 'linesWritten')), label: 'kay, lines of code for the site' },
]

console.log([
  `<Stats items={${JSON.stringify(stats)}} />`,
  chart('Time to build the site', 'min', 'minutes', 1),
  chart('Lines of code written, tests left out', 'lines', 'linesWritten', 0),
  chart('Cost of the site, API prices', 'USD', 'costUsd', 2),
  chart('Docs read', 'K characters', 'docsChars', 0, { scale: 1000, lowerIsBetter: false }),
].join('\n\n'))
