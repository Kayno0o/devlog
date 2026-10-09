import process from 'node:process'

export interface Site {
  url: string
  stop: () => Promise<void>
}

/** Starts a built site with `bun run start` in its own process group, resolving once it answers HTTP. */
export async function startSite(dir: string, port: number, timeoutMs = 30_000): Promise<Site> {
  const url = `http://localhost:${port}`
  // setsid makes the server a group leader, so stop() takes down whatever `bun run start` forked
  const child = Bun.spawn(['setsid', 'bun', 'run', 'start'], {
    cwd: dir,
    env: { ...process.env, NODE_ENV: 'production', PORT: String(port), HOST: '127.0.0.1', ORIGIN: url },
    stdout: 'ignore',
    stderr: 'pipe',
  })
  const stop = async (): Promise<void> => {
    try {
      process.kill(-child.pid, 'SIGTERM')
    }
    catch {
      // already gone
    }
    await child.exited
  }
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`site exited with ${child.exitCode}: ${await new Response(child.stderr).text()}`)
    }

    try {
      await fetch(url, { redirect: 'manual' })

      return { url, stop }
    }
    catch {
      // not listening yet
    }

    await Bun.sleep(250)
  }

  await stop()

  throw new Error(`site did not answer on ${url} within ${timeoutMs} ms`)
}
