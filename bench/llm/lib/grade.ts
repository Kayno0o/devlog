import { join } from 'node:path'
import process from 'node:process'
import { countErrors } from './metrics'
import { startSite } from './site'
import { benchDir, run } from './workspace'

export interface Grade {
  check: { ok: boolean, errors: number }
  build: { ok: boolean }
  acceptance: { pass: number, fail: number, failures: string[] }
  /** The run counts: check, build and every acceptance test pass. */
  passed: boolean
}

// bun test's summary and failure lines
const passCount = /^\s*(\d+) pass/m
const failCount = /^\s*(\d+) fail/m
const failedTest = /^\(fail\) (.+?)(?: \[[\d.]+m?s\])?$/gm

const repoRoot = join(benchDir, '../..')

/** Checks and builds the agent's site, then runs the hidden acceptance suite against its production server. */
export async function grade(site: string, port: number): Promise<Grade> {
  const check = await run(['bun', 'run', 'check'], site)
  const build = await run(['bun', 'run', 'build'], site)
  const result: Grade = {
    check: { ok: check.code === 0, errors: check.code === 0 ? 0 : Math.max(1, countErrors(check.output)) },
    build: { ok: build.code === 0 },
    acceptance: { pass: 0, fail: 0, failures: [] },
    passed: false,
  }

  if (!result.build.ok) {
    return result
  }

  let server

  try {
    server = await startSite(site, port)
  }
  catch (error) {
    result.acceptance.failures.push(`site did not start: ${String(error)}`)

    return result
  }

  try {
    // from the repo root, so the suite resolves playwright-core and the fixtures from here, never from the agent's project
    const suite = await run(['bun', 'test', './bench/llm/acceptance/site.test.ts'], repoRoot, { ...process.env, SITE_URL: server.url })

    result.acceptance = {
      pass: Number(passCount.exec(suite.output)?.[1] ?? 0),
      fail: Number(failCount.exec(suite.output)?.[1] ?? 0),
      failures: [...suite.output.matchAll(failedTest)].map(match => match[1] ?? ''),
    }

    if (suite.code !== 0 && result.acceptance.fail === 0) {
      result.acceptance.failures.push(`suite exited with ${suite.code}`)
      result.acceptance.fail = 1
    }
  }
  finally {
    await server.stop()
  }
  result.passed = result.check.ok && result.acceptance.fail === 0 && result.acceptance.pass > 0

  return result
}
