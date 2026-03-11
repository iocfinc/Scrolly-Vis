# Job Cuts Walkthrough

This demo covers the v1 acceptance flow:

1. Baseline state highlights each January in black.
2. Second state highlights selected June months in pink.
3. Final state keeps highlights and adds an anchored callout for `2026-01`.

## State mapping

- Step 1 -> `baseline`
- Step 2 -> `highlightJune`
- Step 3 -> `callout`

## Notes

- The demo uses a minimal in-file scroll detector for portability.
- Production usage should use Scrollama and `bindScroll` from `@storycharts/core` or `@storycharts/scroll`.
