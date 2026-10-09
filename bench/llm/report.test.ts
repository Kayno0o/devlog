import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, expect, it } from 'bun:test'

const dir = mkdtempSync(join(tmpdir(), 'llm-bench-report-'))

afterAll(() => rmSync(dir, { recursive: true, force: true }))

function result(framework: string, run: number, output: number, passed: boolean): object {
  return {
    framework,
    run,
    startedAt: `2026-10-10T0${run}:00:00.000Z`,
    requested: { model: 'opus', effort: 'high', budgetUsd: 30, minutes: 90 },
    versions: { bun: '1.4.3', claude: '2.1.289' },
    session: { exitCode: 0, timedOut: false, wallMs: 600_000 * run, leftoverProcesses: 0 },
    metrics: {
      model: 'claude-opus-5-5',
      claudeVersion: '2.1.289',
      outcome: 'success',
      durationMs: 600_000 * run,
      durationApiMs: 400_000,
      turns: 40,
      costUsd: 1.5,
      tokens: { input: 100, output, cacheCreation: 2000, cacheRead: 30_000 },
      outputExact: true,
      thinkingTokens: output / 2,
      resultTokens: { input: framework === 'sveltekit' && run === 2 ? 1 : 100, output, cacheCreation: 2000, cacheRead: 30_000 },
      apiCalls: 40,
      peakContextTokens: 50_000,
      toolCalls: { Read: 10, Bash: 5 },
      toolErrors: 1,
      checkRuns: [{ command: 'bun run check', failed: true, errors: 3 }],
      checkErrors: 3,
      docs: { calls: 4, chars: 9000 },
      loaded: { tools: ['Bash', 'Read'], plugins: [], mcpServers: [] },
      outside: [],
      skippedLines: 0,
    },
    diff: { files: 8, added: 300, removed: 10, dependenciesAdded: framework === 'sveltekit' ? ['marked'] : [], gradingConfigChanged: framework === 'kay' && run === 2 ? ['script check'] : [] },
    grade: { check: { ok: passed, errors: 0 }, build: { ok: true }, acceptance: { pass: passed ? 24 : 20, fail: passed ? 0 : 4, failures: passed ? [] : ['favorites > toggle'] }, passed },
    docs: { source: 'fixture docs', revision: 'abcdef1234', files: 3, bytes: 2_500_000 },
  }
}

it('sums up medians over passing runs and lists every run', async () => {
  for (const [framework, run, output, passed] of [['kay', 1, 1000, true], ['kay', 2, 3000, true], ['sveltekit', 1, 5000, true], ['sveltekit', 2, 9000, false]] as const) {
    await Bun.write(join(dir, `${framework}-${run}.json`), JSON.stringify(result(framework, run, output, passed)))
  }
  const report = Bun.spawnSync(['bun', join(import.meta.dir, 'report.ts'), dir])

  expect(report.exitCode).toBe(0)

  const summary = await Bun.file(join(dir, 'summary.json')).json() as { frameworks: Record<string, { passed: number, spent: { totalTokens: number }, measures: Record<string, { median: number, min: number, max: number }> }> }

  expect(summary.frameworks.kay?.passed).toBe(2)
  expect(summary.frameworks.kay?.measures.outputTokens).toEqual({ median: 2000, min: 1000, max: 3000 })
  expect(summary.frameworks.sveltekit?.passed).toBe(1)
  expect(summary.frameworks.sveltekit?.measures.outputTokens).toEqual({ median: 5000, min: 5000, max: 5000 })
  expect(summary.frameworks.kay?.measures.cacheReadTokens?.median).toBe(30_000)
  expect(summary.frameworks.kay?.measures.totalTokens?.median).toBe(34_100)

  const markdown = await Bun.file(join(dir, 'results.md')).text()

  expect(markdown).toContain('| Passed | 2 of 2 | 1 of 2 |')
  expect(markdown).toContain('| Output tokens | 2,000 (1,000 to 3,000) | 5,000 (5,000 to 5,000) |')
  expect(markdown).toContain('| Cache read tokens | 30,000 (30,000 to 30,000) |')
  expect(markdown).toContain('| Cost of every run, failed ones included (USD) | 3.00 | 3.00 |')
  expect(markdown).toContain('| Wall time (minutes) | 15.0 (10.0 to 20.0) | 10.0 (10.0 to 10.0) |')
  expect(summary.frameworks.sveltekit?.spent.totalTokens).toBe(32_100 * 2 + 5000 + 9000)
  expect(markdown).toContain('| sveltekit 2 | no | 9,000 |')
  expect(markdown).toContain('docs: fixture docs at abcdef1, 3 files, 2.5 MB; packages added by an agent: marked')
  expect(markdown).toContain('- No session started an MCP server.')
  expect(markdown).toContain('- No tool call left the workspace')
  expect(markdown).toContain('worth reading before trusting its check: kay 2 (script check)')
  expect(markdown).toContain('differ from the session\'s own totals by more than 1%: sveltekit 2')
  expect(markdown).toContain('- sveltekit run 2: success, check failed, build ok, failing: favorites > toggle')
})
