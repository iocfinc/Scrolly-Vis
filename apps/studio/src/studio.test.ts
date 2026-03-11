import { describe, expect, test } from "vitest";
import {
  createDatasetFromRows,
  createSampleDocument,
  documentToStoryChartSpec,
  documentToToastConfig,
  exportDocumentToHtml,
  parseCsv,
} from "./studio";

describe("studio helpers", () => {
  test("parses quoted csv fields", () => {
    const parsed = parseCsv('month,value\n"2025-01","172017"\n"2025-02","275240"');
    expect(parsed.rows).toHaveLength(2);
    expect(parsed.rows[0].value).toBe(172017);
  });

  test("infers schema and roles from rows", () => {
    const loaded = createDatasetFromRows("sample", [
      { month: "2025-01", value: 10, series: "A" },
      { month: "2025-02", value: 15, series: "B" },
    ]);
    expect(loaded.dataset.schema[0].role).toBe("x");
    expect(loaded.dataset.schema[1].role).toBe("y");
  });

  test("builds toast config from a sample document", () => {
    const doc = createSampleDocument();
    const config = documentToToastConfig(doc);
    expect(config.toastType).toBe("column");
    expect(config.categories).toContain("2026-01");
  });

  test("exports standalone html with embedded framing", () => {
    const doc = createSampleDocument();
    const html = exportDocumentToHtml(doc, doc.initialState);
    expect(html).toContain(doc.presentation.framing.title);
    expect(html).toContain("toastui-chart.min.js");
  });

  test("converts note annotations to plot-relative anchors for core charts", () => {
    const doc = createSampleDocument();
    doc.states.baseline.annotations = [
      {
        id: "note-1",
        type: "note",
        position: { x: 50, y: 25 },
        text: "Anchored note",
      },
    ];

    const story = documentToStoryChartSpec(doc, "baseline", {} as HTMLElement);

    expect(story?.spec.states?.baseline.annotations?.[0]).toMatchObject({
      type: "label",
      anchor: { kind: "plotPercent", x: 50, y: 25 },
      text: "Anchored note",
    });
  });

  test("exports note overlay logic against the Toast plot area", () => {
    const doc = createSampleDocument();
    doc.states.baseline.annotations = [
      {
        id: "note-1",
        type: "note",
        position: { x: 50, y: 25 },
        text: "Anchored note",
      },
    ];

    const html = exportDocumentToHtml(doc, "baseline");

    expect(html).toContain(".toastui-chart-plot-area");
    expect(html).toContain("plotBox.width * annotation.position.x");
  });
});
