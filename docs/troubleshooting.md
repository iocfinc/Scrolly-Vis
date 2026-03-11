# Troubleshooting

## Geometry degraded mode

StoryCharts v1 uses fallback geometry extraction from DOM/plot bounds when direct internals are unavailable. This can drift if chart internals change.

Mitigations:

- Keep TOAST UI Chart versions pinned per release
- Re-run visual checks after upgrades
- Prefer category/dataPoint anchors over pixel anchors

## Annotation drift on resize

Call `chart.resize()` after layout or font changes. StoryCharts also reflows on window resize and after `document.fonts.ready`.
