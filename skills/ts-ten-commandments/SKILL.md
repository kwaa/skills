---
name: ts-ten-commandments
description: Enforce ten principles for clean, readable, type-safe TypeScript and TSX code during implementation, modification, and review. Use automatically for TypeScript or TSX tasks and explicitly when a user asks to apply or audit the TypeScript Ten Commandments.
---

# TypeScript Ten Commandments

Apply these commandments while planning, writing, modifying, and reviewing TypeScript or TSX. Prefer fixing violations before delivery. If the user explicitly requires a violation, preserve it and report the affected commandment and reason.

## Operating rules

1. Inspect the relevant project configuration and existing code before making decisions.
2. Treat platform-enforced requirements and explicit user decisions as higher priority than style commandments.
3. When commandments conflict, use this order: platform or explicit user requirement, user decision rights, readability, then the remaining style rules.
4. Report only violations, justified exceptions, and decisions that require the user. If all checks pass, say so briefly.

When a material problem would change behavior, dependencies, data, the environment, or the delivered result, stop and ask. Report:

- the observed fact;
- the affected result;
- the available choices and recommended choice; and
- the exact decision needed from the user.

Do not install dependencies, change the environment, invent a replacement, or use a mock to hide a missing dependency or service unless the user authorized that action category. Continue with deterministic, reversible work such as reading configuration and running checks. Test mocks are allowed when requested or already established by the test convention.

## The commandments

### 1. Target modern platforms

**Rule.** Target the modern platform supported by the project. For browsers, use current Baseline guidance; for Node, use the current LTS line. Do not write conservative compatibility code for an older platform unless it is required.

**Apply.** Read `engines`, Browserslist, `tsconfig`, build targets, and deployment configuration first. If no target is declared, use the local runtime and toolchain as the practical baseline rather than relying on stale assumptions or browsing for a distant target.

**Prefer.** Modern syntax, standard-library APIs, platform APIs, and an appropriate compiler target. Do not force a framework or build-tool version.

**Exception.** An explicit project target or user requirement overrides this commandment.

**Review.** Is this compatibility code required by a declared target, or is it merely habit?

### 2. Prefer type constraints to runtime constraints

**Rule.** In trusted internal code, express constraints with TypeScript instead of adding runtime defenses for imaginary misuse. `readonly` is a compile-time constraint; `Object.freeze` is runtime behavior.

**Apply.** Use `readonly` when preventing writes by TypeScript users is sufficient. Add runtime validation or freezing only when security, an external data shape, or a runtime API contract makes it necessary.

**Prefer.** Small, type-level contracts over defensive checks that duplicate them. Do not assume hostile or careless TypeScript users by default.

**Exception.** Keep the minimum runtime behavior required at a real trust boundary or by a runtime API.

**Review.** What concrete runtime requirement does this check or freeze satisfy?

### 3. Do not scatter ad hoc narrowing

**Rule.** Do not create one-off `isX`, `asserts`, or type assertions to hide missing modeling. A single-use check belongs inline. Repeated logic may become a reusable abstraction only when its semantics are consistent, its input boundary is stable, and its name describes a general capability or structure rather than one business type.

**Apply.** Model internal cases with discriminated unions, generics, control-flow narrowing, and explicit data flow. At an external boundary, perform the smallest real parse or validation needed, then narrow once.

**Avoid.** Local `isRecord`, `isJSON`, `isEvent`, or equivalent helpers that merely tell the compiler to trust an unproved claim. Do not replace them with `as` or `asserts` to evade this rule.

**Exception.** A genuinely reusable boundary abstraction is allowed when it carries meaningful logic beyond renaming a business type.

**Review.** Is this narrowing logic used once, or does it represent a stable abstraction that several callers genuinely share?

### 4. Do not decide for the user

**Rule.** Do not silently choose among material alternatives. Surface missing dependencies, unavailable environments, ambiguous requirements, and failed assumptions instead of privately mocking, guessing, or suppressing the error.

**Apply.** Interpret authorization by action category. “Complete the task” does not automatically authorize installing a dependency, changing the environment, choosing an architecture, or replacing a real service. Test mocks are acceptable when requested or already part of the project convention; environment substitution is not.

**Review.** Would this action change behavior, dependencies, data, environment, or delivery? If yes, stop and ask unless the user authorized that category.

### 5. Split large files

**Rule.** Count physical lines in human-maintained source and test files. At 300 lines, review the file for split points; at 600 lines, split it by default.

**Exclude.** Generated files, third-party code, lockfiles, snapshots, and pure data or resource files.

**Apply.** Split by coherent responsibility. Name tests after the behavior or module they test, such as `foo.test.ts`; follow the repository's directory convention.

**Exception.** Retain a large file only when it serves one coherent feature, exposes one public callable entry point, and keeps the remaining implementation private. Do not use exports or test-file structure to evade the rule.

**Review.** What single responsibility justifies keeping this file together, and why would splitting it reduce readability?

### 6. Prefer types and forbid new `any`

**Rule.** If adding types removes runtime code, add the types. In new or modified human-maintained code, never introduce explicit or implicit `any`.

**Apply.** Use precise types for known values. Use `unknown` for values that are genuinely possible but not yet known, especially at an untyped boundary; narrow it promptly and do not let it spread through internal code. Use `never` only for impossible states or unreachable branches. Use generics and `infer` when they reduce repetition and make the relationship clearer.

**Avoid.** Using `never` as a substitute for `unknown`, using `as` or an ad hoc guard to avoid modeling, and advanced type gymnastics that save lines but reduce comprehension.

**Exception.** Do not rewrite untouched third-party declarations, generated files, or unrelated legacy code solely to remove existing `any`; do not add new `any` at their boundaries.

**Review.** Is this value known, genuinely unknown, or impossible? Can the relationship be expressed with a clearer generic or existing type?

### 7. Prefer pure functions

**Rule.** Keep core business and transformation logic pure. Isolate I/O, time, randomness, global state, and other effects at the boundaries.

**Apply.** A pure function should produce the same result for the same inputs and should not mutate its inputs or external state. Return new values by default. Make mutation explicit only when a real performance constraint or API contract requires it.

**Apply to packages.** Set `package.json` `sideEffects` to `false` only when every importable module is free of import-time effects. Check for polyfills, global registration, CSS/resource imports, and similar initialization before making that declaration.

**Exception.** Preserve effects required by the target platform or explicitly requested by the user, but keep them at a visible boundary.

**Review.** Can this logic receive time, randomness, or I/O results as arguments instead of reaching out itself?

### 8. Put readability first

**Rule.** Write for human readers. Prefer clear intent over fewer lines, and avoid clever one-liners, deep nesting, and opaque type gymnastics.

**Comments.** Keep comments sparse. Explain why, not what the code mechanically does. Use brief TSDoc on public functions for users; describe behavior and contract without repeating type annotations or using JSDoc-style type tags. Comments may also record complex invariants, external limitations, and necessary warnings.

**Loops.** Prefer `.forEach` or `for...of` over `for...in`. When keys or entries are needed, use `.keys()` or `.entries()`. Choose `while` when its control-flow semantics make the code clearer.

**Review.** Can a reader understand the intent from the names, types, and control flow without a commentary translation?

### 9. Handle errors deliberately

**Rule.** Use `try/catch` only when there is evidence or a contract that the call can fail in the actual environment and catching provides value: recovery, translation, context, reporting, or a deliberate boundary.

**Apply.** After `catch (error)`, perform the smallest narrowing supported by the call's real error contract. Handle known shapes; rethrow unmatched errors unchanged. Apply the same rule to Promise `.catch()` and awaited calls.

**Avoid.** Catching because any JavaScript expression could theoretically throw, enumerating every imaginable error shape, or returning `undefined`, a default, or an empty result to hide failure. If absence is a valid domain result, represent it with a clear domain-level result rather than a silent fallback.

**Review.** What failure is evidenced here, what can this layer actually do about it, and what happens to an error outside the known contract?

### 10. Prefer functional patterns over OOP

**Rule.** Prefer functional programming. If a factory function works, do not write a `class`. If a `const` arrow function works, do not write a function declaration. If an arrow can immediately return an expression, omit braces and `return`.

**Apply.** Use small functions, closures, composition, and expression bodies. Keep the default style consistent even when an alternative is familiar or conventional.

**Exception.** Make an exception only when the target platform itself enforces the alternative. Framework preference, third-party style, project convention, user API preference, and personal familiarity do not qualify automatically.

**Review.** Is the alternative required by the target platform, or is it merely an OOP or traditional JavaScript habit?

## Completion check

Before delivery, inspect the changed TypeScript/TSX and report only actionable findings:

- target compatibility and unnecessary legacy code;
- runtime defenses versus type constraints;
- ad hoc narrowing and new `any`;
- user decisions that were not authorized;
- file size and responsibility boundaries;
- effect isolation and `sideEffects` accuracy;
- readability, TSDoc, and loop choices;
- error-catching evidence and propagation; and
- functional-style violations.

If a rule must be sacrificed, name the commandment, the higher-priority requirement, and the resulting tradeoff.
