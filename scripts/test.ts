import assert from 'node:assert/strict'
import process from 'node:process'

import { execFileSync } from 'node:child_process'
import { access, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { collectSkills, readFrontmatter, root } from './catalog.ts'

const directory = await mkdtemp(join(tmpdir(), 'kwaa-install-'))
try {
  execFileSync('pnpm', ['pack', '--pack-destination', directory], { cwd: root, stdio: 'pipe' })
  const archive = (await readdir(directory)).find(name => name.endsWith('.tgz'))
  if (archive == null)
    throw new Error('pnpm pack did not produce an archive')
  const archivePath = join(directory, archive)
  execFileSync('tar', ['-xzf', archivePath, '-C', directory])
  const packed = join(directory, 'package')
  assert.deepEqual((await readdir(packed)).toSorted((a, b) => a.localeCompare(b)), ['LICENSE.md', 'README.md', 'package.json', 'skills'].toSorted((a, b) => a.localeCompare(b)))
  const paths = await readdir(join(packed, 'skills'), { recursive: true })
  for (const path of paths.filter(name => name.endsWith('.md'))) {
    const file = join(packed, 'skills', path)
    const text = await readFile(file, 'utf8')
    for (const [, target] of text.matchAll(/\]\(([^)]+)\)/gu)) {
      if (target && !/^(?:[a-z][a-z\d+.-]*:|#)/iu.test(target))
        await access(new URL(target, pathToFileURL(file)))
    }
  }
  const consumer = JSON.stringify({
    devDependencies: { '@kwaa/skills': `file:./${archive}` },
    name: 'kwaa-skills-consumer',
    packageManager: 'pnpm@12.3.4',
    private: true,
  }, null, 2)
  await writeFile(join(directory, 'package.json'), `${consumer}\n`)
  execFileSync('pnpm', ['install', '--ignore-scripts'], { cwd: directory, stdio: 'inherit' })
  const cli = fileURLToPath(import.meta.resolve('skills-npm/cli'))
  execFileSync(process.execPath, [cli, '--cwd', directory, '--agents', 'opencode', '--yes'], {
    cwd: directory,
    stdio: 'inherit',
  })
  const expected = await collectSkills({ offline: true })
  const installed = await readdir(join(directory, '.agents', 'skills'))
  if (installed.toSorted((a, b) => a.localeCompare(b)).join('\n') !== expected.map(skill => skill.name).toSorted((a, b) => a.localeCompare(b)).join('\n'))
    throw new Error(`Installed skill set differs from the ${expected.length} selected skills: ${installed.join(', ')}`)
  for (const skill of expected) {
    const path = join(directory, '.agents', 'skills', skill.name, 'SKILL.md')
    await access(path)
    const { name } = readFrontmatter(await readFile(path, 'utf8'))
    if (name !== skill.name)
      throw new Error(`Expected ${skill.name}, installed ${name}`)
  }
  console.log(`Verified all ${expected.length} skills in a packed consumer.`)
}
finally {
  await rm(directory, { force: true, recursive: true })
}
