# StoryCharts

StoryCharts is a newsroom-focused charting toolkit built on TOAST UI Chart.

## Packages

- `@storycharts/core`: runtime wrapper (state machine, highlights, annotations)
- `@storycharts/theme`: CSS tokens and component styles
- `@storycharts/scroll`: optional Scrollama helper
- `@storycharts/studio`: browser-based chart editor for GitHub Pages exports

## Development

```bash
npm install
npm run build
npm run test
```

## Studio

The new studio app lives in [`apps/studio`](/Users/iraoliverfernando/Desktop/Dioscuri/Scrolly-Vis/apps/studio) and provides:

- CSV/JSON upload
- field mapping and chart selection
- newsroom framing controls
- stateful highlights and annotations
- local autosave
- `.storychart.json` export
- standalone `.html` export

Run the editor locally with:

```bash
npm run dev -w @storycharts/studio
```

Build the static GitHub Pages output with:

```bash
npm run build
```

See docs in `docs/` and demos in [`demos/jobcuts`](/Users/iraoliverfernando/Desktop/Dioscuri/Scrolly-Vis/demos/jobcuts).
