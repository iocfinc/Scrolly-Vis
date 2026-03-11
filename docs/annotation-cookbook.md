# Annotation Cookbook

## Callout

```ts
{
  id: "jan-2026",
  type: "callout",
  anchor: { kind: "category", category: "2026-01", series: "jobCuts" },
  text: "Jan 2026 spike",
  pointer: true,
  offset: { x: 0, y: -16 }
}
```

## Label

```ts
{
  id: "peak-label",
  type: "label",
  anchor: { kind: "dataPoint", series: "jobCuts", index: 2 },
  text: "Peak",
  offset: { x: 20, y: -10 }
}
```

## Band

```ts
{
  id: "y-band",
  type: "band",
  axis: "y",
  range: [20, 35],
  style: { background: "rgba(247,59,169,0.18)" }
}
```
