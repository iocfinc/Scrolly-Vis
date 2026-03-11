// @vitest-environment jsdom
import { describe, expect, test } from "vitest";
import { OverlayEngine } from "../src/overlay/OverlayEngine";
import { GeometryRegistry } from "../src/geometry/GeometryRegistry";

describe("OverlayEngine visibility", () => {
  test("hides desktop-only annotation on mobile", () => {
    const host = document.createElement("div");
    const engine = new OverlayEngine(host);
    const g = new GeometryRegistry();
    g.set({
      plotBox: { x: 0, y: 0, w: 300, h: 100 },
      bars: { s: [{ x: 10, y: 10, w: 20, h: 60 }] },
      points: { s: [{ x: 20, y: 10 }] },
    });

    engine.renderAnnotations({
      annotations: [
        {
          id: "a",
          type: "label",
          anchor: { kind: "dataPoint", series: "s", index: 0 },
          text: "Desktop only",
          visibleOn: { mobile: false, desktop: true },
        },
      ],
      geometry: g,
      data: { categories: ["Jan"], series: [{ name: "s", data: [1] }] },
      viewportWidth: 375,
    });

    expect(host.querySelectorAll(".sc-annotation")).toHaveLength(0);
  });
});
