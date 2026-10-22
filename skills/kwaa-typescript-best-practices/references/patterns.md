# TypeScript patterns

## Discriminated unions

Avoid: unrelated optional fields allow a value and an error at the same time.

```ts
export interface ResultEvent<T> {
  error?: Error
  failed: boolean
  value?: T
}
```

Prefer: each variant carries exactly the fields it requires.

```ts
export type ResultEvent<T>
  = | { error: Error, type: 'failure' }
    | { type: 'value', value: T }
```

## Exhaustiveness

Use a `never` assignment when every variant must be handled and the function's
return type does not already enforce it.

```ts
type Action = { type: 'reset' } | { type: 'set', value: number }

export const apply = (action: Action, update: (value: number) => void): void => {
  switch (action.type) {
    case 'reset':
      update(0)
      break
    case 'set':
      update(action.value)
      break
    default: {
      const exhaustive: never = action
      void exhaustive
    }
  }
}
```

Adding an unhandled action makes the assignment fail to compile. Partial
observers need not handle unrelated variants.

## Derived types

Given an existing source contract:

```ts
export interface User {
  email: string
  id: string
  name: string
}
```

Avoid: repeating fields in a second contract that can drift when `User` changes.

```ts
export interface UserSummary {
  id: string
  name: string
}
```

Prefer: derive the view from its source.

```ts
export type UserSummary = Pick<User, 'id' | 'name'>
```

If `User.id` changes to `number`, the derived view follows automatically; the
repeated declaration silently keeps `string`. Apply the same principle to
schema-inferred and generated types.

## Constructive modeling

When every match must contain exactly two participants, a flat array admits an
unmatched final item. Avoid representing that contract as an unconstrained array.

```ts
export type Matches<T> = readonly T[]
```

Prefer: represent each match as a pair.

```ts
export type Matches<T> = readonly (readonly [T, T])[]
```

Consumers can process complete pairs without an even-length check. Converting
untrusted flat data into this representation still requires boundary validation.

## Simplest sufficient type

Repeated assertions or "should never happen" throws are reasons to inspect the
contract, rather than adding another guard at each call site.

Avoid: promise a value while hiding the empty-array case.

```ts
export const first = <T>(values: readonly T[]): T => values[0]!
```

Prefer: require a first item, or expose absence when it is a valid result.

```ts
export const first = <T>(values: readonly [T, ...T[]]): T => values[0]

export const firstOrUndefined = <T>(values: readonly T[]): T | undefined =>
  values[0]

export const sum = (values: readonly number[]): number =>
  values.reduce((total, value) => total + value, 0)
```

A non-empty tuple guarantees index `0`, not every numeric index. Keep ordinary
arrays for operations such as `sum` that already handle emptiness.

## Boundary validation

Reuse existing validators and infer schema-owned types. Do not add a dependency
for a simple one-off parse.

Avoid: an assertion after JSON parsing verifies no domain fields.

```ts
export const parseLocation = (text: string): { location: string } =>
  JSON.parse(text) as { location: string }
```

Prefer: narrow the unknown input and return the verified domain shape.

```ts
export const parseLocation = (input: unknown): { location: string } => {
  if (typeof input !== 'object' || input === null
    || !('location' in input) || typeof input.location !== 'string') {
    throw new TypeError('Expected a string location')
  }

  return { location: input.location }
}
```

## Narrowing

Prefer automatic control-flow narrowing, then a reusable predicate, then an
assertion as a last resort. Choose the built-in check for the input: `typeof`
for primitives, `instanceof` for instances, `in` for structural variants, or a
literal discriminant for modeled variants. These checks have no universal order
among themselves; unknown input may need a basic type check first.

Avoid: a predicate that claims an existing union variant without checking it.

```ts
type Part = { text: string, type: 'text' } | { type: 'image', url: string }

export const textOf = (part: Part): string | undefined => {
  const isText = (value: Part): value is Extract<Part, { type: 'text' }> =>
    'type' in value
  return isText(part) ? part.text : undefined
}
```

Prefer: let the discriminant prove which payload exists.

```ts
type Part = { text: string, type: 'text' } | { type: 'image', url: string }

export const textOf = (part: Part): string | undefined =>
  part.type === 'text' ? part.text : undefined
```

An inline `filter` predicate over an already typed union is also useful narrowing;
it is not a reason to invent a named business-type guard.

## `satisfies` and assertions

Use `satisfies` to check a constructed value against a contract without asserting
that it has a type. It performs no runtime validation.

```ts
interface Options {
  mode: 'fast' | 'safe'
  retries: number
}

export const options = { mode: 'safe', retries: 3 } satisfies Options
```

Keep assertions local to a verified invariant or a relationship TypeScript cannot
express. Do not use them to skip parsing external data.

## Ownership

Avoid: sorting mutates the caller's array.

```ts
export const sorted = (values: number[]): number[] =>
  values.sort((a, b) => a - b)
```

Prefer: accept readonly input and return a new array.

```ts
export const sorted = (values: readonly number[]): number[] =>
  values.toSorted((a, b) => a - b)
```

Local mutation of owned state is fine. `readonly` prevents writes through that
type; it does not freeze the data or isolate shared nested objects.

## Error boundaries

Avoid: disguising a parsing failure as absence.

```ts
export const parseJSON = (text: string): unknown => {
  try {
    return JSON.parse(text)
  }
  catch {
    return undefined
  }
}
```

Prefer: catch only the operation that needs context and preserve its cause.

```ts
export const parseJSON = (text: string): unknown => {
  try {
    return JSON.parse(text)
  }
  catch (cause) {
    throw new Error('Invalid JSON', { cause })
  }
}
```

The result remains `unknown` until its domain shape is validated. Keep subsequent
validation outside this catch so its failures are not mislabeled as JSON errors.
