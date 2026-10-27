import type { Source } from '../meta.ts'

import process from 'node:process'

import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parse } from 'yaml'

import { sources } from '../meta.ts'

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export interface Skill {
  category: string
  description: string
  name: string
  source: string
  url: string
}

export const readFrontmatter = (text: string) => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(text)
  if (match?.[1] == null)
    throw new Error('Missing skill frontmatter')
  const data: unknown = parse(match[1])
  if (data == null || typeof data !== 'object' || !('name' in data) || !('description' in data)
    || typeof data.name !== 'string' || typeof data.description !== 'string') {
    throw new Error('Skill needs a string name and description')
  }
  return { description: data.description, name: data.name }
}

export const remoteEntries = () => sources.map(({ skills, source }) => ({ skills, source }))

const fetchText = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`${url}: ${response.status}`)
  return response.text()
}

const fetchSkills = async ({ category, skills, source }: Source): Promise<Skill[]> => {
  const [owner, repo, ...rest] = source.split('/')
  const repository = `${owner}/${repo}`
  const prefix = rest.length ? `${rest.join('/')}/` : ''
  const headers: Record<string, string> = { 'user-agent': 'kwaa-skills' }
  const token = process.env.GITHUB_TOKEN
  if (token != null)
    headers.authorization = `Bearer ${token}`
  const response = await fetch(`https://api.github.com/repos/${repository}/git/trees/HEAD?recursive=1`, { headers })
  if (!response.ok)
    throw new Error(`GitHub tree ${repository}: ${response.status}`)
  const data: unknown = await response.json()
  if (data == null || typeof data !== 'object' || !('tree' in data) || !Array.isArray(data.tree))
    throw new Error(`Invalid GitHub tree for ${repository}`)
  const paths = data.tree.map((entry: unknown) => {
    if (entry == null || typeof entry !== 'object' || !('path' in entry) || typeof entry.path !== 'string')
      throw new Error(`Invalid tree entry in ${repository}`)
    return entry.path
  })
  const candidates = paths.includes(`${prefix}SKILL.md`)
    ? [`${prefix}SKILL.md`]
    : paths.filter((path) => {
        const relative = path.slice(prefix.length)
        const depth = relative.split('/').length - 1
        return path.startsWith(prefix) && path.endsWith('/SKILL.md')
          && (depth === 1 || (relative.startsWith('skills/') && depth <= 4))
          && skills.includes(path.split('/').at(-2) ?? '')
      })
  const found = await Promise.all(candidates.map(async path => ({
    ...readFrontmatter(await fetchText(`https://raw.githubusercontent.com/${repository}/HEAD/${path}`)),
    category,
    source,
    url: `https://github.com/${repository}/blob/HEAD/${path}`,
  })))
  return skills.map((name) => {
    const skill = found.find(candidate => candidate.name === name)
    if (skill == null)
      throw new Error(`Skill ${name} not found in ${source}`)
    return skill
  })
}

export const collectSkills = async ({ offline = false } = {}): Promise<Skill[]> => {
  const folders = await readdir(join(root, 'skills'), { withFileTypes: true })
  const originals = await Promise.all(folders.filter(entry => entry.isDirectory()).map(async ({ name }) => ({
    ...readFrontmatter(await readFile(join(root, 'skills', name, 'SKILL.md'), 'utf8')),
    category: 'Original',
    source: 'kwaa/skills',
    url: `./skills/${name}/SKILL.md`,
  })))
  const readme = await readFile(join(root, 'README.md'), 'utf8')
  const cached = new Map([...readme.matchAll(/^\| \[([^\]]+)\]\(([^)]+)\) \| (.*?) \| /gmu)]
    .map(([, name, url, description]) => [name, { description: description.replaceAll('\\|', '|'), name, url }]))
  const remotes = offline
    ? sources.flatMap(({ category, skills, source }) => skills.map((name) => {
        const skill = cached.get(name)
        if (skill == null)
          throw new Error(`Missing README entry for ${name}. Run pnpm gen.`)
        return { ...skill, category, source }
      }))
    : (await Promise.all(sources.map(fetchSkills))).flat()
  const all = [...originals, ...remotes]
  const names = new Set<string>()
  for (const { name } of all) {
    if (names.has(name))
      throw new Error(`Duplicate skill: ${name}`)
    names.add(name)
  }
  return all
}

export const renderTable = (skills: Skill[]) => {
  const cell = (text: string) => text.replaceAll('|', '\\|').replaceAll(/\s+/gu, ' ').trim()
  return [...new Set(skills.map(skill => skill.category))].map(category => [
    `### ${category}`,
    '',
    '| Skill | Description | Source |',
    '| --- | --- | --- |',
    ...skills.filter(skill => skill.category === category).map((skill) => {
      const [owner, repo, ...path] = skill.source.split('/')
      const repository = `${owner}/${repo}`
      const sourceUrl = `https://github.com/${repository}${path.length ? `/tree/HEAD/${path.join('/')}` : ''}`
      const description = skill.description.split(/(?<=\.)\s/u)[0] ?? skill.description
      return `| [${skill.name}](${skill.url}) | ${cell(description)} | [${repository}](${sourceUrl}) |`
    }),
  ].join('\n')).join('\n\n')
}
