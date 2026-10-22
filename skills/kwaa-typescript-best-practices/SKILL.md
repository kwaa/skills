---
name: kwaa-typescript-best-practices
description: kwaa's TypeScript best practices. Use when reading or editing .ts or .tsx files.
---

# TypeScript best practices

| Rule | Summary |
|------|---------|
| Modern platforms | Prefer ESM and standard JavaScript and Web APIs. Target the project's declared runtimes; avoid speculative compatibility code. |
| Strict types | No new explicit or implicit `any`. Fix types instead of weakening compiler or lint rules. External data starts as `unknown`. |
| Imports and exports | Separate `import type` and type-only re-exports. Prefer named exports. |
| Interfaces and aliases | `interface` for object contracts and extension points; `type` for unions, functions, and derived types. Prefer literal unions to enums; avoid runtime-transformed `enum` and `namespace`. |
| Discriminated unions | Keep each state's required fields together. Prefer a `type` discriminant for new event vocabularies, rather than boolean flags and optional-field bags. |
| Constructive modeling | Choose structures that exclude illegal combinations: tuples for pairs, discriminated unions for variants. Express invariants in the representation before adding runtime checks. |
| Derived types | Treat existing schemas and generated types as the source of truth. Derive with indexed access, `keyof`, `typeof`, and utility types. Use generics for real relationships. |
| Simplest sufficient type | Repeated `!`, casts, or "should never happen" throws signal a missing constraint. Strengthen the input or represent absence in the output. |
| Exhaustiveness | Use `never` for impossible states. Check exhaustive branches when return types or existing lint rules do not already catch omissions. |
| `satisfies` and assertions | Prefer annotations or `satisfies` for constructed values; `as const` for literal inference. Allow `as` or `!` only for a verified invariant or an otherwise inexpressible relationship. Neither validates external data. |
| Boundary validation | Parse once at the boundary; trust typed values inside. Reuse existing validators and derive types from schemas when available. Do not maintain duplicate schemas, interfaces, and guards for the same shape. |
| Narrowing | Prefer automatic narrowing via discriminants, `in`, `typeof`, or `instanceof`, then reusable predicates, then assertions as a last resort. Keep single-use checks inline; guards must verify their claims. |
| Arrow functions | Prefer `const` arrows and clear expression bodies. Use early returns and guard clauses; omit single-statement braces where formatting permits. Generators and dynamic `this` can use `function`. |
| Factories over classes | Prefer functions, composition, and private closure state. Use classes for useful error identity, platform inheritance, framework integration, or prototype semantics. |
| Ownership | Keep transformations pure; local mutation of owned state is fine. Accept readonly inputs and copy when taking mutable ownership. `readonly` and object spread do not provide deep isolation. |
| Collection transforms | Use `map`, `filter`, `flatMap`, and object entry transforms for simple transformations. Use `for...of` or `while` for sequencing, early exit, or clearer accumulation. Avoid `for...in`. |
| Object arguments | Prefer options objects for optional behavior, ambiguous arguments, and growing APIs. A primary argument plus options is fine. |
| Absence and defaults | Use `??` for defaults and `== null` for either nullish value. Preserve meaningful `false`, `0`, and empty strings. Decide whether an `undefined` override preserves the default. |
| Web APIs | Prefer Fetch, URL, Web Streams, and AbortSignal. Keep runtime-specific operations in adapters. Inject operations such as `fetch` when replacement serves a real consumer or test need. |
| Cancellation | Forward signals and preserve abort reasons. Stop follow-up side effects after cancellation and clean up resources on every exit path. |
| Concurrency | `Promise.all` for independent work that must all succeed; `allSettled` for useful partial results; awaited loops for ordered effects. Aggregate rejection does not cancel siblings. |
| Promise ownership | Avoid unnecessary `async`; retain `return await` when catch or finally must observe settlement. Detached work needs a rejection owner; `void` alone does not handle failure. |
| Error boundaries | Catch only to recover, translate, add context, report, or clean up. Narrow caught `unknown` only as needed. Preserve causes and rethrow unmatched errors unless the boundary normalizes them. Never hide failure with an empty success. |
| Small modules | Keep helpers private and package exports deliberate. Review at 300 lines; split at 600 by default, by responsibility. Exclude generated code and resources; retain larger files only for clear cohesion. |
| Readability | Extract meaningful behavior, not wrappers. Comments explain why; brief TSDoc explains public contracts without repeating types. |
| Real tests | Use real platform objects with deterministic fixtures and controlled boundary implementations. Verify affected contracts, ownership, failures, and cancellation. Do not claim a mocked integration was verified. |

Examples: [references/patterns.md](references/patterns.md).
