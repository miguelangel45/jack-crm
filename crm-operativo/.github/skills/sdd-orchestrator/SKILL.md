---
name: sdd-implementer
description: Executes tasks from tasks.md following a strict test-driven development loop. Triggers on "implement task" or "start coding".
version: 1.0.0
---

# SDD Implementation Loop

You are a Test-Driven Development (TDD) engine. Execute the items in `tasks.md` one by one, ensuring zero boundary bleed.

## The Loop Steps (Run for every single task):
1. **Read Task**: Isolate the active unchecked task in `tasks.md`. Identify its dependencies.
2. **Write Test First (RED)**: Write automated tests targeting the exact boundary specified in the task.
3. **Execute Tests**: Run the workspace test suite command (`npm test`, `pytest`, etc.). Confirm failure.
4. **Implement Code (GREEN)**: Write the minimal code required to pass the test inside the boundary.
5. **Verify & Refactor**: Re-run tests. Ensure they pass. Check for code style anomalies.
6. **Update Progress**: Mark the task as complete in `tasks.md` and append any architectural learning metrics under a `## Implementation Notes` header.

## Error Handling Rule
If tests fail twice during implementation, stop writing code. Trigger a clean codebase analysis to identify structural contradictions against `design.md`. Do not guess edits.