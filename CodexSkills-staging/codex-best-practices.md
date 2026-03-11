# Codex Project Best Practices

## What consistently improves Codex output

1. Give Codex a clean, predictable repo surface.
   - Keep the worktree clean before large tasks.
   - Make common commands obvious: install, dev, lint, test, typecheck, build.
   - Avoid hidden setup steps that only exist in tribal knowledge.

2. Write a strong root `AGENTS.md`.
   - Explain how the repo is organized.
   - List the exact commands Codex should run for validation.
   - State project conventions, forbidden actions, and review expectations.
   - Add nested `AGENTS.md` files only where local rules differ.

3. Make tasks verifiable.
   - Ask for concrete outputs: files changed, tests run, acceptance criteria met.
   - Define what "done" means before implementation starts.
   - Prefer small scoped tasks over broad "improve this" prompts.

4. Reduce rediscovery.
   - Add architecture notes, API contracts, and domain vocabulary near the code.
   - Promote recurring workflows into scripts or skills.
   - Store long guidance in references and keep the primary instructions lean.

5. Keep the environment close to reality.
   - Match local tooling to CI where possible.
   - Ensure tests, linters, and type checks run reliably without manual patching.
   - Use sample env files and documented defaults so Codex does not guess secrets or config.

## Practical tips when creating Codex-first projects

- Create a root `AGENTS.md` on day one, not after the repo becomes messy.
- Include a fast path and a full path:
  - Fast path: the quickest command set for local validation.
  - Full path: the CI-equivalent checks.
- Add a `TASK_TEMPLATE.md` and `IMPLEMENTATION_PLAN_TEMPLATE.md` so requests arrive with scope, constraints, and acceptance criteria.
- Prefer `rg`-friendly text documentation over screenshots and unsearchable docs.
- If a repo has multiple apps or packages, add one `AGENTS.md` per bounded area instead of one giant file.
- Encode fragile workflows in scripts instead of prose.
- Keep skills narrow and triggerable. One skill should solve one repeatable class of work.
- For each skill, separate:
  - `SKILL.md` for workflow instructions.
  - `references/` for optional deep context.
  - `scripts/` for deterministic repeat work.
  - `assets/` for templates or starter files.

## Recommended minimum repo files

- `AGENTS.md`
- `README.md`
- `.env.example`
- `TASK_TEMPLATE.md`
- `IMPLEMENTATION_PLAN_TEMPLATE.md`
- `docs/architecture.md`
- A single command entry point such as `make verify` or `npm run verify`

## Suggested operating pattern

1. Capture the task using the task template.
2. Refine scope and acceptance criteria.
3. Let Codex map the repo and identify affected areas.
4. Implement in small reviewable steps.
5. Run project validation commands.
6. Record assumptions, risks, and follow-up work.

## Sources

- OpenAI, "Introducing Codex" (May 16, 2025): https://openai.com/index/introducing-codex/
- OpenAI Help Center, "OpenAI Codex CLI - Getting Started" (updated March 2026): https://help.openai.com/en/articles/11096431-openai-codex-ci-getting-started
- OpenAI Codex repository: https://github.com/openai/codex
- AGENTS.md specification and examples: https://agents.md/
