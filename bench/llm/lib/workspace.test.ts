import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'bun:test'
import { diff } from './workspace'

const site = mkdtempSync(join(tmpdir(), 'bench-diff-'))

afterAll(() => rmSync(site, { recursive: true, force: true }))

describe('diff', () => {
  it('counts the test and style lines among those added', async () => {
    await Bun.write(join(site, 'package.json'), '{}\n')
    await Bun.write(join(site, 'tsconfig.json'), '{}\n')
    await Bun.$`git init -q && git add -A && git -c user.name=t -c user.email=t@t commit -qm starter`.cwd(site).quiet()
    await Bun.write(join(site, 'src/app.css'), 'a {\n  color: red;\n}\n')
    await Bun.write(join(site, 'src/page.svelte'), '<h1>Books</h1>\n<style>\n  h1 { color: red; }\n</style>\n')
    await Bun.write(join(site, 'src/page.test.ts'), 'test()\n<style></style>\n')

    const result = await diff(site)

    expect(result.added).toBe(9)
    expect(result.testLines).toBe(2)
    expect(result.styleLines).toBe(6)
  })
})
