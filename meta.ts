export interface Source {
  category: string
  skills: string[]
  source: string
}

export const sources: Source[] = [
  {
    category: 'Workflow',
    skills: [
      'grill-me',
      'grilling',
      'grill-with-docs',
      'to-spec',
      'to-tickets',
      'implement',
      'implement-spec',
      'wayfinder',
      'prototype',
      'tdd',
      'codebase-design',
      'domain-modeling',
      'improve-codebase-architecture',
      'diagnosing-bugs',
      'code-review',
      'research',
      'pr',
      'handoff',
      'to-questionnaire',
      'wizard',
      'setup-matt-pocock-skills',
      'triage',
      'wait-what',
      'writing-for-agents',
    ],
    source: 'mattpocock/skills',
  },
  {
    category: 'Workflow',
    skills: [
      'architect',
      'arena',
      'swarm',
      'how',
      'why',
      'teach',
      'interrogate',
      'blast-radius',
      'no-comments',
      'benchmark-checklist',
      'create-verification-skill',
      'maintain-verification-skill',
      'show-me-your-work',
      'reflect',
      'correct',
    ],
    source: 'cursor/plugins/pstack',
  },
  {
    category: 'Writing',
    skills: ['technical-writing', 'unslop'],
    source: 'cursor/plugins/pstack',
  },
  {
    category: 'Writing',
    skills: ['simple-english'],
    source: 'AminBlg/SimpleEnglish',
  },
  {
    category: 'Writing',
    skills: ['i-have-adhd'],
    source: 'ayghri/i-have-adhd',
  },
  {
    category: 'Design',
    skills: ['frontend-design'],
    source: 'anthropics/skills/skills/frontend-design',
  },
  {
    category: 'Browser',
    skills: ['agent-browser'],
    source: 'vercel-labs/agent-browser',
  },
]
