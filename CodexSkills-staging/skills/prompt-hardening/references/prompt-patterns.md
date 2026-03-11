# Prompt Patterns

## Weak to Strong

### Vague

"Improve the app and make it cleaner."

### Hardened

"Refactor the settings page without changing behavior outside `/src/settings`. Keep the current API contract intact. Run `npm test -- settings` and `npm run lint` before finishing."

## AGENTS.md pattern

- Repo purpose in 2 to 4 lines
- Key directories
- Validation commands
- Local conventions
- Review expectations

## Acceptance criteria pattern

1. Describe the visible outcome.
2. Describe the protected behavior that must not change.
3. Name the exact validation commands.
