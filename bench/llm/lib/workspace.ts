import { cpSync, existsSync, readdirSync, readlinkSync, rmSync } from 'node:fs'
import { basename, join } from 'node:path'
import process from 'node:process'
import { killGroup } from './site'

export const benchDir = join(import.meta.dir, '..')

// Build outputs and installs a starter may hold locally, never copied into a run
const testFile = /\.(?:test|spec)\.|(?:^|\/)tests?\//
const skipped = new Set(['node_modules', '.kay', '.svelte-kit', '.output', '.vinxi', '.astro', 'dist', 'build', '.eslintcache'])

const processId = /^\d+$/

export interface Command {
  code: number
  output: string
  timedOut: boolean
}

/** Runs a command in its own process group, killed with everything it started once `timeoutMs` runs out. */
export async function run(command: string[], cwd: string, env: Record<string, string | undefined> = process.env, timeoutMs = 15 * 60_000): Promise<Command> {
  const child = Bun.spawn(['setsid', ...command], { cwd, env, stdout: 'pipe', stderr: 'pipe', stdin: 'ignore' })
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    void killGroup(child)
  }, timeoutMs)
  const [stdout, stderr, code] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited])

  clearTimeout(timer)

  return { code, output: `${stdout}${stderr}${timedOut ? `\nkilled after ${timeoutMs} ms` : ''}`, timedOut }
}

async function must(command: string[], cwd: string): Promise<void> {
  const result = await run(command, cwd)

  if (result.code !== 0) {
    throw new Error(`${command.join(' ')} failed in ${cwd}:\n${result.output}`)
  }
}

/** Copies a starter, the content and the spec into a fresh git repository at `site`, dependencies installed. */
export async function prepare(framework: string, site: string): Promise<void> {
  const starter = join(benchDir, 'starters', framework)

  if (!existsSync(join(starter, 'docs'))) {
    throw new Error(`${starter}/docs is missing: run bun bench/llm/docs.ts first`)
  }

  rmSync(site, { recursive: true, force: true })
  cpSync(starter, site, { recursive: true, filter: source => !skipped.has(basename(source)) })
  cpSync(join(benchDir, 'content'), join(site, 'content'), { recursive: true })
  cpSync(join(benchDir, 'spec.md'), join(site, 'SPEC.md'))
  await must(['bun', 'install', '--frozen-lockfile'], site)
  await must(['git', 'init', '-q'], site)
  await must(['git', 'add', '-A'], site)
  await must(['git', '-c', 'user.name=bench', '-c', 'user.email=bench@localhost', 'commit', '-qm', 'starter'], site)
}

const isInside = (path: string, dir: string): boolean => path === dir || path.startsWith(`${dir}/`)

/** Kills every process still running from inside `dir`, such as a dev server the agent left behind. */
export function sweep(dir: string): number {
  let killed = 0

  for (const pid of readdirSync('/proc').filter(name => processId.test(name))) {
    try {
      if (isInside(readlinkSync(`/proc/${pid}/cwd`), dir) && Number(pid) !== process.pid) {
        process.kill(Number(pid), 'SIGKILL')
        killed++
      }
    }
    catch {
      // gone, or not ours
    }
  }

  return killed
}

export interface Diff {
  files: number
  added: number
  removed: number
  /** Of `added`, the lines of test files: an agent's own tests, which some agents keep and others delete. */
  testLines: number
  dependenciesAdded: string[]
  /** Grading inputs the agent changed: its package.json scripts or tsconfig.json, which could weaken `check`. */
  gradingConfigChanged: string[]
}

/** What the agent wrote: lines against the starter commit, lockfile, docs and content left out. */
export async function diff(site: string): Promise<Diff> {
  await run(['git', 'add', '-A'], site)
  const { output } = await run(['git', 'diff', '--cached', '--numstat', 'HEAD', '--', '.', ':!bun.lock', ':!docs', ':!content', ':!SPEC.md'], site)
  const rows = output.trim().split('\n').filter(Boolean).map(row => row.split('\t'))
  const before = JSON.parse((await run(['git', 'show', 'HEAD:package.json'], site)).output) as Record<string, Record<string, string> | undefined>
  const after = await Bun.file(join(site, 'package.json')).json() as Record<string, Record<string, string> | undefined>
  const names = (pkg: typeof before): Set<string> => new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})])
  const had = names(before)
  const tsconfigBefore = (await run(['git', 'show', 'HEAD:tsconfig.json'], site)).output
  const tsconfigFile = Bun.file(join(site, 'tsconfig.json'))
  const tsconfigAfter = await tsconfigFile.exists() ? await tsconfigFile.text() : ''
  const gradingConfigChanged = [
    ...Object.keys({ ...before.scripts, ...after.scripts }).filter(name => before.scripts?.[name] !== after.scripts?.[name]).map(name => `script ${name}`),
    ...tsconfigBefore === tsconfigAfter ? [] : ['tsconfig.json'],
  ]

  return {
    files: rows.length,
    added: rows.reduce((sum, [added]) => sum + (Number(added) || 0), 0),
    removed: rows.reduce((sum, [, removed]) => sum + (Number(removed) || 0), 0),
    testLines: rows.filter(([, , path = '']) => testFile.test(path)).reduce((sum, [added]) => sum + (Number(added) || 0), 0),
    dependenciesAdded: [...names(after)].filter(name => !had.has(name)).toSorted(),
    gradingConfigChanged,
  }
}
