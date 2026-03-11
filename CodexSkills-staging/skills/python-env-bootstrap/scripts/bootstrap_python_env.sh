#!/usr/bin/env bash
set -euo pipefail

root="${1:-.}"
venv_dir="${2:-.venv}"

cd "$root"

if [ -f "pyproject.toml" ]; then
  if command -v uv >/dev/null 2>&1; then
    echo "Detected pyproject.toml and uv. Creating managed environment in $venv_dir"
    uv venv "$venv_dir"
    echo "Syncing dependencies from pyproject.toml"
    uv sync
    echo "Environment ready. Use 'uv run <command>' or source $venv_dir/bin/activate"
  else
    echo "Detected pyproject.toml but uv is not installed."
    echo "Fallback: create a basic venv, then install dependencies manually."
    python3 -m venv "$venv_dir"
    echo "Created $venv_dir. Activate it and install dependencies with pip if required."
  fi
else
  echo "No pyproject.toml found. Creating plain venv in $venv_dir"
  python3 -m venv "$venv_dir"
  echo "Created $venv_dir. Consider adding pyproject.toml if this repo will grow."
fi
