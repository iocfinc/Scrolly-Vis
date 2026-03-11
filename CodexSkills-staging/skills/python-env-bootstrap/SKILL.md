---
name: python-env-bootstrap
description: Set up and standardize Python project environments with a `pyproject.toml`-first workflow, while keeping `venv` as a safe fallback. Use when bootstrapping a new Python repo, onboarding an existing Python codebase, creating reproducible local environments, or deciding whether to use `uv`, `pip`, or plain `venv`.
---

# Python Env Bootstrap

## Overview

Create a usable Python environment quickly, favoring modern `pyproject.toml`-based workflows and only falling back to bare `venv` when the project is intentionally minimal.

## Workflow Decision

1. Inspect the repo for `pyproject.toml`.
2. If `pyproject.toml` exists, prefer `uv` for environment creation and dependency sync.
3. If no `pyproject.toml` exists but the repo is Python-based, decide whether to:
   - add a minimal `pyproject.toml`, or
   - use plain `python -m venv` if the project truly does not need packaging metadata yet
4. Standardize the local environment path as `.venv` unless the repo already uses something else.
5. Document the exact bootstrap and validation commands in the repo `AGENTS.md` or `README.md`.

## Default Recommendations

- Prefer `.venv` in the repo root.
- Prefer `uv venv .venv` and `uv sync` for `pyproject.toml` projects.
- Prefer `uv run` for one-off commands in managed projects.
- Keep `venv` fallback commands available for low-dependency or legacy repos.
- Do not mix multiple dependency entry points without documenting the canonical one.

## Minimal Execution Paths

### `pyproject.toml` present

1. Create the environment.
2. Sync dependencies.
3. Run a smoke check such as importing the main package or running tests.

### No `pyproject.toml`

1. Create `.venv` with `python -m venv`.
2. Activate it if needed for the current shell.
3. Install only the required bootstrap packages.
4. Consider adding a minimal `pyproject.toml` if the project is expected to grow.

## Tools

- Run [`scripts/bootstrap_python_env.sh`](./scripts/bootstrap_python_env.sh) to choose the default path automatically.
- Read [`references/pyproject-workflow.md`](./references/pyproject-workflow.md) for command patterns and migration notes.
