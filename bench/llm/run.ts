// Runs the LLM benchmark: one headless Claude Code session per framework and run, each in a fresh copy of its starter, graded by the hidden acceptance suite.
// bun bench/llm/run.ts [--frameworks kay,sveltekit,solidstart,astro] [--runs 5] [--model claude-opus-5-5] [--effort high] [--budget 30] [--minutes 90] [--label <name>] [--grade-only]
import { existsSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { parseArgs } from 'node:util'
import { grade } from './lib/grade'
import { parseRun } from './lib/metrics'
import { killGroup } from './lib/site'
import { benchDir, diff, prepare, run, sweep } from './lib/workspace'

const frameworks = {
  kay: { name: 'kay', packages: ['kay'] },
  sveltekit: { name: 'SvelteKit', packages: ['@sveltejs/kit', 'svelte'] },
  solidstart: { name: 'SolidStart', packages: ['@solidjs/start', 'solid-js'] },
  astro: { name: 'Astro', packages: ['astro'] },
}

type Framework = keyof typeof frameworks

const { values } = parseArgs({
  options: {
    'frameworks': { type: 'string', default: Object.keys(frameworks).join(',') },
    'runs': { type: 'string', default: '5' },
    // a full id, so the runs of one label never straddle an alias moving to a newer model
    'model': { type: 'string', default: 'claude-opus-5-5' },
    'effort': { type: 'string', default: 'high' },
    'budget': { type: 'string', default: '30' },
    'minutes': { type: 'string', default: '90' },
    'label': { type: 'string' },
    'grade-only': { type: 'boolean', default: false },
  },
})

const selected = (values.frameworks ?? '').split(',').filter(Boolean) as Framework[]

for (const framework of selected) {
  if (!(framework in frameworks)) {
    throw new Error(`unknown framework ${framework}, expected one of ${Object.keys(frameworks).join(', ')}`)
  }
}
const runs = Number(values.runs)
const label = values.label ?? `${new Date().toISOString().slice(0, 10)}-${values.model}`
const resultsDir = join(benchDir, 'results', label)
const workDir = join(process.env.XDG_CACHE_HOME ?? join(homedir(), '.cache'), 'llm-bench', label)
const prompt = await Bun.file(join(benchDir, 'prompt.md')).text()
const docsSources = await Bun.file(join(benchDir, 'starters/docs-sources.json')).json() as Record<string, unknown>

mkdirSync(resultsDir, { recursive: true })

// The agent gets a clean environment: none of a parent Claude Code session's variables and no PORT of ours, while the ones choosing the account or provider stay
const inherited = /^(?:CLAUDECODE|CLAUDE_PID|CLAUDE_EFFORT|CLAUDE_CODE_|PORT$)/
const provider = /^CLAUDE_CODE_(?:OAUTH_TOKEN|USE_BEDROCK|USE_VERTEX|USE_FOUNDRY)$/
const agentEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => !inherited.test(key) || provider.test(key)))

let running: { pid: number, exited: Promise<number> } | undefined

async function stopRunning(): Promise<never> {
  if (running) {
    await killGroup(running)
  }

  process.exit(130)
}

// setsid puts the agent out of reach of the terminal's Ctrl-C, so stopping the benchmark takes its group down by hand
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    void stopRunning()
  })
}

async function versions(site: string, framework: Framework): Promise<Record<string, string>> {
  const found: Record<string, string> = { bun: Bun.version }

  for (const name of frameworks[framework].packages) {
    const file = Bun.file(join(site, 'node_modules', name, 'package.json'))

    found[name] = await file.exists() ? (await file.json() as { version: string }).version : 'missing'
  }

  return found
}

interface Session {
  exitCode: number
  timedOut: boolean
  /** Measured here rather than read from the transcript, which has no result line when the run was killed. */
  wallMs: number
}

async function agent(framework: Framework, site: string, transcript: string): Promise<Session> {
  const started = performance.now()
  const child = Bun.spawn([
    'setsid',
    'claude',
    '-p',
    prompt.replaceAll('{framework}', frameworks[framework].name),
    '--safe-mode',
    '--strict-mcp-config',
    '--no-session-persistence',
    '--dangerously-skip-permissions',
    '--model',
    values.model ?? 'claude-opus-5-5',
    '--effort',
    values.effort ?? 'high',
    '--max-budget-usd',
    values.budget ?? '30',
    '--tools',
    'Bash,Read,Write,Edit,Glob,Grep',
    '--output-format',
    'stream-json',
    '--verbose',
  ], { cwd: site, env: agentEnv, stdin: 'ignore', stdout: Bun.file(transcript), stderr: 'inherit' })

  running = child
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    void killGroup(child)
  }, Number(values.minutes) * 60_000)
  const exitCode = await child.exited
  const wallMs = Math.round(performance.now() - started)

  clearTimeout(timer)
  // whatever the agent forked and left in the group
  await killGroup(child, 0)
  running = undefined

  return { exitCode, timedOut, wallMs }
}

async function one(framework: Framework, index: number, port: number): Promise<void> {
  const id = `${framework}-${index}`
  const resultFile = join(resultsDir, `${id}.json`)
  const regrade = values['grade-only'] ?? false

  if (!regrade && existsSync(resultFile)) {
    console.log(`${id}: already done, skipped`)

    return
  }

  const root = join(workDir, id)
  const site = join(root, 'site')
  const transcript = join(root, 'transcript.jsonl')
  // grading again keeps what the agent's run recorded
  const previous = regrade && existsSync(resultFile) ? await Bun.file(resultFile).json() as { startedAt: string, requested: object, session: Session & { leftoverProcesses: number } } : undefined
  const startedAt = previous?.startedAt ?? new Date().toISOString()
  let session: Session = previous?.session ?? { exitCode: 0, timedOut: false, wallMs: 0 }

  if (regrade) {
    if (!existsSync(site)) {
      console.log(`${id}: no workspace, skipped`)

      return
    }

    console.log(`${id}: grading the existing workspace`)
  }
  else {
    console.log(`${id}: preparing ${site}`)
    await prepare(framework, site)
    console.log(`${id}: agent running`)
    session = await agent(framework, site, transcript)
  }

  const leftovers = sweep(root)
  const metrics = parseRun(existsSync(transcript) ? await Bun.file(transcript).text() : '', site)

  console.log(`${id}: ${session.timedOut ? 'timed out' : metrics.outcome} after ${Math.round(session.wallMs / 60_000)} min, grading`)
  const result = {
    framework,
    run: index,
    label,
    startedAt,
    requested: previous?.requested ?? { model: values.model, effort: values.effort, budgetUsd: Number(values.budget), minutes: Number(values.minutes) },
    versions: { ...await versions(site, framework), claude: metrics.claudeVersion },
    session: { ...session, leftoverProcesses: previous?.session.leftoverProcesses ?? leftovers },
    metrics,
    diff: await diff(site),
    grade: await grade(site, port),
    docs: docsSources[framework],
    workspace: root,
  }

  await Bun.write(resultFile, `${JSON.stringify(result, null, 2)}\n`)
  const { grade: graded } = result

  console.log(`${id}: ${graded.passed ? 'PASSED' : 'failed'} (check ${graded.check.ok ? 'ok' : 'failed'}, build ${graded.build.ok ? 'ok' : 'failed'}, acceptance ${graded.acceptance.pass} pass ${graded.acceptance.fail} fail), ${metrics.tokens.output} output tokens, $${metrics.costUsd.toFixed(2)}`)
}

console.log(`label ${label}: ${runs} runs of ${selected.join(', ')}, results in ${resultsDir}, workspaces in ${workDir}`)
// Interleaved and rotated, so drift in API latency over the session falls on every framework alike
for (let index = 1; index <= runs; index++) {
  const order = selected.map((_, offset) => selected[(offset + index - 1) % selected.length] as Framework)

  for (const framework of order) {
    await one(framework, index, 4700 + index)
  }
}
const report = await run(['bun', join(benchDir, 'report.ts'), label], benchDir)

console.log(report.output.trim())
