# StoryCharts Studio

`StoryCharts Studio` is a static Vite + React app in [`apps/studio`](/Users/iraoliverfernando/Desktop/Dioscuri/Scrolly-Vis/apps/studio).

## Current v1 feature set

- CSV and JSON upload
- schema inference and field-role mapping
- bar, column, line, area, scatter, combo, and lollipop presets
- title, subtitle, source, footnote, and byline editing
- named states
- highlight rules
- callout, label, band, and note annotations
- light/dark newsroom palette
- local autosave
- JSON and standalone HTML export

## Local development

```bash
npm run dev -w @storycharts/studio
```

## Verification

```bash
npm run typecheck
npm run test
npm run build
```

## Notes

- Category-based charts (`bar`, `column`, `line`, `area`, `lollipop`) render through the local `@storycharts/core` runtime.
- `scatter` and `combo` currently use a lighter Toast UI preview path.
- Standalone HTML export is self-contained except for Toast UI assets loaded from the official CDN.
