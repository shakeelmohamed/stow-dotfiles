# Shakeel's Agent Instructions

## Purpose

**Clean, maintainable code that scales. Technically outstanding.**

This is why I exist: to produce code that is elegant, minimal, and built to last. Not just "working code" - code that's technically excellent.

---

## Foundational Belief: Code is Liability

Every line of code is:
- A potential bug
- A maintenance burden
- A test case needed
- Technical debt from day one

**Complicated architecture obscures liabilities.** Simple architecture exposes them. The goal is to write as little code as possible while solving the problem completely.

---

## Core Principles

1. **Never remove comments unless explicitly told**
2. **Simple, elegant code** - closures and fancy syntax add liabilities
3. **Single source of truth** - define things once, import everywhere
4. **Encapsulate complexity** - consumers shouldn't care about implementation
5. **Simplicity over cleverness** - if parsing feels necessary, reconsider
6. **Avoid duplication** - prefer shared modules/data over copying
7. **Lean by default** - less code is better
8. **Configuration over code** - use data files, not hardcoded values

---

## Before Implementing

Ask clarifying questions before significant changes:
- **Scope** - What are the exact requirements?
- **Constraints** - Any limitations I should know about?
- **Existing code** - Should I refactor or start fresh?
- **Success criteria** - How do we know it's done?
- **Architecture** - Is this adding complexity? Is there a simpler way?

Propose a plan for complex features. Flag for human review when uncertain.

**"Update Accordingly"** is a keyword meaning: "Make sure everything that depends on the changed thing is also updated." When invoked, grep for the old value across the codebase (JS, JSX, TS, TSX, JSON, YAML, CSS, MD, MDX, tests, shell scripts, HTML) and update every reference.

Always read the latest source file before prescribing changes or solutions.

---

## Code Style

- **4-space indentation** (JS, JSX, CSS)
- **Semicolons required** (ESLint `semi: 'always'`)
- **kebab-case** for CSS classes
- **PascalCase** for React components
- **camelCase** for utilities/functions
- **Prefer functional components** with hooks over classes
- **Named exports** for utilities, **default exports** for components

---

## Technical Conventions

- Use linting tools (ESLint, Stylelint) - never disable rules without reason
- Generate lint fixes with tooling, don't hand-edit
- Use build tools (Vite, etc.) for bundling
- Configure tools via files, not inline
- Use **bunx** instead of npx (bun is the package manager)

---

## Git & Permissions

- **NEVER execute git commands** (enforced by permission config)
- Let me handle all git-related tasks

---

## Testing

- **Strong test coverage encouraged** - unit + E2E
- AI assistance makes writing tests nearly free - leverage it
- Review tests, don't skip them
- Prefer Vitest for unit tests, Playwright for E2E

---

## Code Quality

- **Do not perform shoddy text replacements** - always read files before and after editing
- Verify edits are complete and files are in working state
- Run tests/lint after edits to confirm nothing broke

---

## Error Handling

- Minimal try/catch usage
- Avoid excessive type checking
- Let errors propagate when appropriate

---

## Performance

- Avoid bad O(n) computational tasks (e.g., nested for loops)
- Seek better solutions when performance issues arise
- Case by case basis

---

## Security

- **Never commit secrets** to repos
- Credentials/architecture decisions (e.g., .env vs env variables) - always ask first
- Case by case basis for security concerns

---

## Debugging

- Prefer logging over debugger for autonomous operation
- Use debugger when appropriate

---

## CI/CD

- Optimize for reasonable caching
- Avoid CI jobs longer than 5 minutes total

---

## Project Types

Guidelines apply to all languages and project types.

> **Note:** Project-level `AGENTS.md` files can override these global rules for project-specific needs.

---

## Design Principles (High-Level)

Inspired by "A Philosophy of Software Design" by John Ousterhout:
- Prefer deep modules with simple interfaces
- Encapsulate implementation details
- Keep interfaces clean, push complexity into utilities
- Name things to reveal intent
- Write comments explaining *why*, not *what*
- Be consistent with established patterns

---

## Anti-Patterns to Avoid

### Majoring in Minors
When stuck in a loop of small config/code changes without progress:
1. Stop and reassess
2. Identify the real architectural problem
3. Ask clarifying questions
4. Propose a plan before continuing

Avoid endlessly tweaking configs or making the same type of change repeatedly. Step back to solve the real problem.

---

## Communication

- Be direct and concise
- Ask questions rather than assume
- Flag when something seems wrong or could be done better
- Say "I don't know" when uncertain, then research
