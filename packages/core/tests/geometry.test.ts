import { describe, expect, test } from "vitest";
import { GeometryRegistry } from "../src/geometry/GeometryRegistry";
import type { ToastData } from "../src/types";

const data: ToastData = {
  categories: ["2025-01", "2025-06", "2026-01"],
  series: [{ name: "jobCuts", data: [10, 30, 20] }],
};

describe("GeometryRegistry", () => {
  test("resolves bar index anchor", () => {
    const g = new GeometryRegistry();
    g.set({
      plotBox: { x: 10, y: 20, w: 300, h: 120 },
      bars: {
        jobCuts: [
          { x: 10, y: 90, w: 20, h: 50 },
          { x: 60, y: 60, w: 20, h: 80 },
          { x: 110, y: 70, w: 20, h: 70 },
        ],
      },
      points: { jobCuts: [] },
    });

    expect(g.resolveAnchor({ kind: "dataPoint", series: "jobCuts", index: 1 }, data)).toEqual({ x: 70, y: 60 });
  });

  test("resolves category anchor", () => {
    const g = new GeometryRegistry();
    g.set({
      plotBox: { x: 0, y: 0, w: 300, h: 120 },
      bars: { jobCuts: [] },
      points: { jobCuts: [{ x: 20, y: 100 }, { x: 80, y: 70 }, { x: 150, y: 40 }] },
    });

    expect(g.resolveAnchor({ kind: "category", category: "2026-01", series: "jobCuts" }, data)).toEqual({ x: 150, y: 40 });
  });

  test("resolves value anchor on y axis", () => {
    const g = new GeometryRegistry();
    g.set({
      plotBox: { x: 10, y: 10, w: 200, h: 100 },
      bars: {},
      points: {},
    });

    expect(g.resolveAnchor({ kind: "value", axis: "y", value: 15 }, data)).toEqual({ x: 110, y: 60 });
  });

  test("resolves plot-relative anchors against the plot box", () => {
    const g = new GeometryRegistry();
    g.set({
      plotBox: { x: 20, y: 40, w: 300, h: 200 },
      bars: {},
      points: {},
    });

    expect(g.resolveAnchor({ kind: "plotPercent", x: 50, y: 25 }, data)).toEqual({ x: 170, y: 90 });
  });
});
