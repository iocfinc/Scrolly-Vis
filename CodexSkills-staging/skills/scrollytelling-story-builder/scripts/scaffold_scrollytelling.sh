#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
skill_dir="$(cd "$script_dir/.." && pwd)"
source_dir="$skill_dir/assets/starter"
target_dir="${1:-./scrolly-story}"

mkdir -p "$target_dir"
cp -R "$source_dir"/. "$target_dir"/

printf 'Scrollytelling starter copied to %s\n' "$(cd "$target_dir" && pwd)"
