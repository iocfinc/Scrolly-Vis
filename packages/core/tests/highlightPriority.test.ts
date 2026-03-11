// @vitest-environment jsdom
import { describe, expect, test } from "vitest";
import { HighlightEngine } from "../src/highlights/HighlightEngine";
import { GeometryRegistry } from "../src/geometry/GeometryRegistry";
import { createStoryChart } from "../src/StoryChart";
import type { ToastChartInstance, ToastData } from "../src/types";

describe("HighlightEngine", () => {
  test("resolves priority conflicts", () => {
    const layer = document.createElement("div");
    const engine = new HighlightEngine(layer);
    const g = new GeometryRegistry();

    g.set({
      plotBox: { x: 0, y: 0, w: 120, h: 100 },
      bars: { s: [{ x: 10, y: 10, w: 20, h: 80 }] },
      points: { s: [{ x: 20, y: 10 }] },
    });

    engine.render({
      data: { categories: ["Jan"], series: [{ name: "s", data: [1] }] },
      rules: [
        { kind: "byIndex", series: "s", indices: [0], color: "red", priority: 1 },
        { kind: "byIndex", series: "s", indices: [0], color: "blue", priority: 2 },
      ],
      geometry: g,
      predicates: new Map(),
    });

    expect(layer.children).toHaveLength(1);
    expect((layer.children[0] as HTMLElement).style.background).toBe("blue");
  });

  test("applies column highlights by recoloring base series data", async () => {
    const mount = document.createElement("div");
    document.body.appendChild(mount);

    const setDataCalls: ToastData[] = [];
    const setOptionsCalls: Array<Record<string, unknown>> = [];
    const chart = createStoryChart({
      mount,
      toast: {
        type: "column",
        data: {
          categories: ["Jan", "Feb", "Mar"],
          series: [{ name: "cuts", data: [10, 20, 30] }],
        },
        options: {
          theme: {
            series: {
              colors: ["#ffa028"],
            },
          },
        },
        chartFactory: (): ToastChartInstance => ({
          setData: (data) => setDataCalls.push(data),
          setOptions: (options) => setOptionsCalls.push(options as Record<string, unknown>),
        }),
      },
      states: {
        focusFeb: {
          highlights: [{ kind: "byCategory", categories: ["Feb"], color: "#000000", priority: 1 }],
        },
      },
    });

    await chart.applyState("focusFeb");

    expect(setDataCalls.at(-1)?.series[0]).toMatchObject({
      colorByCategories: true,
    });
    expect((setOptionsCalls.at(-1)?.theme as { series?: { colors?: string[] } } | undefined)?.series?.colors).toEqual([
      "#ffa028",
      "#000000",
      "#ffa028",
    ]);
    expect(mount.querySelector(".sc-layer-highlights")?.children).toHaveLength(0);

    chart.destroy();
    mount.remove();
  });
});
