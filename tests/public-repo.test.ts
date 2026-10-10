import { $ } from 'bun'
import { expect, it } from 'bun:test'

// Spelled in parts so this file does not match itself.
const privateDomain = ['kevyn', 'fr'].join('.')

it('names the forge and registry under kaynooo.fr only, a lockfile\'s tarball URLs included', async () => {
  const files = await $`git grep -lIF ${privateDomain}`.nothrow().quiet().text()

  expect(files.split('\n').filter(Boolean)).toEqual([])
})
