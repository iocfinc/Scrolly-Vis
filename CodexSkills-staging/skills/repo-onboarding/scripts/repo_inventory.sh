#!/usr/bin/env bash
set -euo pipefail

root="${1:-.}"

printf 'Root: %s\n' "$(cd "$root" && pwd)"
printf '\nTop level:\n'
find "$root" -maxdepth 1 -mindepth 1 | sort

printf '\nLikely manifests:\n'
find "$root" \( -name package.json -o -name pyproject.toml -o -name Cargo.toml -o -name go.mod -o -name Makefile -o -name justfile \) | sort | head -n 40

printf '\nAGENTS files:\n'
find "$root" -name AGENTS.md | sort | head -n 40
