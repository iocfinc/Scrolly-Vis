import type { AnchorRef, ToastData } from "../types";

export type AnchorBox = { x: number; y: number; w: number; h: number };
export type AnchorPoint = { x: number; y: number };

export type GeometrySnapshot = {
  plotBox: AnchorBox;
  bars: Record<string, AnchorBox[]>;
  points: Record<string, AnchorPoint[]>;
};

export class GeometryRegistry {
  private snapshot: GeometrySnapshot = {
    plotBox: { x: 0, y: 0, w: 0, h: 0 },
    bars: {},
    points: {},
  };

  set(snapshot: GeometrySnapshot): void {
    this.snapshot = snapshot;
  }

  getSnapshot(): GeometrySnapshot {
    return this.snapshot;
  }

  resolveAnchor(anchor: AnchorRef, data: ToastData): AnchorPoint | null {
    if (anchor.kind === "plotPercent") {
      const { plotBox } = this.snapshot;
      return {
        x: plotBox.x + (plotBox.w * anchor.x) / 100,
        y: plotBox.y + (plotBox.h * anchor.y) / 100,
      };
    }

    if (anchor.kind === "pixel") {
      return { x: anchor.x, y: anchor.y };
    }

    if (anchor.kind === "dataPoint") {
      const seriesName = anchor.series ?? data.series[0]?.name;
      if (!seriesName) return null;
      const pt = this.snapshot.points[seriesName]?.[anchor.index];
      if (pt) return pt;
      const box = this.snapshot.bars[seriesName]?.[anchor.index];
      return box ? { x: box.x + box.w / 2, y: box.y } : null;
    }

    if (anchor.kind === "category") {
      const idx = data.categories.findIndex((c) => c === anchor.category);
      if (idx === -1) return null;
      const seriesName = anchor.series ?? data.series[0]?.name;
      if (!seriesName) return null;
      const pt = this.snapshot.points[seriesName]?.[idx];
      if (pt) return pt;
      const box = this.snapshot.bars[seriesName]?.[idx];
      return box ? { x: box.x + box.w / 2, y: box.y } : null;
    }

    if (anchor.kind === "value") {
      const { plotBox } = this.snapshot;
      if (anchor.axis === "x") {
        const idx = typeof anchor.value === "string" ? data.categories.indexOf(anchor.value) : Number(anchor.value);
        if (idx < 0 || data.categories.length <= 1) return null;
        const step = plotBox.w / (data.categories.length - 1 || 1);
        return { x: plotBox.x + idx * step, y: plotBox.y + plotBox.h / 2 };
      }
      const max = Math.max(
        1,
        ...data.series.flatMap((s) => s.data.map((d) => (typeof d === "number" ? d : 0))),
      );
      const yVal = typeof anchor.value === "number" ? anchor.value : Number(anchor.value);
      const ratio = Math.max(0, Math.min(1, yVal / max));
      return { x: plotBox.x + plotBox.w / 2, y: plotBox.y + plotBox.h - ratio * plotBox.h };
    }

    return null;
  }
}
