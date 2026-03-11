---
name: scrollytelling-story-builder
description: Build scroll-driven narratives from experiments, datasets, and analytical findings using HTML, CSS, and JavaScript with sticky visuals and step-based story states. Use when turning charts, test results, timelines, or data analysis into a cohesive scrollytelling page, especially when the work needs narrative sequencing, responsive scrolly layout, and documented interpretation.
---

# Scrollytelling Story Builder

## Overview

Turn raw findings into a narrative with one clear claim per step, a persistent visual anchor, and explicit state changes tied to scroll progress.

## Workflow

1. Read the dataset, experiment notes, or analysis output.
2. Extract the core story:
   - What changed?
   - Why does it matter?
   - What is surprising?
   - What should the reader notice first, second, and last?
3. Convert findings into a step sequence:
   - baseline
   - comparison
   - outlier or turning point
   - implication
4. Choose the visual grammar:
   - bars for discrete comparison
   - line for trend over time
   - annotations for outliers
   - callouts for interpretation
5. Build the layout:
   - prose column with steps
   - sticky visualization column
   - mobile fallback where the chart becomes non-sticky
6. Ensure each step maps to a visual state or annotation change.
7. Document assumptions, caveats, and what the data does not prove.

## Writing Rules

- One claim per step.
- Keep prose specific to the evidence shown.
- Do not hide uncertainty; state sample size, missingness, or ambiguity when relevant.
- Prefer a small number of memorable moments over a long sequence of weak steps.

## Implementation Rules

- Keep HTML structure simple and inspectable.
- Use CSS sticky positioning for the visual column.
- Use one JS state function per story step or per named visual state.
- Make mobile behavior intentional rather than a broken desktop clone.
- Keep data interpretation close to the code or in a nearby notes file.

## Tools

- Use [`scripts/scaffold_scrollytelling.sh`](./scripts/scaffold_scrollytelling.sh) to copy the starter template into a project.
- Read [`references/story-arc.md`](./references/story-arc.md) before shaping the narrative.
- Read [`references/experiment-interpretation.md`](./references/experiment-interpretation.md) when converting test results or datasets into claims.
- Start from [`assets/starter/`](./assets/starter) for a minimal HTML/CSS/JS implementation.
