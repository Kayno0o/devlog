import process from 'node:process'

export interface Site {
  url: string
  stop: () => Promise<void>
}

async function answers(url: string): Promise<boolean> {
  try {
    await fetch(url, { redirect: 'manual' })

    return true
  }
  catch {
    return false
  }
}

function canBind(port: number): boolean {
  try {
    Bun.listen({ hostname: '127.0.0.1', port, socket: { data: () => undefined } }).stop(true)

    return true
  }
  catch {
    return false
  }
}

/** The first port from `from` nothing listens on. */
export function freePort(from: number): number {
  let port = from

  while (!canBind(port)) {
    port++
  }

  return port
}

/** Sends SIGTERM to a process group, then SIGKILL if it is still there after the grace period. */
export async function killGroup(child: { pid: number, exited: Promise<number> }, graceMs = 5000): Promise<void> {
  const signal = (name: NodeJS.Signals): void => {
    try {
      process.kill(-child.pid, name)
    }
    catch {
      // already gone
    }
  }

  signal('SIGTERM')
  const exited = async (): Promise<boolean> => {
    await child.exited

    return true
  }
  const graceOver = async (): Promise<boolean> => {
    await Bun.sleep(graceMs)

    return false
  }
  const ended = await Promise.race([exited(), graceOver()])

  if (!ended) {
    signal('SIGKILL')
    await child.exited
  }
}

/** Starts a built site with `bun run start` in its own process group, resolving once it answers HTTP. */
export async function startSite(dir: string, port: number, timeoutMs = 30_000): Promise<Site> {
  const url = `http://localhost:${port}`

  // a server already on the port would be graded in place of this one
  if (!canBind(port)) {
    throw new Error(`port ${port} is already in use`)
  }

  // setsid makes the server a group leader, so stop() takes down whatever `bun run start` forked
  const child = Bun.spawn(['setsid', 'bun', 'run', 'start'], {
    cwd: dir,
    env: { ...process.env, NODE_ENV: 'production', PORT: String(port), HOST: '127.0.0.1', ORIGIN: url },
    stdout: 'ignore',
    stderr: 'pipe',
  })
  // read from the start, so a chatty server never blocks on a full pipe
  const stderr = new Response(child.stderr).text()
  const stop = async (): Promise<void> => killGroup(child)
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`site exited with ${child.exitCode}: ${(await stderr).slice(-2000)}`)
    }

    if (await answers(url)) {
      return { url, stop }
    }

    await Bun.sleep(250)
  }

  await stop()

  throw new Error(`site did not answer on ${url} within ${timeoutMs} ms`)
}
