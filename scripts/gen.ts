import process from 'node:process'

import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { collectSkills, remoteEntries, renderTable, root } from './catalog.ts'

const check = process.argv.includes('--check')
const sync = async (name: string, current: string, next: string) => {
  if (current === next)
    return
  if (check)
    throw new Error(`${name} is out of date. Run pnpm gen.`)
  await writeFile(join(root, name), next)
}

const skills = await collectSkills({ offline: check })
const packageText = await readFile(join(root, 'package.json'), 'utf8')
const pkg: unknown = JSON.parse(packageText)
if (pkg == null || typeof pkg !== 'object' || Array.isArray(pkg))
  throw new Error('package.json must be an object')
await sync('package.json', packageText, `${JSON.stringify({ ...pkg, skills: remoteEntries() }, null, 2)}\n`)

const readme = await readFile(join(root, 'README.md'), 'utf8')
const startMarker = '<!-- skills:start -->'
const endMarker = '<!-- skills:end -->'
const start = readme.indexOf(startMarker)
const end = readme.indexOf(endMarker)
if (start < 0 || end < start + startMarker.length)
  throw new Error('README.md needs skills table markers')
await sync('README.md', readme, `${readme.slice(0, start + startMarker.length)}\n\n${renderTable(skills)}\n\n${readme.slice(end)}`)
