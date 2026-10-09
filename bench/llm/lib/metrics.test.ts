import { describe, expect, it } from 'bun:test'
import { countErrors, parseRun } from './metrics'

const cwd = '/home/me/.cache/llm-bench/run/kay-1/site'

const lines = [
  { type: 'system', subtype: 'init', model: 'claude-opus-5-5', claude_code_version: '2.1.289', tools: ['Bash', 'Read'], plugins: [], mcp_servers: [] },
  { type: 'assistant', message: { id: 'm1', usage: { input_tokens: 10, output_tokens: 5, cache_creation_input_tokens: 100, cache_read_input_tokens: 0 }, content: [{ type: 'text', text: 'Reading the spec' }] } },
  { type: 'assistant', message: { id: 'm1', usage: { input_tokens: 10, output_tokens: 40, cache_creation_input_tokens: 100, cache_read_input_tokens: 0 }, content: [{ type: 'tool_use', id: 't1', name: 'Read', input: { file_path: `${cwd}/SPEC.md` } }] } },
  { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't1', content: '# Bookshelf' }] } },
  { type: 'assistant', message: { id: 'm2', usage: { input_tokens: 2, output_tokens: 30, cache_creation_input_tokens: 20, cache_read_input_tokens: 100 }, content: [{ type: 'tool_use', id: 't2', name: 'Bash', input: { command: 'bun run check' } }] } },
  { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't2', is_error: true, content: 'Exit code 1\nerror[TS2322]: Type string\n --> src/a.ts:1:7\n\n2 errors' }] } },
  { type: 'assistant', message: { id: 'm3', usage: { input_tokens: 1, output_tokens: 8, cache_creation_input_tokens: 0, cache_read_input_tokens: 120 }, content: [{ type: 'tool_use', id: 't3', name: 'Bash', input: { command: 'bun run check && bun run build' } }, { type: 'tool_use', id: 't4', name: 'Read', input: { file_path: '/home/me/Workspace/kayjs/README.md' } }] } },
  { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't3', content: '0 errors' }, { type: 'tool_result', tool_use_id: 't4', content: 'kay' }] } },
  { type: 'assistant', message: { id: 'm4', usage: { input_tokens: 1, output_tokens: 3, cache_creation_input_tokens: 0, cache_read_input_tokens: 130 }, content: [{ type: 'tool_use', id: 't5', name: 'Bash', input: { command: 'curl -s https://example.com' } }, { type: 'tool_use', id: 't6', name: 'Read', input: { file_path: `${cwd}/docs/llms.txt` } }, { type: 'tool_use', id: 't7', name: 'Grep', input: { pattern: 'form', path: 'docs' } }] } },
  { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 't5', content: 'ok' }, { type: 'tool_result', tool_use_id: 't6', content: '# Kay docs' }, { type: 'tool_result', tool_use_id: 't7', content: [{ type: 'text', text: 'docs/actions.md' }] }] } },
  { type: 'result', subtype: 'success', duration_ms: 61_000, duration_api_ms: 50_000, num_turns: 5, total_cost_usd: 0.42, usage: { input_tokens: 14, output_tokens: 81, cache_creation_input_tokens: 120, cache_read_input_tokens: 350 } },
]

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

  it('counts each API response once, with its last usage', () => {
    expect(metrics.apiCalls).toBe(4)
    expect(metrics.tokens).toEqual({ input: 14, output: 81, cacheCreation: 120, cacheRead: 350 })
    expect(metrics.peakContextTokens).toBe(131)
    expect(metrics.resultTokens).toEqual(metrics.tokens)
  })

  it('skips a line cut short by a kill', () => {
    const cut = parseRun(`${JSON.stringify(lines[0])}\n{"type":"assis`, cwd)

    expect(cut.skippedLines).toBe(1)
    expect(cut.model).toBe('claude-opus-5-5')
    expect(cut.resultTokens).toBeUndefined()
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

  it('flags reads outside the workspace and network use', () => {
    expect(metrics.outside).toEqual(['Read: /home/me/Workspace/kayjs/README.md', 'Bash: curl -s https://example.com'])
  })
})

describe('countErrors', () => {
  it('reads each checker summary', () => {
    expect(countErrors('src/a.ts(1,7): error TS2322: x\nFound 3 errors in 2 files.')).toBe(3)
    expect(countErrors('====\nsvelte-check found 4 errors and 1 warning in 2 files')).toBe(4)
    expect(countErrors('Result (12 files): \n- 5 errors\n- 0 warnings\n- 1 hint')).toBe(5)
    expect(countErrors('error[TS2322]: x\n\n1 error')).toBe(1)
  })

  it('counts error lines when there is no summary', () => {
    expect(countErrors('src/a.ts(1,7): error TS2322: x\nsrc/b.ts(2,1): error TS2304: y')).toBe(2)
    expect(countErrors('error during build:\nRollupError: boom')).toBe(1)
  })
})
