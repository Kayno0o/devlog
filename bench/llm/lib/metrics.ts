// Reads one agent run out of `claude -p --output-format stream-json --verbose` lines.

export interface Tokens {
  input: number
  output: number
  cacheCreation: number
  cacheRead: number
}

export interface CheckRun {
  command: string
  failed: boolean
  errors: number
}

export interface RunMetrics {
  model: string
  claudeVersion: string
  /** What the session loaded besides its tools, to prove it ran isolated. */
  loaded: { tools: string[], plugins: string[], mcpServers: string[] }
  outcome: string
  durationMs: number
  durationApiMs: number
  turns: number
  costUsd: number
  /** Input and cache counts summed per API call; output from the result line, since each call's line carries the usage of its first streamed chunk, before its output. */
  tokens: Tokens
  /** False when the session never reached its result line, so `tokens.output` only sums those first-chunk counts and undercounts. */
  outputExact: boolean
  /** Thinking tokens, part of output: the result line's count, else the CLI's estimate while streaming. */
  thinkingTokens: number
  /** The totals the result line reports, kept to cross-check `tokens`, summed from each API call; absent when the session never finished. */
  resultTokens?: Tokens
  apiCalls: number
  /** The largest context one API call read: uncached input, cache writes and cache reads together. */
  peakContextTokens: number
  toolCalls: Record<string, number>
  toolErrors: number
  checkRuns: CheckRun[]
  checkErrors: number
  /** Tool calls that read the offline docs, and how many characters they brought back. */
  docs: { calls: number, chars: number }
  /** Tool calls reaching outside the workspace or the network, which the prompt forbids. */
  outside: string[]
  /** Bash calls running python, node or another package manager, where the prompt asks for bun only. */
  otherRuntimes: string[]
  /** Lines that were not JSON, such as the last one of a transcript cut short by a kill. */
  skippedLines: number
}

interface Usage {
  input_tokens?: number
  output_tokens?: number
  cache_creation_input_tokens?: number
  cache_read_input_tokens?: number
  output_tokens_details?: { thinking_tokens?: number }
}

interface Block {
  type: string
  id?: string
  name?: string
  input?: Record<string, unknown>
  tool_use_id?: string
  content?: string | { type: string, text?: string }[]
  is_error?: boolean
}

interface Line {
  type: string
  subtype?: string
  model?: string
  version?: string
  claude_code_version?: string
  estimated_tokens_delta?: number
  tools?: string[]
  plugins?: { name: string }[]
  mcp_servers?: { name: string }[]
  message?: { id?: string, usage?: Usage | null, content?: string | Block[] }
  duration_ms?: number
  duration_api_ms?: number
  num_turns?: number
  total_cost_usd?: number | null
  usage?: Usage
}

const checkCommand = /\b(?:bun run (?:check|build)|kay (?:check|build)|svelte-check|svelte-kit sync|tsc|astro (?:check|build)|vite build)\b/

// The summary line each checker prints, tsc, svelte-check, astro check and kay check in that order
const errorSummaries = [/Found (\d+) errors?/, /svelte-check found (\d+) errors?/, /^- (\d+) errors?/m, /^(\d+) errors?$/m]

const errorLine = /^error\b|\berror\[|\berror TS\d+|^Error:|\berror during build/i
const docsPath = /(?:^|[\s/"'])docs(?:\/|\s|$)/
const networkCommand = /\b(?:curl|wget)\b/
// a curl at the agent's own server is fine, so only a remote URL or no local host at all counts as the network
const remoteUrl = /https?:\/\/(?!localhost\b|127\.0\.0\.1\b|0\.0\.0\.0\b|\[::1\])/
const localHost = /\b(?:localhost|127\.0\.0\.1|0\.0\.0\.0)\b/
const homePath = /(?:~|\/home\/)[^\s'"]*/g
const parentCd = /(?:^|\s)cd\s+\.\.(?:\s|\/|$)/
const heredocStart = /<<-?\s*['"]?(\w+)/
const otherRuntime = /(?:^|[\s;&|(])(?:python3?|node|npx|npm|pnpm|yarn)(?=\s|$)/m
const failedExit = /^Exit code [1-9]/

// A heredoc's body is a file being written, whose `~/lib` imports or URLs in comments are not commands
function withoutHeredocs(command: string): string {
  const kept: string[] = []
  let end: string | undefined

  for (const line of command.split('\n')) {
    if (end !== undefined) {
      end = line.trim() === end ? undefined : end

      continue
    }

    kept.push(line)
    end = heredocStart.exec(line)?.[1]
  }

  return kept.join('\n')
}

export function countErrors(output: string): number {
  for (const summary of errorSummaries) {
    const match = summary.exec(output)

    if (match) {
      return Number(match[1])
    }
  }

  return output.split('\n').filter(line => errorLine.test(line.trim())).length
}

function resultText(block: Block): string {
  return typeof block.content === 'string' ? block.content : (block.content ?? []).map(part => part.text ?? '').join('\n')
}

function readsDocs(input: Record<string, unknown>): boolean {
  return [input.file_path, input.path, input.command, input.pattern].some(value => typeof value === 'string' && docsPath.test(value))
}

/** Paths and commands of a tool call that leave the workspace or use the network. */
function outsideOf(name: string, input: Record<string, unknown>, cwd: string): string | undefined {
  if (name === 'Bash') {
    const command = withoutHeredocs(String(input.command ?? ''))
    const network = networkCommand.test(command) && (remoteUrl.test(command) || !localHost.test(command))
    const home = command.match(homePath)?.some(path => !path.startsWith(cwd)) ?? false

    return network || home || parentCd.test(command) ? `Bash: ${String(input.command)}` : undefined
  }

  const path = String(input.file_path ?? input.path ?? '')

  return path.startsWith('/') && !path.startsWith(cwd) ? `${name}: ${path}` : undefined
}

function tokensOf(usage: Usage): Tokens {
  return {
    input: usage.input_tokens ?? 0,
    output: usage.output_tokens ?? 0,
    cacheCreation: usage.cache_creation_input_tokens ?? 0,
    cacheRead: usage.cache_read_input_tokens ?? 0,
  }
}

export function parseRun(text: string, cwd: string): RunMetrics {
  const metrics: RunMetrics = {
    model: '',
    claudeVersion: '',
    loaded: { tools: [], plugins: [], mcpServers: [] },
    outcome: 'no result',
    durationMs: 0,
    durationApiMs: 0,
    turns: 0,
    costUsd: 0,
    tokens: { input: 0, output: 0, cacheCreation: 0, cacheRead: 0 },
    outputExact: false,
    thinkingTokens: 0,
    apiCalls: 0,
    peakContextTokens: 0,
    toolCalls: {},
    toolErrors: 0,
    checkRuns: [],
    checkErrors: 0,
    docs: { calls: 0, chars: 0 },
    outside: [],
    skippedLines: 0,
    otherRuntimes: [],
  }
  // one API response arrives as one line per content block, each repeating the same id and usage
  const usageById = new Map<string, Usage>()
  const pendingChecks = new Map<string, string>()
  const pendingDocs = new Set<string>()
  let thinkingEstimate = 0
  let thinkingExact: number | undefined

  for (const raw of text.split('\n')) {
    if (raw.trim() === '') {
      continue
    }

    let line: Line

    try {
      line = JSON.parse(raw) as Line
    }
    catch {
      metrics.skippedLines++

      continue
    }

    if (line.type === 'system' && line.subtype === 'init') {
      metrics.model = line.model ?? ''
      metrics.claudeVersion = line.claude_code_version ?? line.version ?? ''
      metrics.loaded = {
        tools: line.tools ?? [],
        plugins: (line.plugins ?? []).map(plugin => plugin.name),
        mcpServers: (line.mcp_servers ?? []).map(server => server.name),
      }
    }

    if (line.type === 'system' && line.subtype === 'thinking_tokens') {
      thinkingEstimate += line.estimated_tokens_delta ?? 0
    }

    const content = Array.isArray(line.message?.content) ? line.message.content : []

    if (line.type === 'assistant') {
      if (line.message?.id !== undefined && line.message.usage) {
        usageById.set(line.message.id, line.message.usage)
      }

      for (const block of content.filter(entry => entry.type === 'tool_use')) {
        const name = block.name ?? '?'
        const input = block.input ?? {}

        metrics.toolCalls[name] = (metrics.toolCalls[name] ?? 0) + 1
        const outside = outsideOf(name, input, cwd)

        if (outside !== undefined) {
          metrics.outside.push(outside)
        }

        const command = String(input.command ?? '')

        if (name === 'Bash' && otherRuntime.test(withoutHeredocs(command))) {
          metrics.otherRuntimes.push(command)
        }

        if (block.id !== undefined && readsDocs(input)) {
          metrics.docs.calls++
          pendingDocs.add(block.id)
        }

        if (name === 'Bash' && checkCommand.test(command) && block.id !== undefined) {
          pendingChecks.set(block.id, command)
        }
      }
    }

    if (line.type === 'user') {
      for (const block of content.filter(entry => entry.type === 'tool_result')) {
        const output = resultText(block)
        const failed = block.is_error === true || failedExit.test(output)

        if (failed) {
          metrics.toolErrors++
        }

        if (block.tool_use_id !== undefined && pendingDocs.has(block.tool_use_id)) {
          metrics.docs.chars += output.length
        }

        const command = block.tool_use_id === undefined ? undefined : pendingChecks.get(block.tool_use_id)

        if (command !== undefined) {
          metrics.checkRuns.push({ command, failed, errors: failed ? Math.max(1, countErrors(output)) : 0 })
        }
      }
    }

    if (line.type === 'result') {
      metrics.outcome = line.subtype ?? 'unknown'
      metrics.durationMs = line.duration_ms ?? 0
      metrics.durationApiMs = line.duration_api_ms ?? 0
      metrics.turns = line.num_turns ?? 0
      metrics.costUsd = line.total_cost_usd ?? 0

      if (line.usage) {
        metrics.resultTokens = tokensOf(line.usage)
        thinkingExact = line.usage.output_tokens_details?.thinking_tokens
      }
    }
  }

  for (const usage of usageById.values()) {
    const call = tokensOf(usage)

    metrics.tokens.input += call.input
    metrics.tokens.output += call.output
    metrics.tokens.cacheCreation += call.cacheCreation
    metrics.tokens.cacheRead += call.cacheRead
    const context = call.input + call.cacheCreation + call.cacheRead

    metrics.peakContextTokens = Math.max(metrics.peakContextTokens, context)
  }

  if (metrics.resultTokens) {
    metrics.tokens.output = metrics.resultTokens.output
    metrics.outputExact = true
  }

  metrics.thinkingTokens = thinkingExact ?? thinkingEstimate
  metrics.apiCalls = usageById.size
  metrics.checkErrors = metrics.checkRuns.reduce((sum, run) => sum + run.errors, 0)

  return metrics
}
