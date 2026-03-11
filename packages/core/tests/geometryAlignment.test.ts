// @vitest-environment jsdom
import { describe, expect, test } from "vitest";
import { createStoryChart } from "../src/StoryChart";
import { ToastAdapter } from "../src/adapters/ToastAdapter";
import type { ToastChartInstance, ToastData } from "../src/types";

function ensureDomGeometryPolyfills(): void {
  if (!(globalThis as unknown as { DOMPoint?: unknown }).DOMPoint) {
    class PolyfillDOMPoint {
      x: number;
      y: number;

      constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
      }

      matrixTransform(m: Record<string, number>): PolyfillDOMPoint {
        const a = m.a ?? 1;
        const b = m.b ?? 0;
        const c = m.c ?? 0;
        const d = m.d ?? 1;
        const e = m.e ?? 0;
        const f = m.f ?? 0;
        return new PolyfillDOMPoint(a * this.x + c * this.y + e, b * this.x + d * this.y + f);
      }
    }
    (globalThis as unknown as { DOMPoint: typeof PolyfillDOMPoint }).DOMPoint = PolyfillDOMPoint;
  }

  const w = globalThis as unknown as { SVGGraphicsElement?: unknown; SVGElement?: unknown };
  if (!w.SVGGraphicsElement && w.SVGElement) {
    w.SVGGraphicsElement = w.SVGElement;
  }
}

describe("Geometry alignment regressions", () => {
  test("mounts overlay under chart host so overlay/chart share origin", () => {
    const mount = document.createElement("div");
    document.body.appendChild(mount);

    const chart = createStoryChart({
      mount,
      toast: {
        type: "bar",
        data: {
          categories: ["2026-01"],
          series: [{ name: "cuts", data: [108435] }],
        },
        options: {},
        chartFactory: ({ el }): ToastChartInstance => ({
          destroy: () => el.replaceChildren(),
        }),
      },
    });

    const overlay = mount.querySelector(".sc-overlay-root");
    expect(overlay).toBeTruthy();
    expect(overlay?.parentElement?.classList.contains("sc-chart-host")).toBe(true);
    expect(overlay?.parentElement).not.toBe(mount);

    chart.destroy();
    mount.remove();
  });

  test("prefers rendered SVG bar geometry over inferred category spacing", async () => {
    ensureDomGeometryPolyfills();

    const mount = document.createElement("div");
    document.body.appendChild(mount);

    const data: ToastData = {
      categories: ["2026-01"],
      series: [{ name: "cuts", data: [108435] }],
    };

    const adapter = new ToastAdapter({
      type: "bar",
      mount,
      data,
      options: {},
      chartFactory: ({ el }): ToastChartInstance => {
        const svgNs = "http://www.w3.org/2000/svg";
        const plotArea = document.createElement("div");
        plotArea.className = "toastui-chart-plot-area";
        plotArea.getBoundingClientRect = () =>
          ({ left: 100, top: 50, width: 320, height: 220 } as DOMRect);
        el.appendChild(plotArea);

        const svg = document.createElementNS(svgNs, "svg");
        const background = document.createElementNS(svgNs, "rect");
        background.setAttribute("fill", "#ffffff");
        (background as unknown as SVGGraphicsElement).getBBox = () =>
          ({ x: 0, y: 0, width: 320, height: 220 } as DOMRect);
        (background as unknown as SVGGraphicsElement).getScreenCTM = () =>
          ({ a: 1, b: 0, c: 0, d: 1, e: 100, f: 50 } as DOMMatrix);
        svg.appendChild(background);

        const bar = document.createElementNS(svgNs, "rect");
        bar.setAttribute("fill", "#ffa028");
        (bar as unknown as SVGGraphicsElement).getBBox = () =>
          ({ x: 10, y: 20, width: 30, height: 100 } as DOMRect);
        (bar as unknown as SVGGraphicsElement).getScreenCTM = () =>
          ({ a: 1, b: 0, c: 0, d: 1, e: 120, f: 80 } as DOMMatrix);
        svg.appendChild(bar);
        el.appendChild(svg);

        return {};
      },
    });

    const chartEl = adapter.getChartElement();
    chartEl.getBoundingClientRect = () =>
      ({ left: 40, top: 20, width: 500, height: 400 } as DOMRect);

    await adapter.refreshGeometry();
    const snapshot = adapter.getGeometryRegistry().getSnapshot();
    const bar = snapshot.bars.cuts?.[0];

    expect(bar).toBeTruthy();
    // x = (10 + 120) - 40, y = (20 + 80) - 20
    expect(bar?.x).toBe(90);
    expect(bar?.y).toBe(80);
    expect(bar?.w).toBe(30);
    expect(bar?.h).toBe(100);
    expect(snapshot.points.cuts?.[0]).toEqual({ x: 105, y: 80 });

    adapter.destroy();
    mount.remove();
  });

  test("prefers chart-provided plot box over DOM plot-area queries", async () => {
    ensureDomGeometryPolyfills();

    const mount = document.createElement("div");
    document.body.appendChild(mount);

    const data: ToastData = {
      categories: ["2026-01"],
      series: [{ name: "cuts", data: [108435] }],
    };

    const adapter = new ToastAdapter({
      type: "bar",
      mount,
      data,
      options: {},
      chartFactory: ({ el }): ToastChartInstance => {
        const svgNs = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNs, "svg");
        const bar = document.createElementNS(svgNs, "rect");
        bar.setAttribute("fill", "#ffa028");
        (bar as unknown as SVGGraphicsElement).getBBox = () =>
          ({ x: 10, y: 20, width: 30, height: 100 } as DOMRect);
        (bar as unknown as SVGGraphicsElement).getScreenCTM = () =>
          ({ a: 1, b: 0, c: 0, d: 1, e: 120, f: 80 } as DOMMatrix);
        svg.appendChild(bar);
        el.appendChild(svg);

        return {
          getPlotBox: () => ({ x: 60, y: 30, width: 320, height: 220 }),
        };
      },
    });

    const chartEl = adapter.getChartElement();
    chartEl.getBoundingClientRect = () =>
      ({ left: 40, top: 20, width: 500, height: 400 } as DOMRect);

    await adapter.refreshGeometry();
    const snapshot = adapter.getGeometryRegistry().getSnapshot();

    expect(snapshot.plotBox).toEqual({ x: 60, y: 30, w: 320, h: 220 });

    adapter.destroy();
    mount.remove();
  });

  test("fallback column geometry honors a non-zero value-axis minimum", async () => {
    const mount = document.createElement("div");
    document.body.appendChild(mount);

    const adapter = new ToastAdapter({
      type: "column",
      mount,
      data: {
        categories: ["2026-01"],
        series: [{ name: "cuts", data: [12] }],
      },
      options: {},
      chartFactory: (): ToastChartInstance =>
        ({
          getPlotBox: () => ({ x: 60, y: 30, width: 320, height: 220 }),
          store: {
            state: {
              scale: {
                yAxis: {
                  limit: { min: 10, max: 20 },
                },
              },
            },
          },
        }) as unknown as ToastChartInstance,
    });

    await adapter.refreshGeometry();
    const bar = adapter.getGeometryRegistry().getSnapshot().bars.cuts?.[0];

    expect(bar).toBeTruthy();
    expect(bar?.h).toBeCloseTo(44, 5);
    expect(bar?.y).toBeCloseTo(206, 5);

    adapter.destroy();
    mount.remove();
  });
});
