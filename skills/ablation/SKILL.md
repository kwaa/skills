---
name: ablation
description: Test whether an implementation needs its abstractions and design. Use before code review after implement or implement-spec, or when asked to run ablation experiments on a change.
---

Ablation tests a design by removing parts of it. Use the results to simplify the implementation while preserving its requirements. When used with implement or implement-spec, run ablation after implementation and before code-review.

1. Identify the requirements and the full change since the work began. Include uncommitted work and preserve unrelated changes. Run the relevant tests and record their results as the baseline.
2. Find parts of the new design that you can remove or simplify. Examples include interfaces, configuration, extension points, and defensive code. For each part, identify its purpose and the effects of removing it on behavior, callers, constraints, and maintenance.
3. Test one part at a time. Remove or simplify the part and update its callers. Run tests that distinguish the original design from the simpler design. Compare the result with the requirements and the baseline. Consider project conventions and explicit requirements even when the tests pass. If the simpler design preserves the required behavior and constraints and improves the design overall, keep it. Otherwise, restore the original design. Preserve tests that express required behavior. Do not weaken tests to make an experiment pass.
4. Repeat until you have assessed each plausible part of the new design. Run the appropriate final tests. Report what you removed, what you kept, and why. Report any tests you could not run or behavior you could not verify. If no change improves the design, say so. Run code-review on the resulting change when it is part of the workflow.
