# Quickstart

## Studio App

Start the editor:

```bash
npm run dev -w @storycharts/studio
```

Build the static app for GitHub Pages:

```bash
npm run build
```

The editor autosaves to `localStorage` and can import/export `.storychart.json` documents plus standalone `.html` files.

## Runtime API

```ts
import { createStoryChart } from "@storycharts/core";
import "@storycharts/theme/sc-theme.css";

const chart = createStoryChart({
  mount: document.getElementById("viz")!,
  toast: {
    type: "bar",
    data: {
      categories: ["2025-01", "2025-06", "2026-01"],
      series: [{ name: "jobCuts", data: [10, 28, 35] }],
    },
    options: {},
    chartFactory: ({ type, el, data, options }) =>
      // pass TOAST UI constructor of your app/build
      new (window as any).toastui.Chart[type]({ el, data, options }),
  },
  states: {
    baseline: {
      highlights: [{ kind: "byCategory", categories: ["2025-01", "2026-01"], color: "#000" }],
    },
    highlightJune: {
      highlights: [
        { kind: "byCategory", categories: ["2025-01", "2026-01"], color: "#000", priority: 1 },
        { kind: "byCategory", categories: ["2025-06"], color: "#f73ba9", priority: 2 },
      ],
    },
  },
  initialState: "baseline",
});

chart.bindScroll(scrollama(), {
  steps: ".story-step",
  offset: 0.6,
  mapStepToState: (_el, i) => (i === 0 ? "baseline" : "highlightJune"),
});
```
