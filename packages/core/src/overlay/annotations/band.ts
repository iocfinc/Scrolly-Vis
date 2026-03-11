import type { AnchorBox } from "../../geometry/GeometryRegistry";
import type { AnnotationSpec, ToastData } from "../../types";

export function renderBand(
  ann: Extract<AnnotationSpec, { type: "band" }>,
  plotBox: AnchorBox,
  data: ToastData,
): HTMLElement {
  const el = document.createElement("div");
  el.className = `sc-annotation sc-band ${ann.style?.className ?? ""}`.trim();
  el.style.position = "absolute";
  const [a, b] = ann.range;

  if (ann.axis === "x") {
    const idxA = asCategoryIndex(a, data);
    const idxB = asCategoryIndex(b, data);
    const start = Math.min(idxA, idxB);
    const end = Math.max(idxA, idxB);
    const bandW = plotBox.w / Math.max(1, data.categories.length);
    el.style.left = `${plotBox.x + start * bandW}px`;
    el.style.top = `${plotBox.y}px`;
    el.style.width = `${Math.max(bandW, (end - start + 1) * bandW)}px`;
    el.style.height = `${plotBox.h}px`;
  } else {
    const max = Math.max(
      1,
      ...data.series.flatMap((s) => s.data.map((d) => (typeof d === "number" ? d : 0))),
    );
    const na = typeof a === "number" ? a : Number(a);
    const nb = typeof b === "number" ? b : Number(b);
    const topVal = Math.max(na, nb);
    const bottomVal = Math.min(na, nb);
    const top = plotBox.y + plotBox.h - (topVal / max) * plotBox.h;
    const bottom = plotBox.y + plotBox.h - (bottomVal / max) * plotBox.h;
    el.style.left = `${plotBox.x}px`;
    el.style.top = `${top}px`;
    el.style.width = `${plotBox.w}px`;
    el.style.height = `${Math.max(2, bottom - top)}px`;
  }

  el.style.background = ann.style?.background ?? "rgba(247,59,169,0.15)";
  if (ann.style?.borderColor) {
    el.style.border = `1px solid ${ann.style.borderColor}`;
  }
  return el;
}

function asCategoryIndex(v: number | string, data: ToastData): number {
  if (typeof v === "number") return v;
  const idx = data.categories.indexOf(v);
  return idx >= 0 ? idx : 0;
}
