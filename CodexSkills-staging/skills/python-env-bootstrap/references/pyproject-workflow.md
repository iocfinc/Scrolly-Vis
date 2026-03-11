# Pyproject Workflow

## Preferred baseline

- Dependency metadata in `pyproject.toml`
- Local environment in `.venv`
- `uv` as the default environment and dependency manager

## Common commands

### Create environment

```bash
uv venv .venv
```

### Sync dependencies

```bash
uv sync
```

### Run a command inside the managed environment

```bash
uv run pytest
uv run python -m your_package
```

## Fallback commands

When `uv` is unavailable or the repo is intentionally minimal:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -U pip
```

## Migration cues

Consider moving from ad hoc `requirements.txt` plus `venv` to `pyproject.toml` when:

- the project has multiple dependency groups
- packaging metadata already matters
- the repo needs reproducible contributor setup
- scripts and tooling should run consistently in CI and locally

## Repo note to add

Document one canonical setup path. Example:

```bash
uv venv .venv
uv sync
uv run pytest
```
