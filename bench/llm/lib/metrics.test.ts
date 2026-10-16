import type { RunMetrics } from './metrics'
import { describe, expect, it } from 'bun:test'
import { countErrors, parseRun } from './metrics'

const cwd = '/home/me/.cache/llm-bench/run/kay-1/site'

const lines = [
  { type: 'system', subtype: 'init', model: 'claude-opus-5-5', claude_code_version: '2.1.289', tools: ['Bash', 'Read'], plugins: [], mcp_servers: [] },
  { type: 'assistant', message: { id: 'm1', usage: { input_tokens: 10, output_tokens: 5, cache_creation_input_tokens: 100, cache_read_input_tokens: 0 }, content: [{ type: 'text', text: 'Reading the spec' }] } },
  { type: 'assistant', message: { id: 'm1', usage: { input_tokens: 10, output_tokens: 40, cache_creation_input_tokens: 100, cache_read_input_tokens: 0 }, content: [{ type: 'tool_use', id: 't1', name: 'Read', input: { file_path: `${cwd}/SPEC.md` } }] } },
  { type: 'system', subtype: 'thinking_tokens', estimated_tokens: 50, estimated_tokens_delta: 50 },
  { type: 'system', subtype: 'thinking_tokens', estimated_tokens: 70, estimated_tokens_delta: 20 },
  { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't1', content: '# Bookshelf' }] } },
  { type: 'assistant', message: { id: 'm2', usage: { input_tokens: 2, output_tokens: 30, cache_creation_input_tokens: 20, cache_read_input_tokens: 100 }, content: [{ type: 'tool_use', id: 't2', name: 'Bash', input: { command: 'bun run check' } }] } },
  { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't2', is_error: true, content: 'Exit code 1\nerror[TS2322]: Type string\n --> src/a.ts:1:7\n\n2 errors' }] } },
  { type: 'assistant', message: { id: 'm3', usage: { input_tokens: 1, output_tokens: 8, cache_creation_input_tokens: 0, cache_read_input_tokens: 120 }, content: [{ type: 'tool_use', id: 't3', name: 'Bash', input: { command: 'bun run check && bun run build' } }, { type: 'tool_use', id: 't4', name: 'Read', input: { file_path: '/home/me/Workspace/kayjs/README.md' } }] } },
  { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't3', content: '0 errors' }, { type: 'tool_result', tool_use_id: 't4', content: 'kay' }] } },
  { type: 'assistant', message: { id: 'm4', usage: { input_tokens: 1, output_tokens: 3, cache_creation_input_tokens: 0, cache_read_input_tokens: 130 }, content: [{ type: 'tool_use', id: 't5', name: 'Bash', input: { command: 'curl -s https://example.com' } }, { type: 'tool_use', id: 't6', name: 'Read', input: { file_path: `${cwd}/docs/llms.txt` } }, { type: 'tool_use', id: 't7', name: 'Grep', input: { pattern: 'form', path: 'docs' } }] } },
  { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't5', content: 'ok' }, { type: 'tool_result', tool_use_id: 't6', content: '# Kay docs' }, { type: 'tool_result', tool_use_id: 't7', content: [{ type: 'text', text: 'docs/actions.md' }] }] } },
  { type: 'result', subtype: 'success', duration_ms: 61_000, duration_api_ms: 50_000, num_turns: 5, total_cost_usd: 0.42, usage: { input_tokens: 14, output_tokens: 900, output_tokens_details: { thinking_tokens: 400 }, cache_creation_input_tokens: 120, cache_read_input_tokens: 350 } },
]

/** The outside calls of a session running these Bash commands one after another. */
function bashes(...commands: string[]): string[] {
  return parseRun(commands.map((command, index) => JSON.stringify({ type: 'assistant', message: { id: `m${index}`, content: [{ type: 'tool_use', id: `t${index}`, name: 'Bash', input: { command } }] } })).join('\n'), cwd).outside
}

const bash = (command: string): string[] => bashes(command)

describe('parseRun', () => {
  const metrics = parseRun(lines.map(line => JSON.stringify(line)).join('\n'), cwd)

  it('reads the session and the result', () => {
    expect(metrics.model).toBe('claude-opus-5-5')
    expect(metrics.claudeVersion).toBe('2.1.289')
    expect(metrics.outcome).toBe('success')
    expect(metrics.durationMs).toBe(61_000)
    expect(metrics.turns).toBe(5)
    expect(metrics.costUsd).toBe(0.42)
  })

  it('counts each API response once, output taken from the result line', () => {
    expect(metrics.apiCalls).toBe(4)
    expect(metrics.tokens).toEqual({ input: 14, output: 900, cacheCreation: 120, cacheRead: 350 })
    expect(metrics.outputExact).toBe(true)
    expect(metrics.peakContextTokens).toBe(131)
    expect(metrics.resultTokens).toEqual(metrics.tokens)
    expect(metrics.thinkingTokens).toBe(400)
  })

  it('skips a line cut short by a kill', () => {
    const cut = parseRun(`${lines.filter(line => line.type !== 'result').map(line => JSON.stringify(line)).join('\n')}\n{"type":"assis`, cwd)

    expect(cut.skippedLines).toBe(1)
    expect(cut.model).toBe('claude-opus-5-5')
    expect(cut.resultTokens).toBeUndefined()
    expect(cut.outputExact).toBe(false)
    expect(cut.thinkingTokens).toBe(70)
  })

  it('records a usage limit Claude Code answered in place of the model', () => {
    const limit = { type: 'assistant', message: { id: 'm5', model: '<synthetic>', usage: { input_tokens: 0, output_tokens: 0 }, content: [{ type: 'text', text: 'You\'ve hit your session limit' }] } }
    const limited = parseRun([...lines.slice(0, -1), limit, lines.at(-1)].map(line => JSON.stringify(line)).join('\n'), cwd)

    expect(limited.interrupted).toBe('You\'ve hit your session limit')
    expect(limited.outcome).toBe('success')
    expect(metrics.interrupted).toBeUndefined()
  })

  it('counts the docs the agent read', () => {
    expect(metrics.docs).toEqual({ calls: 2, chars: 25 })
  })

  it('counts tool calls and failed ones', () => {
    expect(metrics.toolCalls).toEqual({ Read: 3, Bash: 3, Grep: 1 })
    expect(metrics.toolErrors).toBe(1)
  })

  it('records every check the agent ran and the errors it hit', () => {
    expect(metrics.checkRuns).toEqual([
      { command: 'bun run check', failed: true, errors: 2 },
      { command: 'bun run check && bun run build', failed: false, errors: 0 },
    ])
    expect(metrics.checkErrors).toBe(2)
  })

  it('counts each framework\'s own checker as a check', () => {
    const checked = (command: string): RunMetrics['checkRuns'] => parseRun([
      { type: 'assistant', message: { id: 'm', content: [{ type: 'tool_use', id: 't', name: 'Bash', input: { command } }] } },
      { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't', is_error: true, content: 'Exit code 1\nFound 3 errors in 2 files.' }] } },
    ].map(line => JSON.stringify(line)).join('\n'), cwd).checkRuns

    for (const command of ['bunx nuxt typecheck', 'bunx nuxi typecheck', 'bunx vue-tsc --noEmit', 'bunx next build', 'bunx next typegen && bunx tsc --noEmit']) {
      expect(checked(command)).toEqual([{ command, failed: true, errors: 3 }])
    }
    expect(checked('ls .next')).toEqual([])
  })

  it('flags reads outside the workspace and network use', () => {
    expect(metrics.outside).toEqual(['Read: /home/me/Workspace/kayjs/README.md', 'Bash: curl -s https://example.com'])
  })

  it('lets a curl at the agent\'s own server through', () => {
    expect(bash('curl -s -H "Origin: http://localhost:4567" localhost:4567/contact')).toEqual([])
    expect(bash('curl -s http://127.0.0.1:4567/ && curl -s https://example.com')).toHaveLength(1)
    expect(bash('wget example.com')).toHaveLength(1)
    expect(bash(`curl -s -X POST -H 'Origin: http://evil.com' -H "Referer: https://evil.com/" localhost:4567/contact`)).toEqual([])
    expect(bash('curl -s -H "Origin: http://localhost:4567" https://example.com')).toHaveLength(1)
    expect(bash('B=http://127.0.0.1:4701; for o in http://localhost:4701 http://evil.com; do curl -s -w "$o %{http_code}" -H "Origin: $o" -X POST $B/contact; done')).toEqual([])
    expect(bash('for u in https://docs.astro.build http://localhost:4701; do curl -s $u; done')).toHaveLength(1)
    expect(bash(`u=http://localhost:4701; for o in http://localhost:4701 http://evil.example; do h=\${o#http://}; echo -n "$o -> "; curl -s -X POST -H "Origin: $o" -H "Host: $h" $u/contact; done`)).toEqual([])
    expect(bash('PLAYWRIGHT_BROWSERS_PATH=./b bunx playwright-core install chromium')).toHaveLength(1)
    expect(bash('bun add -d playwright-core')).toEqual([])
  })

  it('follows the folder the shell keeps between calls, flagging only a cd out of the workspace', () => {
    expect(bashes('cd docs/docs/kit; grep -n x llms.txt', 'cd ../../..; ls node_modules')).toEqual([])
    expect(bashes('cd src && ls', 'cd .. && cd ..')).toHaveLength(1)
    expect(bashes('(cd .. && ls)')).toHaveLength(1)
    expect(bashes('cd ~ && ls')).toHaveLength(1)
    expect(bashes('cd /tmp; curl -s http://127.0.0.1:4701/about', 'ls src')).toEqual([])
    expect(bashes('cd /tmp/../etc && ls')).toHaveLength(1)
  })

  it('lets the agent read the long tool output Claude Code kept for its own session', () => {
    const read = (path: string): string[] => parseRun(JSON.stringify({ type: 'assistant', message: { id: 'm', content: [{ type: 'tool_use', id: 't', name: 'Read', input: { file_path: path } }] } }), cwd).outside

    expect(read('/home/me/.claude/projects/-home-me--cache-llm-bench-run-kay-1-site/abc/tool-results/b1.txt')).toEqual([])
    expect(read('/home/me/.claude/projects/-home-me-Workspace-other/abc/tool-results/b1.txt')).toHaveLength(1)
    expect(bash('cat /home/me/.claude/projects/-home-me--cache-llm-bench-run-kay-1-site/abc/tool-results/b1.txt | sed -n 50,700p')).toEqual([])
    expect(bash('cat /home/me/.claude/projects/-home-me-Workspace-other/abc/tool-results/b1.txt')).toHaveLength(1)
  })

  it('reads past heredoc bodies, which are files being written', () => {
    const run = (command: string): RunMetrics => parseRun(JSON.stringify({ type: 'assistant', message: { id: 'm', content: [{ type: 'tool_use', id: 't', name: 'Bash', input: { command } }] } }), cwd)
    const written = run(`cat > src/a.ts <<'EOF'\nimport { x } from '~/lib/x'\n// see http://example.com, run curl or python\nEOF\nbun run check`)

    expect(written.outside).toEqual([])
    expect(written.otherRuntimes).toEqual([])
    expect(run(`python3 - <<'EOF'\nprint(1)\nEOF`).otherRuntimes).toHaveLength(1)
    expect(run('cat ~/.cache/ms-playwright/x').outside).toHaveLength(1)
  })
})

describe('countErrors', () => {
  it('reads each checker summary', () => {
    expect(countErrors('src/a.ts(1,7): error TS2322: x\nFound 3 errors in 2 files.')).toBe(3)
    expect(countErrors('====\nsvelte-check found 4 errors and 1 warning in 2 files')).toBe(4)
    expect(countErrors('Result (12 files): \n- 5 errors\n- 0 warnings\n- 1 hint')).toBe(5)
    expect(countErrors('error[TS2322]: x\n\n1 error')).toBe(1)
    expect(countErrors('Failed to compile.\n\n./app/page.tsx:3:7\nType error: Type "number" is not assignable to type "string".')).toBe(1)
  })

  it('counts error lines when there is no summary', () => {
    expect(countErrors('src/a.ts(1,7): error TS2322: x\nsrc/b.ts(2,1): error TS2304: y')).toBe(2)
    expect(countErrors('error during build:\nRollupError: boom')).toBe(1)
  })
})
