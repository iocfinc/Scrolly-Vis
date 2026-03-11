import type { AnchorPoint } from "../../geometry/GeometryRegistry";
import type { AnnotationSpec } from "../../types";

export function renderLabel(ann: Extract<AnnotationSpec, { type: "label" }>, anchor: AnchorPoint): HTMLElement {
  const el = document.createElement("div");
  el.className = `sc-annotation sc-label ${ann.style?.className ?? ""}`.trim();
  el.style.position = "absolute";
  const ox = ann.offset?.x ?? 0;
  const oy = ann.offset?.y ?? 0;
  el.style.left = `${anchor.x + ox}px`;
  el.style.top = `${anchor.y + oy}px`;
  el.style.transform = "translate(-50%, -50%)";
  if (ann.style?.background) el.style.background = ann.style.background;
  if (ann.style?.color) el.style.color = ann.style.color;
  el.textContent = ann.text;
  return el;
}
