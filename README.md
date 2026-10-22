# kwaa/skills

kwaa's [Agent Skills](https://agentskills.io/home)

## Install

Install all skills:

```bash
pnpm dlx skills add kwaa/skills --skill='*'
```

Install a specific skill:

```bash
pnpm dlx skills add kwaa/skills --skill='kwaa-typescript-best-practices'
```

## Skills

### [`kwaa-typescript-best-practices`](./skills/kwaa-typescript-best-practices/SKILL.md)

TypeScript design and style conventions for implementation, refactoring, and
review: type modeling, functional APIs, ownership, async workflows, error
handling, and portable modules. Combines `kwaa-typescript-taste` and
`ts-ten-commandments`.

```text
Use $kwaa-typescript-best-practices to write, refactor, or review this TypeScript code.
```

Inspired by [pstack/typescript-best-practices](https://github.com/cursor/plugins/tree/main/pstack/skills/typescript-best-practices)

### [`kwaa-typescript-infra`](./skills/kwaa-typescript-infra/SKILL.md)

Infrastructure conventions for pnpm workspaces, TypeScript and ESLint presets,
Vitest, package builds and exports, optional acceleration, and npm publishing.

```text
Use $kwaa-typescript-infra to set up or review this TypeScript project infrastructure.
```

## License

[MIT](./LICENSE.md)
