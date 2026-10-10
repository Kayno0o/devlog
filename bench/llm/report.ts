// Sums up one benchmark label: results/<label>/results.md for people, summary.json for the post's charts.
// bun bench/llm/report.ts <label>, or a results directory
import type { Grade } from './lib/grade'
import type { RunMetrics, Tokens } from './lib/metrics'
import type { Diff } from './lib/workspace'
import { homedir } from 'node:os'
import { basename, join } from 'node:path'
import process from 'node:process'

interface Result {
  framework: string
  run: number
  startedAt: string
  requested: { model: string, effort: string, budgetUsd: number, minutes: number }
  versions: Record<string, string>
  session?: { timedOut: boolean, wallMs?: number }
  sandbox?: string[]
  metrics: RunMetrics
  diff: Diff
  grade: Grade
  docs?: { source: string, revision?: string, files: number, bytes?: number }
}

interface Spread {
  median: number
  min: number
  max: number
}

const argument = process.argv[2]

if (argument === undefined || argument === '') {
  throw new Error('usage: bun bench/llm/report.ts <label | directory>')
}

const dir = argument.includes('/') ? argument : join(import.meta.dir, 'results', argument)
const label = basename(dir)
const results: Result[] = []

for await (const file of new Bun.Glob('*-*.json').scan(dir)) {
  if (file !== 'summary.json') {
    results.push(await Bun.file(join(dir, file)).json() as Result)
  }
}

if (results.length === 0) {
  throw new Error(`no results in ${dir}`)
}

function spread(values: number[]): Spread | undefined {
  if (values.length === 0) {
    return undefined
  }

  const sorted = values.toSorted((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 === 1 ? sorted[middle] ?? 0 : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2

  return { median, min: sorted[0] ?? 0, max: sorted.at(-1) ?? 0 }
}

// Each measure read off one run; only runs that passed count toward them
// a killed session has no result line, so the runner's own clock comes first
const wallMs = (r: Result): number => r.session?.wallMs ?? r.metrics.durationMs
const total = (r: Result): number => r.metrics.tokens.input + r.metrics.tokens.cacheCreation + r.metrics.tokens.cacheRead + r.metrics.tokens.output
const measures: Record<string, { group: string, title: string, read: (result: Result) => number, digits: number }> = {
  inputTokens: { group: 'Tokens', title: 'Input tokens, uncached', read: r => r.metrics.tokens.input, digits: 0 },
  cacheWriteTokens: { group: 'Tokens', title: 'Cache write tokens', read: r => r.metrics.tokens.cacheCreation, digits: 0 },
  cacheReadTokens: { group: 'Tokens', title: 'Cache read tokens', read: r => r.metrics.tokens.cacheRead, digits: 0 },
  outputTokens: { group: 'Tokens', title: 'Output tokens', read: r => r.metrics.tokens.output, digits: 0 },
  thinkingTokens: { group: 'Tokens', title: 'Thinking tokens, part of output', read: r => r.metrics.thinkingTokens, digits: 0 },
  totalTokens: { group: 'Tokens', title: 'All tokens', read: total, digits: 0 },
  peakContextTokens: { group: 'Tokens', title: 'Largest context of one call', read: r => r.metrics.peakContextTokens, digits: 0 },
  costUsd: { group: 'Tokens', title: 'Cost (USD, API prices)', read: r => r.metrics.costUsd, digits: 2 },
  minutes: { group: 'Time', title: 'Wall time (minutes)', read: r => wallMs(r) / 60_000, digits: 1 },
  apiMinutes: { group: 'Time', title: 'Time waiting on the API (minutes)', read: r => r.metrics.durationApiMs / 60_000, digits: 1 },
  turns: { group: 'Agent', title: 'Turns', read: r => r.metrics.turns, digits: 0 },
  apiCalls: { group: 'Agent', title: 'API calls', read: r => r.metrics.apiCalls, digits: 0 },
  toolCalls: { group: 'Agent', title: 'Tool calls', read: r => Object.values(r.metrics.toolCalls).reduce((sum, count) => sum + count, 0), digits: 0 },
  toolRead: { group: 'Agent', title: 'Read calls', read: r => r.metrics.toolCalls.Read ?? 0, digits: 0 },
  toolWrite: { group: 'Agent', title: 'Write calls', read: r => r.metrics.toolCalls.Write ?? 0, digits: 0 },
  toolEdit: { group: 'Agent', title: 'Edit calls', read: r => r.metrics.toolCalls.Edit ?? 0, digits: 0 },
  toolBash: { group: 'Agent', title: 'Bash calls', read: r => r.metrics.toolCalls.Bash ?? 0, digits: 0 },
  toolGlob: { group: 'Agent', title: 'Glob calls', read: r => r.metrics.toolCalls.Glob ?? 0, digits: 0 },
  toolGrep: { group: 'Agent', title: 'Grep calls', read: r => r.metrics.toolCalls.Grep ?? 0, digits: 0 },
  toolErrors: { group: 'Agent', title: 'Tool calls that failed', read: r => r.metrics.toolErrors, digits: 0 },
  docsCalls: { group: 'Docs', title: 'Tool calls reading the docs', read: r => r.metrics.docs.calls, digits: 0 },
  docsChars: { group: 'Docs', title: 'Docs characters read', read: r => r.metrics.docs.chars, digits: 0 },
  checkRuns: { group: 'Checks', title: 'Checks and builds run', read: r => r.metrics.checkRuns.length, digits: 0 },
  failedCheckRuns: { group: 'Checks', title: 'Checks and builds that failed', read: r => r.metrics.checkRuns.filter(run => run.failed).length, digits: 0 },
  checkErrors: { group: 'Checks', title: 'Check errors hit on the way', read: r => r.metrics.checkErrors, digits: 0 },
  filesChanged: { group: 'Code', title: 'Files written or changed', read: r => r.diff.files, digits: 0 },
  linesWritten: { group: 'Code', title: 'Lines added, tests and styles left out', read: r => r.diff.added - (r.diff.testLines ?? 0) - (r.diff.styleLines ?? 0), digits: 0 },
  testLines: { group: 'Code', title: 'Test lines added', read: r => r.diff.testLines ?? 0, digits: 0 },
  styleLines: { group: 'Code', title: 'Style lines added', read: r => r.diff.styleLines ?? 0, digits: 0 },
  linesRemoved: { group: 'Code', title: 'Lines removed', read: r => r.diff.removed, digits: 0 },
  packagesAdded: { group: 'Code', title: 'Packages added', read: r => r.diff.dependenciesAdded.length, digits: 0 },
}

const inputKinds = ['input', 'cacheCreation', 'cacheRead'] as const satisfies (keyof Tokens)[]

const known = ['kay', 'sveltekit', 'solidstart', 'astro']
const frameworks = [...new Set(results.map(result => result.framework))].toSorted((a, b) => known.indexOf(a) - known.indexOf(b))
const summary = {
  label,
  model: results[0]?.metrics.model,
  requested: results[0]?.requested,
  claude: results[0]?.versions.claude,
  from: results.map(result => result.startedAt).toSorted()[0],
  to: results.map(result => result.startedAt).toSorted().at(-1),
  frameworks: Object.fromEntries(frameworks.map((framework) => {
    const runs = results.filter(result => result.framework === framework).toSorted((a, b) => a.run - b.run)
    const passed = runs.filter(result => result.grade.passed)

    return [framework, {
      runs: runs.length,
      passed: passed.length,
      versions: runs[0]?.versions,
      dependenciesAdded: [...new Set(runs.flatMap(result => result.diff.dependenciesAdded))].toSorted(),
      // what every run cost, failed ones included, since a framework that fails often costs more than its passing median shows
      spent: {
        costUsd: runs.reduce((sum, result) => sum + result.metrics.costUsd, 0),
        totalTokens: runs.reduce((sum, result) => sum + total(result), 0),
        minutes: runs.reduce((sum, result) => sum + wallMs(result), 0) / 60_000,
      },
      measures: Object.fromEntries(Object.entries(measures).map(([key, measure]) => [key, spread(passed.map(measure.read))])),
      failures: runs.filter(result => !result.grade.passed).map(result => ({ run: result.run, outcome: result.session?.timedOut === true ? 'timed out' : result.metrics.outcome, check: result.grade.check.ok, build: result.grade.build.ok, failures: result.grade.acceptance.failures })),
    }]
  })),
}

await Bun.write(join(dir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`)

function number(value: number, digits: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

function format(value: Spread | undefined, digits: number): string {
  return value ? `${number(value.median, digits)} (${number(value.min, digits)} to ${number(value.max, digits)})` : 'no passing run'
}

function header(first: string, columns: string[]): string[] {
  return [`| ${first} | ${columns.join(' | ')} |`, `| --- | ${columns.map(() => '---:').join(' | ')} |`]
}

const groups = [...new Set(Object.values(measures).map(measure => measure.group))]
const runColumns = ['outputTokens', 'inputTokens', 'cacheWriteTokens', 'cacheReadTokens', 'costUsd', 'minutes', 'turns', 'toolCalls', 'checkErrors', 'linesWritten']

// A command's first line, enough to tell what it did; the result files keep it whole
function firstLine(command: string): string {
  const end = command.indexOf('\n')
  const line = end === -1 ? command : command.slice(0, end)

  return line.length > 100 || end !== -1 ? `${line.slice(0, 100)}...` : line
}

// What each session loaded besides its tools, and every call that left the workspace or used the network
function isolation(): string[] {
  const mcp = results.filter(result => result.metrics.loaded.mcpServers.length > 0)
  const plugins = [...new Set(results.flatMap(result => result.metrics.loaded.plugins))]
  const outside = results.filter(result => result.metrics.outside.length > 0)
  const configChanged = results.filter(result => result.diff.gradingConfigChanged.length > 0)
  const differs = (a: Tokens, b: Tokens): boolean => inputKinds.some(key => Math.abs(a[key] - b[key]) > 0.01 * Math.max(1, b[key]))
  const mismatched = results.filter(result => result.metrics.resultTokens !== undefined && differs(result.metrics.tokens, result.metrics.resultTokens))
  const undercounted = results.filter(result => !result.metrics.outputExact)
  const otherRuntimes = results.filter(result => result.metrics.otherRuntimes.length > 0)
  const cut = results.filter(result => result.metrics.skippedLines > 0)
  const unsandboxed = results.filter(result => result.sandbox === undefined)
  const masked = [...new Set(results.flatMap(result => result.sandbox ?? []))].map(path => path.replace(homedir(), '~'))

  return [
    unsandboxed.length === 0
      ? `- Each agent ran under bwrap, which hid ${masked.map(path => `\`${path}\``).join(', ')}: the acceptance suite and reference site, other runs' sites, past Claude transcripts and any browser to test with.`
      : `- Runs without the bwrap sandbox, so able to read the acceptance suite, other runs' sites and the grader's browser: ${unsandboxed.map(result => `${result.framework} ${result.run}`).join(', ')}`,
    mcp.length === 0
      ? '- No session started an MCP server.'
      : `- Sessions that started MCP servers: ${mcp.map(result => `${result.framework} ${result.run} (${result.metrics.loaded.mcpServers.join(', ')})`).join('; ')}`,
    // a session lists the machine's plugins at start whether or not they run; --safe-mode keeps their hooks, skills and servers off
    ...plugins.length === 0 ? [] : [`- Plugins installed on the machine, listed by each session at start and kept off by \`--safe-mode\`: ${plugins.join(', ')}`],
    outside.length === 0
      ? '- No tool call left the workspace or used the network beyond package installs.'
      : `- Tool calls outside the workspace or on the network: ${outside.map(result => `${result.framework} ${result.run}: ${result.metrics.outside.map(call => `\`${firstLine(call)}\``).join(', ')}`).join('. ')}`,
    otherRuntimes.length === 0
      ? '- Every agent ran its commands with bun alone.'
      : `- Bash calls running python, node or another package manager despite the prompt: ${otherRuntimes.map(result => `${result.framework} ${result.run} (${result.metrics.otherRuntimes.length})`).join(', ')}`,
    configChanged.length === 0
      ? '- No agent changed its package.json scripts or tsconfig.json.'
      : `- Grading inputs an agent changed, worth reading before trusting its check: ${configChanged.map(result => `${result.framework} ${result.run} (${result.diff.gradingConfigChanged.join(', ')})`).join('; ')}`,
    mismatched.length === 0
      ? '- Input and cache tokens summed per API call match the totals each finished session reported.'
      : `- Input and cache tokens summed per API call differ from the session's own totals by more than 1%: ${mismatched.map(result => `${result.framework} ${result.run}`).join(', ')}`,
    ...undercounted.length === 0 ? [] : [`- Sessions that never reported their totals, their output tokens undercounted: ${undercounted.map(result => `${result.framework} ${result.run}`).join(', ')}`],
    ...cut.length === 0 ? [] : [`- Transcripts cut short, their last line skipped: ${cut.map(result => `${result.framework} ${result.run}`).join(', ')}`],
  ]
}

const lines = [
  `# LLM benchmark, ${label}`,
  '',
  `Each run is one headless Claude Code session (\`claude -p --safe-mode\`, no CLAUDE.md, hooks, plugins or MCP servers) building [the same site](../../spec.md) from [the same prompt](../../prompt.md) in a fresh copy of the framework's starter, with the framework's docs offline in \`docs/\`. A run passes when \`bun run check\`, \`bun run build\` and every test of the hidden [acceptance suite](../../acceptance/site.test.ts) pass. \`check\` is each starter's own script: kay's \`kay check --deny-warnings\` also fails on warnings, the others' (\`svelte-check\`, \`tsc --noEmit\`, \`astro check\`) on errors only.`,
  '',
  `Model ${summary.model}, effort ${summary.requested?.effort}, Claude Code ${summary.claude}, runs from ${summary.from} to ${summary.to}. Every measure is the median of the runs that passed, with the lowest and highest in brackets. Input tokens, cache writes and cache reads are what the model read; output tokens, thinking included, what it wrote.`,
  '',
  ...header('Runs', frameworks),
  `| Passed | ${frameworks.map(framework => `${summary.frameworks[framework]?.passed} of ${summary.frameworks[framework]?.runs}`).join(' | ')} |`,
  `| Cost of every run, failed ones included (USD) | ${frameworks.map(framework => number(summary.frameworks[framework]?.spent.costUsd ?? 0, 2)).join(' | ')} |`,
  `| Tokens of every run | ${frameworks.map(framework => number(summary.frameworks[framework]?.spent.totalTokens ?? 0, 0)).join(' | ')} |`,
  `| Minutes of every run | ${frameworks.map(framework => number(summary.frameworks[framework]?.spent.minutes ?? 0, 0)).join(' | ')} |`,
  '',
  ...groups.flatMap(group => [
    `## ${group}`,
    '',
    ...header('Measure', frameworks),
    ...Object.entries(measures).filter(([, measure]) => measure.group === group).map(([key, measure]) =>
      `| ${measure.title} | ${frameworks.map(framework => format(summary.frameworks[framework]?.measures[key], measure.digits)).join(' | ')} |`),
    '',
  ]),
  '## Every run',
  '',
  ...header('Run', ['Passed', ...runColumns.map(key => measures[key]?.title ?? key)]),
  ...results.toSorted((a, b) => a.framework.localeCompare(b.framework) || a.run - b.run).map(result =>
    `| ${result.framework} ${result.run} | ${result.grade.passed ? 'yes' : 'no'} | ${runColumns.map(key => number(measures[key]?.read(result) ?? 0, measures[key]?.digits ?? 0)).join(' | ')} |`),
  '',
  '## Versions and docs',
  '',
  ...frameworks.map((framework) => {
    const docs = results.find(result => result.framework === framework)?.docs

    return `- ${framework}: ${Object.entries(summary.frameworks[framework]?.versions ?? {}).map(([name, version]) => `${name} ${version}`).join(', ')}; docs: ${docs ? `${docs.source}${docs.revision === undefined ? '' : ` at ${docs.revision.slice(0, 7)}`}, ${docs.files} files${docs.bytes === undefined ? '' : `, ${number(docs.bytes / 1_000_000, 1)} MB`}` : 'unknown'}; packages added by an agent: ${(summary.frameworks[framework]?.dependenciesAdded ?? []).join(', ') || 'none'}`
  }),
  '',
  '## Isolation',
  '',
  ...isolation(),
  '',
  '## Failed runs',
  '',
  ...frameworks.flatMap(framework => (summary.frameworks[framework]?.failures ?? []).map(failure =>
    `- ${framework} run ${failure.run}: ${failure.outcome}, check ${failure.check ? 'ok' : 'failed'}, build ${failure.build ? 'ok' : 'failed'}${failure.failures.length > 0 ? `, failing: ${failure.failures.join('; ')}` : ''}`)),
  '',
]

await Bun.write(join(dir, 'results.md'), lines.join('\n'))
console.log(`wrote ${join(dir, 'results.md')} and summary.json`)
