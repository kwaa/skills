# kwaa/skills

kwaa's [Agent Skills](https://agentskills.io/home).

## Install

### Skills

```bash
pnpx skills add kwaa/skills
```

<!-- ### Skill Pack

```bash
pnpm i -D skills-npm @kwaa/skills
pnpx skills-npm setup
``` -->

## Skills

### [`ablation`](./skills/ablation/SKILL.md)

Test a design by removing or simplifying parts of it. Run ablation after
implementation and before code review to remove unnecessary complexity while
preserving the requirements.

```text
Use $ablation to simplify this implementation before code review.
```

### [`kwaa-typescript-best-practices`](./skills/kwaa-typescript-best-practices/SKILL.md)

Design and style rules for writing, refactoring, and reviewing TypeScript.
Covers types, function-based APIs, data ownership, async code, errors, and portable
modules. Combines `kwaa-typescript-taste` and `ts-ten-commandments`.

```text
Use $kwaa-typescript-best-practices to write, refactor, or review this TypeScript code.
```

Inspired by [pstack/typescript-best-practices](https://github.com/cursor/plugins/tree/main/pstack/skills/typescript-best-practices)

### [`kwaa-typescript-infra`](./skills/kwaa-typescript-infra/SKILL.md)

Project setup rules for pnpm workspaces, TypeScript, ESLint, Vitest, package
builds and exports, and npm publishing. Includes optional tools for faster lint
and build tasks.

```text
Use $kwaa-typescript-infra to set up or review this TypeScript project infrastructure.
```

<!-- ## Skill Pack

In addition to all the skills mentioned above, it also includes: -->

## License

[MIT](./LICENSE.md)
