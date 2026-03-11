import { GeometryRegistry, type GeometrySnapshot } from "../geometry/GeometryRegistry";
import type { ChartType, ToastChartFactory, ToastChartInstance, ToastData, ToastOptions } from "../types";

function fallbackFactory(args: {
  type: ChartType;
  el: HTMLElement;
  data: ToastData;
  options: ToastOptions;
}): ToastChartInstance {
  const w = window as unknown as {
    toastui?: {
      Chart?: Record<
        string,
        | ((args: { el: HTMLElement; data: ToastData; options: ToastOptions }) => ToastChartInstance)
        | { new (args: { el: HTMLElement; data: ToastData; options: ToastOptions }): ToastChartInstance }
      >;
    };
  };
  const methodName = {
    bar: "barChart",
    column: "columnChart",
    line: "lineChart",
    area: "areaChart",
  }[args.type];
  const entry = w.toastui?.Chart?.[methodName];
  if (!entry) {
    throw new Error("Toast UI chartFactory missing. Pass toast.chartFactory in StoryChartSpec.");
  }
  if (typeof entry === "function" && entry.prototype?.constructor === entry) {
    return new (entry as new (args: { el: HTMLElement; data: ToastData; options: ToastOptions }) => ToastChartInstance)({
      el: args.el,
      data: args.data,
      options: args.options,
    });
  }
  return (entry as (args: { el: HTMLElement; data: ToastData; options: ToastOptions }) => ToastChartInstance)({
    el: args.el,
    data: args.data,
    options: args.options,
  });
}

export class ToastAdapter {
  private readonly chart: ToastChartInstance;
  private readonly chartEl: HTMLElement;
  private readonly geometry = new GeometryRegistry();
  private readonly type: ChartType;
  private data: ToastData;
  private options: ToastOptions;

  constructor(args: {
    type: ChartType;
    mount: HTMLElement;
    data: ToastData;
    options: ToastOptions;
    chartFactory?: ToastChartFactory;
  }) {
    this.type = args.type;
    this.data = args.data;
    this.options = args.options;
    const canvasHost = document.createElement("div");
    canvasHost.className = "sc-chart-host";
    canvasHost.style.position = "relative";
    canvasHost.style.width = "100%";
    canvasHost.style.height = "100%";
    args.mount.appendChild(canvasHost);
    this.chartEl = canvasHost;
    this.chart = (args.chartFactory ?? fallbackFactory)({
      type: args.type,
      el: canvasHost,
      data: args.data,
      options: args.options,
    });
  }

  getGeometryRegistry(): GeometryRegistry {
    return this.geometry;
  }

  getChartElement(): HTMLElement {
    return this.chartEl;
  }

  getData(): ToastData {
    return this.data;
  }

  getOptions(): ToastOptions {
    return this.options;
  }

  setData(data: ToastData): void {
    this.data = data;
    this.chart.setData?.(data);
  }

  setOptions(options: ToastOptions): void {
    this.options = options;
    if (this.chart.updateOptions) {
      this.chart.updateOptions(options);
      return;
    }
    this.chart.setOptions?.(options);
  }

  async refreshGeometry(): Promise<void> {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    this.geometry.set(this.readGeometryFallback());
  }

  resize(): void {
    this.chart.resize?.();
  }

  destroy(): void {
    this.chart.destroy?.();
    this.chartEl.remove();
  }

  private readGeometryFallback(): GeometrySnapshot {
    const rootRect = this.chartEl.getBoundingClientRect();
    const plotRect = this.readPlotRect(rootRect);

    const bars: GeometrySnapshot["bars"] = {};
    const points: GeometrySnapshot["points"] = {};
    const seriesCount = this.data.series.length;
    const categoryCount = this.data.categories.length;
    const expectedCount = categoryCount * Math.max(1, seriesCount);
    const renderedBars =
      this.type === "bar" || this.type === "column"
        ? this.readRenderedBars(rootRect, plotRect, expectedCount)
        : null;
    const renderedPoints =
      this.type === "line" || this.type === "area" ? this.readRenderedPoints(rootRect, plotRect) : null;
    const valueAxisLimit = this.readValueAxisLimit();

    this.data.series.forEach((series, seriesIdx) => {
      const seriesBars: GeometrySnapshot["bars"][string] = [];
      const seriesPoints: GeometrySnapshot["points"][string] = [];

      if ((this.type === "bar" || this.type === "column") && renderedBars && renderedBars.length === categoryCount * seriesCount) {
        const bySeries = renderedBars.filter((_, i) => i % seriesCount === seriesIdx);
        bySeries.forEach((box) => {
          seriesBars.push(box);
          seriesPoints.push({ x: box.x + box.w / 2, y: box.y });
        });
      } else if ((this.type === "line" || this.type === "area") && renderedPoints && renderedPoints.length >= categoryCount) {
        const bySeries = renderedPoints.filter((_, i) => i % seriesCount === seriesIdx).slice(0, categoryCount);
        bySeries.forEach((p) => {
          seriesPoints.push(p);
          seriesBars.push({ x: p.x - 2, y: p.y - 2, w: 4, h: 4 });
        });
      } else {
        // Deterministic fallback if rendered geometry cannot be read.
        const band = plotRect.w / Math.max(1, categoryCount);
        const itemW = Math.max(4, (band * 0.7) / Math.max(1, seriesCount));
        series.data.forEach((raw, idx) => {
          const n = typeof raw === "number" ? raw : 0;
          const x = plotRect.x + idx * band + (band * 0.15 + seriesIdx * itemW);
          const { y, h } = this.projectColumnValue(n, plotRect, valueAxisLimit);
          seriesBars.push({ x, y, w: itemW, h });
          seriesPoints.push({ x: x + itemW / 2, y });
        });
      }

      bars[series.name] = seriesBars;
      points[series.name] = seriesPoints;
    });

    return { plotBox: plotRect, bars, points };
  }

  private readValueAxisLimit(): { min: number; max: number } | null {
    const chartWithStore = this.chart as ToastChartInstance & {
      store?: { state?: { scale?: { xAxis?: { limit?: { min?: number; max?: number } }; yAxis?: { limit?: { min?: number; max?: number } } } } };
    };
    const axisName = this.type === "bar" ? "xAxis" : "yAxis";
    const limit = chartWithStore.store?.state?.scale?.[axisName]?.limit;
    if (!limit) return null;
    const { min, max } = limit;
    if (typeof min !== "number" || !Number.isFinite(min) || typeof max !== "number" || !Number.isFinite(max) || max === min) {
      return null;
    }
    return { min, max };
  }

  private projectColumnValue(
    value: number,
    plotRect: { x: number; y: number; w: number; h: number },
    limit: { min: number; max: number } | null,
  ): { y: number; h: number } {
    if (!limit) {
      const globalMax = Math.max(
        1,
        ...this.data.series.flatMap((s) => s.data.map((d) => (typeof d === "number" ? d : 0))),
      );
      const h = (value / globalMax) * plotRect.h;
      return { y: plotRect.y + plotRect.h - h, h };
    }

    const { min, max } = limit;
    const ratio = plotRect.h / (max - min);
    const basePosition =
      min <= 0 && max >= 0
        ? plotRect.h - ((0 - min) / (max - min)) * plotRect.h
        : min > 0
          ? plotRect.h
          : 0;

    let calibrated = value;
    if (value >= 0) {
      if (min > 0) calibrated = Math.max(value - min, 0);
      if (value > max) calibrated -= value - max;
    } else {
      if (calibrated >= max) calibrated = 0;
      else {
        if (max < 0) calibrated = Math.min(value - max, 0);
        if (value < min) calibrated -= value - min;
      }
    }

    const h = Math.max(Math.abs(calibrated) * ratio, 0);
    const localY = value < 0 ? basePosition : basePosition - h;
    return { y: plotRect.y + localY, h };
  }

  private readPlotRect(rootRect: DOMRect): { x: number; y: number; w: number; h: number } {
    const fromChart = this.chart.getPlotBox?.();
    const normalized = this.normalizePlotRect(fromChart);
    if (normalized) return normalized;

    const chartWithStore = this.chart as ToastChartInstance & {
      store?: { state?: { layout?: { plot?: { x?: number; y?: number; width?: number; height?: number } } } };
    };
    const storePlot = chartWithStore.store?.state?.layout?.plot;
    const fromStore = this.normalizePlotRect(storePlot);
    if (fromStore) return fromStore;

    return this.findPlotRect(rootRect);
  }

  private normalizePlotRect(
    plot:
      | { x?: number; y?: number; width?: number; height?: number; w?: number; h?: number }
      | null
      | undefined,
  ): { x: number; y: number; w: number; h: number } | null {
    if (!plot) return null;
    const x = plot.x;
    const y = plot.y;
    const w = plot.w ?? plot.width;
    const h = plot.h ?? plot.height;
    if (
      typeof x !== "number" ||
      !Number.isFinite(x) ||
      typeof y !== "number" ||
      !Number.isFinite(y) ||
      typeof w !== "number" ||
      !Number.isFinite(w) ||
      typeof h !== "number" ||
      !Number.isFinite(h)
    ) {
      return null;
    }
    return { x, y, w, h };
  }

  private readRenderedBars(
    rootRect: DOMRect,
    plotRect: { x: number; y: number; w: number; h: number },
    expectedCount: number,
  ): Array<{ x: number; y: number; w: number; h: number }> {
    const svg = this.chartEl.querySelector("svg");
    if (!svg) return [];
    const nodes = svg.querySelectorAll("rect, path");
    const out: Array<{ x: number; y: number; w: number; h: number }> = [];

    nodes.forEach((node) => {
      const n = node as unknown as SVGGraphicsElement;
      if (typeof n.getBBox !== "function" || typeof n.getScreenCTM !== "function") return;
      let bb: DOMRect;
      const ctm = n.getScreenCTM();
      if (!ctm) return;
      try {
        bb = n.getBBox();
      } catch {
        return;
      }
      if (bb.width < 1 || bb.height < 1) return;
      const fillAttr = (n as Element).getAttribute("fill");
      const fillStyle = window.getComputedStyle(n).fill;
      const fill = (fillAttr && fillAttr !== "none" ? fillAttr : fillStyle) ?? "";
      if (!fill || fill === "none" || fill === "transparent" || fill === "rgba(0, 0, 0, 0)") return;
      const p1 = new DOMPoint(bb.x, bb.y).matrixTransform(ctm);
      const p2 = new DOMPoint(bb.x + bb.width, bb.y + bb.height).matrixTransform(ctm);
      const x = Math.min(p1.x, p2.x) - rootRect.left;
      const y = Math.min(p1.y, p2.y) - rootRect.top;
      const w = Math.abs(p2.x - p1.x);
      const h = Math.abs(p2.y - p1.y);
      const cx = x + w / 2;
      if (cx < plotRect.x - 2 || cx > plotRect.x + plotRect.w + 2) return;
      if (y + h < plotRect.y - 2 || y > plotRect.y + plotRect.h + 2) return;
      if (w > plotRect.w * 0.85 && h > plotRect.h * 0.85) return;
      out.push({ x, y, w, h });
    });
    const sorted = out.sort((a, b) => a.x - b.x);
    if (sorted.length <= expectedCount) return sorted;
    return sorted.slice(sorted.length - expectedCount);
  }

  private readRenderedPoints(
    rootRect: DOMRect,
    plotRect: { x: number; y: number; w: number; h: number },
  ): Array<{ x: number; y: number }> {
    const svg = this.chartEl.querySelector("svg");
    if (!svg) return [];
    const nodes = svg.querySelectorAll("circle");
    const out: Array<{ x: number; y: number }> = [];

    nodes.forEach((node) => {
      const n = node as SVGCircleElement;
      const ctm = n.getScreenCTM();
      if (!ctm) return;
      const cx = Number(n.getAttribute("cx"));
      const cy = Number(n.getAttribute("cy"));
      if (!Number.isFinite(cx) || !Number.isFinite(cy)) return;
      const p = new DOMPoint(cx, cy).matrixTransform(ctm);
      const x = p.x - rootRect.left;
      const y = p.y - rootRect.top;
      if (x < plotRect.x - 2 || x > plotRect.x + plotRect.w + 2) return;
      if (y < plotRect.y - 2 || y > plotRect.y + plotRect.h + 2) return;
      out.push({ x, y });
    });

    return out.sort((a, b) => a.x - b.x);
  }

  private findPlotRect(rootRect: DOMRect): { x: number; y: number; w: number; h: number } {
    const plotNode = this.chartEl.querySelector(".toastui-chart-plot-area") as HTMLElement | null;
    if (!plotNode) {
      return {
        x: 0,
        y: 0,
        w: rootRect.width,
        h: rootRect.height,
      };
    }
    const r = plotNode.getBoundingClientRect();
    return {
      x: r.left - rootRect.left,
      y: r.top - rootRect.top,
      w: r.width,
      h: r.height,
    };
  }
}
