---
name: kwaa-typescript-taste
description: Apply kwaa's general TypeScript design and style preferences when writing or refactoring TypeScript or TSX, especially library APIs, reusable utilities, async workflows, and module boundaries.
---

# TypeScript taste

## Apply preferences in context

- Follow explicit user requirements first.
- Preserve repository conventions, supported environments, and public compatibility unless asked to change them.
- Apply these preferences when the repository leaves a choice open.
- Do not rewrite unrelated code solely to enforce these preferences.

## Write modern, strict TypeScript

- Target modern ESM and standard platform APIs.
- Keep strict type checking intact. Do not weaken compiler or lint rules to make code pass.
- Separate type-only imports with `import type`.
- Prefer named exports. Use default exports only where a framework or configuration convention requires one.
- Prefer `interface` for extendable object contracts and public option shapes.
- Prefer `type` for unions, function types, aliases, mapped types, and types derived from other values.
- Prefer string literal unions and discriminated unions over enums. Avoid TypeScript syntax that requires runtime transformation, such as `enum` and `namespace`.
- Use `unknown` at untrusted boundaries. Narrow it before use.
- Prefer `satisfies` when validating an object shape without widening it. Use assertions only when TypeScript cannot express a verified invariant.
- Derive types with `Parameters`, `ReturnType`, `Awaited`, indexed access, and related utilities instead of duplicating source types.

## Prefer arrows and expression-oriented code

- Use arrow functions unless a construct specifically requires `function`, such as a generator or a dynamic `this`.
- Omit an arrow body and `return` when a single expression is clear.
- Omit braces around a single control-flow statement where the repository formatter permits it.
- Prefer early returns and guard clauses over deep nesting.
- Keep simple transforms declarative with `map`, `filter`, `flatMap`, `Object.entries`, and `Object.fromEntries`.
- Use loops when they make async sequencing, mutation, or branching clearer.

```ts
export const compact = <T>(values: readonly T[]): NonNullable<T>[] =>
  values.filter((value): value is T => value != null)
```

## Prefer factories and closures

- Prefer `createX` factory functions and private closure state for stateful services when no framework lifecycle, inheritance, or identity requirement calls for a class.
- Return a small interface rather than exposing implementation details.
- Use classes when class semantics materially simplify the design: custom errors, extending platform primitives, framework integration, or identity/prototype behavior.
- Keep mutable state private. Expose readonly views and focused mutation methods.

```ts
export interface Counter {
  get: () => number
  increment: () => void
}

export const createCounter = (): Counter => {
  let value = 0

  return {
    get: () => value,
    increment: () => {
      value += 1
    },
  }
}
```

## Design explicit data and API boundaries

- Model state variants with discriminated unions.
- Accept readonly collections when callers are not expected to surrender ownership.
- Use `Readonly<T>` for externally visible state. Clone caller-owned mutable data when retaining it.
- Prefer options objects for functions with multiple parameters, optional behavior, or likely API growth.
- Keep defaults in one typed object and merge explicit user overrides without treating `undefined` as an override.
- Use `null` and `undefined` deliberately:
  - Use `??` for defaults.
  - Use `value == null` only when both `null` and `undefined` mean absence.
  - Use explicit comparisons when `false`, `0`, or `''` are valid values.
- Avoid speculative abstractions. Extract helpers when they name a real invariant, boundary, or repeated operation.

```ts
export type Result<T, E>
  = | { type: 'error', error: E }
    | { type: 'ok', value: T }
```

## Prefer Web APIs and portable modules

When writing library code, prefer standard JavaScript and Web APIs before runtime-specific APIs or dependencies.

Assume ESNext syntax is available, but verify runtime APIs against the repository’s declared targets.

Useful Web APIs include:

- Fetch, `Request`, `Response`, and `Headers`
- `URL` and `URLSearchParams`
- `ReadableStream`, `WritableStream`, and `TransformStream`
- `AbortSignal`
- Web Crypto
- `structuredClone`
- Web Workers and WebGPU where applicable

Runtime-specific APIs are fine at runtime-specific boundaries. They should not quietly infect general-purpose modules.

- Inject platform operations such as `fetch` or storage only when consumers need to replace them for testing, portability, or integration.
- Keep Node.js filesystem, process, and subprocess code in explicit adapters.
- Check whether the platform already provides the primitive before adding a dependency.

## Handle async work deliberately

- Propagate `AbortSignal` through cancellable operations.
- Use `Promise.all` for independent work that must all succeed.
- Use `Promise.allSettled` for best-effort fan-out where one failure must not discard other results.
- Await ordered side effects in a loop.
- Serialize mutations when concurrent writes could violate an invariant.
- Do not mark a function `async` if directly returning the promise is clearer and no `await` is needed.
- Use `void promise.catch(...)` only for intentional fire-and-forget work, and handle or report the error there.

## Make failures meaningful

- Catch errors only to recover, add context, normalize a boundary, or perform cleanup.
- Keep caught values as `unknown`.
- Introduce domain-specific errors when callers need stable error semantics; preserve the original error with cause.
- Include actionable context in protocol and I/O failures, but do not leak secrets.
- Do not silently swallow failures except in explicitly best-effort cleanup paths.
- Validate external responses before trusting their shape or body.

```ts
try {
  return await source.read()
}
catch (cause) {
  throw new ReadError('Failed to read data.', { cause })
}
```

## Keep modules small and navigable

- Give each module one coherent responsibility.
- Keep implementation helpers private unless consumers need them.
- Use `index.ts` as a deliberate public barrel, not as a place for implementation.
- Re-export types with `export type` or inline `type` modifiers.
- Preserve package boundaries; do not import another package's private source files.
- Follow the repository's import sorting and blank-line grouping.

## Final checklist

Before finishing:

1. Run the repository's formatter/linter and relevant type checks and tests.
2. Remove redundant variables, branches, wrappers, assertions, and dependencies.
3. Verify public inputs, outputs, ownership, cancellation, and failure behavior.
4. Confirm runtime-specific APIs remain at explicit boundaries.
5. Check that the implementation matches nearby code, not merely this document.
